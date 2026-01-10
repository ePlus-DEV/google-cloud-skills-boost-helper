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

  // Detect if running in local environment
  private isLocalEnvironment =
    import.meta.env.MODE === "development" ||
    import.meta.env.DEV === true ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Local config store for development
  private localConfigStore: Record<string, string | boolean | number> = {};

  /**
   * Get Firebase configuration from environment variables
   * Always read from environment variables regardless of environment
   */
  private getFirebaseConfig(): FirebaseConfig {
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
  private readonly defaultConfig: FirebaseConfig = this.getFirebaseConfig();

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
  private getDefaultValues(): RemoteConfigDefaults {
    const nextSeasonDeadline = FirebaseService.getNextSeasonDeadline();
    const defaultArcadeDeadline =
      import.meta.env.WXT_COUNTDOWN_DEADLINE_ARCADE || nextSeasonDeadline;
    const defaultFacilitatorDeadline =
      import.meta.env.WXT_COUNTDOWN_DEADLINE_FACILITATOR || nextSeasonDeadline;

    return {
      countdown_deadline_facilitator: defaultFacilitatorDeadline,
      countdown_enabled_facilitator:
        import.meta.env.WXT_COUNTDOWN_ENABLED_FACILITATOR || "true",
      countdown_deadline_arcade: defaultArcadeDeadline,
      countdown_enabled_arcade:
        import.meta.env.WXT_COUNTDOWN_ENABLED_ARCADE || "true",
    };
  }

  /**
   * Default Remote Config values
   */
  private readonly defaultValues: RemoteConfigDefaults =
    this.getDefaultValues();

  /**
   * Initialize Firebase and Remote Config
   */
  async initialize(config?: Partial<FirebaseConfig>): Promise<void> {
    try {
      if (this.initialized) {
        return;
      }

      // In local environment, use local store instead of Firebase
      if (this.isLocalEnvironment) {
        console.info(
          "🔧 FirebaseService: Running in LOCAL environment, using local config store"
        );
        // Initialize local store with default values
        this.localConfigStore = { ...this.defaultValues };
        this.initialized = true;
        return;
      }

      // Use provided config or default
      const firebaseConfig = { ...this.defaultConfig, ...config };

      // Quick debug output to help diagnose missing env values
      console.debug(
        "FirebaseService: initializing with config:",
        firebaseConfig
      );

      // If required keys are missing, skip initialization and keep using defaults
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        console.warn(
          "FirebaseService: apiKey or projectId missing; skipping Firebase initialization and using default Remote Config values."
        );
        this.initialized = false;
        return;
      }

      // Initialize Firebase App
      this.app = initializeApp(firebaseConfig);

      // Initialize Remote Config
      this.remoteConfig = getRemoteConfig(this.app);

      // Set default values. Assign to `defaultConfig` property which works
      // with the bundled SDK used by the build. Use ts-ignore because the
      // typed API may not expose this property in all versions.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.remoteConfig.defaultConfig = this.defaultValues;

      // Configure Remote Config settings
      this.remoteConfig.settings = {
        minimumFetchIntervalMillis: Number.parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_INTERVAL_MS || "3600000"
        ), // 1 hour
        fetchTimeoutMillis: Number.parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_TIMEOUT_MS || "60000"
        ), // 1 minute
      };

      this.initialized = true;

      // Fetch initial config
      await this.fetchConfig();
    } catch (error) {
      console.error("❌ Failed to initialize Firebase:", error);
      // Continue with default values even if Firebase fails
      this.initialized = false;
    }
  }

  /**
   * Fetch and activate Remote Config
   */
  async fetchConfig(): Promise<boolean> {
    try {
      if (!this.remoteConfig) {
        return false;
      }

      const activated = await fetchAndActivate(this.remoteConfig);

      return activated;
    } catch (error) {
      console.error("❌ Failed to fetch Remote Config:", error);
      return false;
    }
  }

  /**
   * Refresh (fetch & activate) and return whether activation succeeded
   */
  async refreshConfig(): Promise<boolean> {
    return this.fetchConfig();
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
          deadline
        );
        return deadline || this.defaultValues.countdown_deadline_facilitator;
      }

      // If Firebase is not initialized, use default
      if (!this.initialized || !this.remoteConfig) {
        console.debug(
          "FirebaseService: Not initialized, using default countdown_deadline_facilitator"
        );
        return this.defaultValues.countdown_deadline_facilitator;
      }

      // Fetch remote config to ensure we have the latest values
      await this.fetchConfig();

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
          deadline
        );
        return deadline;
      }

      // Otherwise use default
      console.debug(
        "FirebaseService: Using default countdown_deadline_facilitator (source:",
        source,
        ")"
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
          result
        );
        return result;
      }

      // If Firebase is not initialized, use default
      if (!this.initialized || !this.remoteConfig) {
        console.debug(
          "FirebaseService: Not initialized, using default countdown_enabled_facilitator"
        );
        const defaultEnabled =
          String(this.defaultValues.countdown_enabled_facilitator) === "true";
        return defaultEnabled;
      }

      // Fetch remote config to ensure we have the latest values
      await this.fetchConfig();

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
          enabled
        );
        return enabled;
      }

      // Otherwise use default
      console.debug(
        "FirebaseService: Using default countdown_enabled_facilitator (source:",
        source,
        ")"
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
   */
  async getStringParam(key: string, fallback: string): Promise<string> {
    try {
      // In local environment, use local store
      if (this.isLocalEnvironment) {
        const value = this.localConfigStore[key] as string;
        console.debug(
          `FirebaseService: Using LOCAL ${key}:`,
          value || fallback
        );
        return value || fallback;
      }

      if (!this.initialized || !this.remoteConfig) {
        console.debug(
          `FirebaseService: Not initialized, using fallback for ${key}`
        );
        return fallback;
      }

      // Fetch remote config to ensure we have the latest values
      await this.fetchConfig();

      const val = getValue(this.remoteConfig, key);
      const source =
        typeof (val as any).getSource === "function"
          ? (val as any).getSource()
          : undefined;

      const value = val.asString();

      // Only use remote value if it exists and is from remote source
      if (value && source === "remote") {
        console.debug(`FirebaseService: Using remote ${key}:`, value);
        return value;
      }

      console.debug(
        `FirebaseService: Using fallback for ${key} (source: ${source})`
      );
      return fallback;
    } catch (e) {
      console.error(`Failed to get string param ${key}:`, e);
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
          `FirebaseService: Not initialized, using fallback for ${key}`
        );
        return fallback;
      }

      // Fetch remote config to ensure we have the latest values
      await this.fetchConfig();

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
        `FirebaseService: Using fallback for ${key} (source: ${source})`
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
        // fetchConfig will return true when activated
        await this.fetchConfig();
      }
    } catch (e) {
      // Non-fatal: leave defaults in place
      console.debug(
        "ensureRemoteValue: unable to confirm remote source for",
        key,
        e
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
        "FirebaseService: setLocalConfigValue only works in local environment"
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
        "FirebaseService: getLocalConfigStore only works in local environment"
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
        "FirebaseService: resetLocalConfig only works in local environment"
      );
      return;
    }
    this.localConfigStore = { ...this.defaultValues };
    console.info("FirebaseService: Reset local config to default values");
  }

  /**
   * Get configuration info for debugging
   */
  getConfigInfo(): {
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
        import.meta.env.WXT_FIREBASE_PROJECT_ID
    );

    return {
      source: isUsingEnv ? "environment" : "fallback",
      config: this.getFirebaseConfig(),
      settings: {
        minimumFetchIntervalMillis: Number.parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_INTERVAL_MS || "3600000"
        ),
        fetchTimeoutMillis: Number.parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_TIMEOUT_MS || "60000"
        ),
      },
      defaults: this.getDefaultValues(),
    };
  }
}

// Create and export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;
