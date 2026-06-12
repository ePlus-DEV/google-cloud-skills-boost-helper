import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getRemoteConfig,
  RemoteConfig,
  fetchAndActivate,
  getValue,
} from "firebase/remote-config";
import type { FirebaseConfig, RemoteConfigDefaults } from "../types/firebase";

/**
 * Service to handle Firebase Remote Config functionality
 */
class FirebaseService {
  private app: FirebaseApp | null = null;
  private remoteConfig: RemoteConfig | null = null;
  private initialized = false;

  // Memoization for fetches to avoid repeated fetchAndActivate calls
  private lastFetchAt: number | null = null;
  private fetchPromise: Promise<boolean> | null = null;

  // Local config store for development
  private localConfigStore: Record<string, string | boolean | number> = {};
  private forceRemoteSession = false;

  /**
   * Check if running in local environment (getter to evaluate fresh each time)
   */
  private get isLocalEnvironment(): boolean {
    const isDev =
      import.meta.env.MODE === "development" ||
      import.meta.env.DEV === true ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const forceRemote = import.meta.env.WXT_FORCE_REMOTE_CONFIG === "true";
    // Include a reference to `this` so class getter lint rule is satisfied
    console.debug(
      `[isLocalEnvironment] isDev=${isDev}, forceRemote=${forceRemote}, initialized=${this.initialized}`,
    );
    return isDev && !forceRemote && !this.forceRemoteSession;
  }

  /**
   * Get Firebase configuration from environment variables
   * Always read from environment variables regardless of environment
   */
  private static getFirebaseConfig(): FirebaseConfig {
    return {
      apiKey: import.meta.env.WXT_FIREBASE_API_KEY || "",
      authDomain: import.meta.env.WXT_FIREBASE_AUTH_DOMAIN || "",
      projectId: import.meta.env.WXT_FIREBASE_PROJECT_ID || "",
      storageBucket: import.meta.env.WXT_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: import.meta.env.WXT_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: import.meta.env.WXT_FIREBASE_APP_ID || "",
    };
  }

  /**
   * Default Firebase configuration
   * These should be replaced with your actual Firebase project configuration
   */
  private readonly defaultConfig: FirebaseConfig =
    FirebaseService.getFirebaseConfig();

  /**
   * Auto-calculate next season deadline based on current date
   * Season 1: Jan-Jun (ends June 30)
   * Season 2: Jul-Dec (ends Dec 31)
   */
  private static getNextSeasonDeadline(): string {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    // If we're in first half (Jan-Jun), deadline is June 30
    if (currentMonth <= 6) {
      return `${currentYear}-06-30T23:59:59+05:30`;
    }
    // If we're in second half (Jul-Dec), deadline is Dec 31
    return `${currentYear}-12-31T23:59:59+05:30`;
  }

  /**
   * Get default Remote Config values from environment variables
   */
  private static getDefaultValues(): RemoteConfigDefaults {
    const nextSeasonDeadline = FirebaseService.getNextSeasonDeadline();
    const defaultArcadeDeadline =
      import.meta.env.WXT_COUNTDOWN_DEADLINE_ARCADE || nextSeasonDeadline;
    const defaultFacilitatorDeadline =
      import.meta.env.WXT_COUNTDOWN_DEADLINE_FACILITATOR || nextSeasonDeadline;
    const envArcadeMilestones = import.meta.env.WXT_ARCADE_MILESTONES;
    const forceRemote = import.meta.env.WXT_FORCE_REMOTE_CONFIG === "true";
    const defaultArcadeMilestones =
      !forceRemote && envArcadeMilestones?.trim()
        ? envArcadeMilestones || ""
        : "";

    return {
      countdown_deadline_facilitator: defaultFacilitatorDeadline,
      countdown_enabled_facilitator:
        import.meta.env.WXT_COUNTDOWN_ENABLED_FACILITATOR || "true",
      countdown_deadline_arcade: defaultArcadeDeadline,
      countdown_enabled_arcade:
        import.meta.env.WXT_COUNTDOWN_ENABLED_ARCADE || "true",
      arcade_milestones: defaultArcadeMilestones,
    };
  }

  /**
   * Default Remote Config values
   */
  private readonly defaultValues: RemoteConfigDefaults =
    FirebaseService.getDefaultValues();

  /**
   * Initialize Firebase and Remote Config
   */
  async initialize(
    config?: Partial<FirebaseConfig>,
    options?: { forceRemote?: boolean },
  ): Promise<void> {
    try {
      if (options?.forceRemote) {
        this.forceRemoteSession = true;
      }

      if (this.initialized) {
        if (options?.forceRemote && !this.remoteConfig) {
          this.initialized = false;
          this.localConfigStore = {};
        } else {
          console.debug("[initialize] Already initialized, skipping...");
          return;
        }
      }

      console.debug(
        `[initialize] isLocalEnvironment=${this.isLocalEnvironment}, MODE=${import.meta.env.MODE}, FORCE_REMOTE=${import.meta.env.WXT_FORCE_REMOTE_CONFIG}`,
      );

      // In local environment, use local store instead of Firebase
      if (this.isLocalEnvironment) {
        console.info(
          "🔧 FirebaseService: Running in LOCAL environment, using local config store",
        );
        // Initialize local store with default values
        this.localConfigStore = { ...this.defaultValues };
        console.debug(
          "[initialize] Local config store initialized with:",
          this.localConfigStore,
        );
        this.initialized = true;
        return;
      }

      console.info(
        "🔗 FirebaseService: Connecting to Firebase Remote Config...",
      );

      // Use provided config or default
      const firebaseConfig = { ...this.defaultConfig, ...config };

      // Quick debug output to help diagnose missing env values
      console.debug(
        "FirebaseService: initializing with config:",
        firebaseConfig,
      );

      // If required keys are missing, skip initialization and keep using defaults
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        console.error(
          "❌ FirebaseService: apiKey or projectId missing; cannot connect to Firebase!",
          {
            apiKey: Boolean(firebaseConfig.apiKey),
            projectId: Boolean(firebaseConfig.projectId),
          },
        );
        throw new Error(
          "Firebase config incomplete - missing apiKey or projectId",
        );
      }

      // Initialize Firebase App
      console.debug("[initialize] Initializing Firebase App...");
      this.app = initializeApp(firebaseConfig);
      console.debug("[initialize] Firebase App initialized successfully");

      // Initialize Remote Config
      console.debug("[initialize] Getting Remote Config instance...");
      this.remoteConfig = getRemoteConfig(this.app);
      console.debug("[initialize] Remote Config instance obtained");

      // Set default values. Assign to `defaultConfig` property which works
      // with the bundled SDK used by the build. Use ts-ignore because the
      // typed API may not expose this property in all versions.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.remoteConfig.defaultConfig = this.defaultValues;

      console.debug("[initialize] Set defaultConfig to:", this.defaultValues);

      // Configure Remote Config settings. Keep remote/local selection separate
      // from fetch throttling; set WXT_FIREBASE_FETCH_INTERVAL_MS=0 only for
      // short development sessions that need immediate Firebase updates.
      const minInterval = Number.parseInt(
        import.meta.env.WXT_FIREBASE_FETCH_INTERVAL_MS || "900000",
      );
      this.remoteConfig.settings = {
        minimumFetchIntervalMillis: minInterval,
        fetchTimeoutMillis: Number.parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_TIMEOUT_MS || "60000",
        ),
      };

      console.debug("[initialize] Remote Config settings configured");

      this.initialized = true;
      console.debug("[initialize] Set initialized=true");

      // Fetch initial config (force during initialization)
      console.debug("[initialize] Fetching initial config...");
      await this.fetchConfig();
      this.lastFetchAt = Date.now();
      console.debug("[initialize] Initial fetch completed");
    } catch (error) {
      console.error("❌ Failed to initialize Firebase:", error);
      // In local environment, continue without Firebase
      // In remote environment, will fallback to defaults
      this.initialized = false;
      this.remoteConfig = null;
      console.warn("[initialize] Fallback: will use default values");
    }
  }

  /**
   * Fetch and activate Remote Config
   */
  async fetchConfig(): Promise<boolean> {
    try {
      if (!this.remoteConfig) {
        console.error("[fetchConfig] remoteConfig is null!");
        return false;
      }

      console.debug("[fetchConfig] Starting fetchAndActivate...");
      const activated = await fetchAndActivate(this.remoteConfig);
      console.debug("[fetchConfig] fetchAndActivate result:", activated);

      // Update last successful fetch timestamp
      this.lastFetchAt = Date.now();

      // Log all params after fetch
      const allParams = this.getAllParams();
      console.debug("[fetchConfig] All params after fetch:", allParams);

      return activated;
    } catch (error) {
      console.error("❌ [fetchConfig] Failed to fetch Remote Config:", error);
      return false;
    }
  }

  /**
   * Ensure a recent fetch — uses simple memoization so multiple callers
   * in a short time window share the same fetch instead of triggering
   * repeated network requests.
   */
  private ensureFetched(force = false): Promise<boolean> {
    if (force) return this.fetchConfig();

    const minInterval = Number.parseInt(
      import.meta.env.WXT_FIREBASE_FETCH_INTERVAL_MS || "900000",
    );

    if (this.lastFetchAt && Date.now() - this.lastFetchAt < minInterval) {
      return Promise.resolve(true); // cache still fresh
    }

    if (this.fetchPromise) return this.fetchPromise;

    this.fetchPromise = this.fetchConfig()
      .then((res) => {
        this.fetchPromise = null;
        return res;
      })
      .catch((e) => {
        this.fetchPromise = null;
        return false;
      });

    return this.fetchPromise;
  }

  /**
   * Refresh (fetch & activate) and return whether activation succeeded
   */
  refreshConfig(): Promise<boolean> {
    return this.fetchConfig();
  }

  /**
   * Alias for fetchConfig (called from popupUIService)
   */
  fetchRemoteConfig(force = false): Promise<boolean> {
    console.debug("[fetchRemoteConfig] Attempting to fetch fresh config...");
    return this.ensureFetched(force);
  }

  /**
   * Debug helper: return all known Remote Config params and their sources
   */
  getAllParams(): {
    [key: string]: { value: string | boolean | number; source?: string };
  } {
    const keys = Object.keys(this.defaultValues);
    const out: Record<
      string,
      { value: string | boolean | number; source?: string }
    > = {};

    // In local environment, return local store
    if (this.isLocalEnvironment) {
      for (const key of keys) {
        out[key] = {
          value:
            this.localConfigStore[key] ??
            ((this.defaultValues as any)[key] as string | boolean | number),
          source: "local",
        };
      }
      return out;
    }

    for (const key of keys) {
      try {
        if (!this.remoteConfig) {
          out[key] = {
            value: (this.defaultValues as any)[key],
            source: "fallback",
          };
          continue;
        }

        const val = getValue(this.remoteConfig, key);
        // Value API exposes asString/asBoolean and getSource()
        const asStr = val.asString();
        const src =
          typeof (val as any).getSource === "function"
            ? (val as any).getSource()
            : undefined;

        // Try to parse boolean-like values
        const parsed =
          asStr === "true" || asStr === "false" ? asStr === "true" : asStr;

        out[key] = { value: parsed, source: src };
      } catch (e) {
        console.error(`Error getting param ${key}:`, e);
        out[key] = { value: (this.defaultValues as any)[key], source: "error" };
      }
    }

    return out;
  }

  /**
   * Get countdown deadline from Remote Config
   */
  async getCountdownDeadline(): Promise<string> {
    try {
      // In local environment, use local store
      if (this.isLocalEnvironment) {
        const deadline = this.localConfigStore
          .countdown_deadline_facilitator as string;
        console.debug(
          "FirebaseService: Using LOCAL countdown_deadline_facilitator:",
          deadline,
        );
        return deadline || this.defaultValues.countdown_deadline_facilitator;
      }

      // If Firebase is not initialized, use default
      if (!this.initialized || !this.remoteConfig) {
        console.debug(
          "FirebaseService: Not initialized, using default countdown_deadline_facilitator",
        );
        return this.defaultValues.countdown_deadline_facilitator;
      }

      // Ensure remote config is recent (deduped by `ensureFetched`)
      await this.ensureFetched();

      const val = getValue(this.remoteConfig, "countdown_deadline_facilitator");
      const source =
        typeof (val as any).getSource === "function"
          ? (val as any).getSource()
          : undefined;

      const deadline = val.asString();

      // Only use remote value if it exists and is from remote source
      if (deadline && source === "remote") {
        console.debug(
          "FirebaseService: Using remote countdown_deadline_facilitator:",
          deadline,
        );
        return deadline;
      }

      // Otherwise use default
      console.debug(
        "FirebaseService: Using default countdown_deadline_facilitator (source:",
        source,
        ")",
      );
      return this.defaultValues.countdown_deadline_facilitator;
    } catch (error) {
      console.error("❌ Failed to get countdown deadline:", error);
      return this.defaultValues.countdown_deadline_facilitator;
    }
  }

  /**
   * Check if countdown is enabled from Remote Config
   */
  async isCountdownEnabled(): Promise<boolean> {
    try {
      // In local environment, use local store
      if (this.isLocalEnvironment) {
        const enabled = this.localConfigStore.countdown_enabled_facilitator;
        const result = String(enabled) === "true";
        console.debug(
          "FirebaseService: Using LOCAL countdown_enabled_facilitator:",
          result,
        );
        return result;
      }

      // If Firebase is not initialized, use default
      if (!this.initialized || !this.remoteConfig) {
        console.debug(
          "FirebaseService: Not initialized, using default countdown_enabled_facilitator",
        );
        const defaultEnabled =
          String(this.defaultValues.countdown_enabled_facilitator) === "true";
        return defaultEnabled;
      }

      // Ensure remote config is recent (deduped by `ensureFetched`)
      await this.ensureFetched();

      const val = getValue(this.remoteConfig, "countdown_enabled_facilitator");
      const source =
        typeof (val as any).getSource === "function"
          ? (val as any).getSource()
          : undefined;

      const enabled = val.asBoolean();

      // Only use remote value if it is from remote source
      if (source === "remote") {
        console.debug(
          "FirebaseService: Using remote countdown_enabled_facilitator:",
          enabled,
        );
        return enabled;
      }

      // Otherwise use default
      console.debug(
        "FirebaseService: Using default countdown_enabled_facilitator (source:",
        source,
        ")",
      );
      const defaultEnabled =
        String(this.defaultValues.countdown_enabled_facilitator) === "true";
      return defaultEnabled;
    } catch (error) {
      console.error("❌ Failed to get countdown enabled status:", error);
      const defaultEnabled =
        String(this.defaultValues.countdown_enabled_facilitator) === "true";
      return defaultEnabled;
    }
  }

  /**
   * Generic helper to get a string parameter from Remote Config with fallback
   * Follows same pattern as getCountdownDeadline() - always has fallback
   */
  async getStringParam(key: string, fallback: string): Promise<string> {
    try {
      console.debug(
        `[getStringParam] key=${key}, isLocalEnvironment=${this.isLocalEnvironment}, initialized=${this.initialized}`,
      );

      // In local environment, use local store
      if (this.isLocalEnvironment) {
        const value = this.localConfigStore[key] as string;
        console.debug(
          `✅ [getStringParam] Using LOCAL ${key}:`,
          value || fallback,
        );
        return value || fallback;
      }

      // If Firebase is NOT initialized, use fallback
      if (!this.initialized || !this.remoteConfig) {
        console.debug(
          `[getStringParam] Firebase not initialized, using fallback for ${key}`,
        );
        return fallback;
      }

      // Ensure remote config is recent (deduped by `ensureFetched`)
      console.debug(
        `[getStringParam] Ensuring recent remote config for ${key}...`,
      );
      await this.ensureFetched();

      const val = getValue(this.remoteConfig, key);
      console.debug(`[getStringParam] getValue result for ${key}:`, val);

      const source =
        typeof (val as any).getSource === "function"
          ? (val as any).getSource()
          : undefined;

      const value = val.asString();
      console.debug(
        `[getStringParam] asString result for ${key}: value="${value?.substring(0, 50)}...", source="${source}"`,
      );

      // Only use remote value if it exists and is from remote source
      if (value && source === "remote") {
        console.debug(
          `✅ [getStringParam] Using REMOTE ${key}:`,
          value.substring(0, 50),
        );
        return value;
      }

      // Otherwise use fallback
      console.debug(
        `[getStringParam] Using fallback for ${key} (source: ${source})`,
      );
      return fallback;
    } catch (e) {
      console.error(`❌ [getStringParam] Failed to get ${key}:`, e);
      return fallback;
    }
  }

  /**
   * Generic helper to get a boolean parameter from Remote Config with fallback
   */
  async getBooleanParam(key: string, fallback: boolean): Promise<boolean> {
    try {
      // In local environment, use local store
      if (this.isLocalEnvironment) {
        const value = this.localConfigStore[key];
        const result =
          value !== undefined ? String(value) === "true" : fallback;
        console.debug(`FirebaseService: Using LOCAL ${key}:`, result);
        return result;
      }

      if (!this.initialized || !this.remoteConfig) {
        console.debug(
          `FirebaseService: Not initialized, using fallback for ${key}`,
        );
        return fallback;
      }

      // Ensure remote config is recent (deduped by `ensureFetched`)
      await this.ensureFetched();

      const val = getValue(this.remoteConfig, key);
      const source =
        typeof (val as any).getSource === "function"
          ? (val as any).getSource()
          : undefined;

      const value = val.asBoolean();

      // Only use remote value if it is from remote source
      if (source === "remote") {
        console.debug(`FirebaseService: Using remote ${key}:`, value);
        return value;
      }

      console.debug(
        `FirebaseService: Using fallback for ${key} (source: ${source})`,
      );
      return fallback;
    } catch (e) {
      console.error(`Failed to get boolean param ${key}:`, e);
      return fallback;
    }
  }

  /**
   * Ensure remote config is fetched & activated if the current param isn't from remote
   */
  private async ensureRemoteValue(key: string): Promise<void> {
    if (!this.remoteConfig) return;

    try {
      const val = getValue(this.remoteConfig, key);
      const src =
        typeof (val as any).getSource === "function"
          ? (val as any).getSource()
          : undefined;

      // If the current value is not from the remote server, attempt to fetch & activate
      if (src !== "remote") {
        // Use ensureFetched so concurrent callers are deduped
        await this.ensureFetched();
      }
    } catch (e) {
      // Non-fatal: leave defaults in place
      console.debug(
        "ensureRemoteValue: unable to confirm remote source for",
        key,
        e,
      );
    }
  }

  /**
   * Get initialization status
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Update local config value (only works in local environment)
   * This is useful for testing different config values during development
   */
  setLocalConfigValue(key: string, value: string | boolean | number): void {
    if (!this.isLocalEnvironment) {
      console.warn(
        "FirebaseService: setLocalConfigValue only works in local environment",
      );
      return;
    }
    this.localConfigStore[key] = value;
    console.info(`FirebaseService: Updated local config ${key} =`, value);
  }

  /**
   * Get all local config values (only works in local environment)
   */
  getLocalConfigStore(): Record<string, string | boolean | number> {
    if (!this.isLocalEnvironment) {
      console.warn(
        "FirebaseService: getLocalConfigStore only works in local environment",
      );
      return {};
    }
    return { ...this.localConfigStore };
  }

  /**
   * Reset local config to default values (only works in local environment)
   */
  resetLocalConfig(): void {
    if (!this.isLocalEnvironment) {
      console.warn(
        "FirebaseService: resetLocalConfig only works in local environment",
      );
      return;
    }
    this.localConfigStore = { ...this.defaultValues };
    console.info("FirebaseService: Reset local config to default values");
  }

  /**
   * Get configuration info for debugging
   */
  static getConfigInfo(): {
    source: "environment" | "fallback";
    config: FirebaseConfig;
    settings: {
      minimumFetchIntervalMillis: number;
      fetchTimeoutMillis: number;
    };
    defaults: RemoteConfigDefaults;
  } {
    const isUsingEnv = Boolean(
      import.meta.env.WXT_FIREBASE_API_KEY &&
      import.meta.env.WXT_FIREBASE_PROJECT_ID,
    );

    return {
      source: isUsingEnv ? "environment" : "fallback",
      config: FirebaseService.getFirebaseConfig(),
      settings: {
        minimumFetchIntervalMillis: Number.parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_INTERVAL_MS || "900000",
        ),
        fetchTimeoutMillis: Number.parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_TIMEOUT_MS || "60000",
        ),
      },
      defaults: FirebaseService.getDefaultValues(),
    };
  }
}

// Create and export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;
