import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getRemoteConfig,
  RemoteConfig,
  fetchAndActivate,
  getValue,
  getAll,
} from "firebase/remote-config";
import type {
  FirebaseConfig,
  RemoteConfigParams,
  RemoteConfigDefaults,
  FirebaseServiceOptions,
  CountdownConfig,
  CountdownStateRefreshResult,
} from "../types/firebase";

/**
 * Service to handle Firebase Remote Config functionality
 */
class FirebaseService {
  private app: FirebaseApp | null = null;
  private remoteConfig: RemoteConfig | null = null;
  private initialized = false;

  /**
   * Get Firebase configuration from environment variables with fallbacks
   */
  private getFirebaseConfig(): FirebaseConfig {
    return {
      apiKey: import.meta.env.WXT_FIREBASE_API_KEY,
      authDomain: import.meta.env.WXT_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.WXT_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.WXT_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.WXT_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.WXT_FIREBASE_APP_ID,
    };
  }

  /**
   * Default Firebase configuration
   * These should be replaced with your actual Firebase project configuration
   */
  private defaultConfig: FirebaseConfig = this.getFirebaseConfig();

  /**
   * Get default Remote Config values from environment variables with fallbacks
   */
  private getDefaultValues(): RemoteConfigDefaults {
    return {
      countdown_deadline:
        import.meta.env.WXT_COUNTDOWN_DEADLINE || "2025-10-14T23:59:59+05:30",
      countdown_timezone: import.meta.env.WXT_COUNTDOWN_TIMEZONE || "+05:30",
      countdown_enabled: import.meta.env.WXT_COUNTDOWN_ENABLED || "true",
    };
  }

  /**
   * Default Remote Config values
   */
  private defaultValues: RemoteConfigDefaults = this.getDefaultValues();

  /**
   * Initialize Firebase and Remote Config
   */
  async initialize(config?: Partial<FirebaseConfig>): Promise<void> {
    try {
      if (this.initialized) {
        ("🔥 Firebase already initialized");
        return;
      }

      ("🔥 Initializing Firebase...");

      // Log configuration source
      const configInfo = this.getConfigInfo();
      `📋 Using ${configInfo.source} configuration`;
      if (configInfo.source === "environment") {
        ("✅ Environment variables loaded successfully");
      } else {
        ("⚠️ Using fallback configuration - check .env file");
      }

      // Use provided config or default
      const firebaseConfig = { ...this.defaultConfig, ...config };

      // Initialize Firebase App
      this.app = initializeApp(firebaseConfig);

      // Initialize Remote Config
      this.remoteConfig = getRemoteConfig(this.app);

      // Set default values
      this.remoteConfig.defaultConfig = this.defaultValues;

      // Configure Remote Config settings
      this.remoteConfig.settings = {
        minimumFetchIntervalMillis: parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_INTERVAL_MS || "3600000"
        ), // 1 hour
        fetchTimeoutMillis: parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_TIMEOUT_MS || "60000"
        ), // 1 minute
      };

      "⚙️ Remote Config settings:", this.remoteConfig.settings;

      this.initialized = true;
      ("✅ Firebase initialized successfully");

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
        console.warn("⚠️ Remote Config not initialized, using defaults");
        return false;
      }

      ("🔄 Fetching Remote Config...");

      const activated = await fetchAndActivate(this.remoteConfig);

      if (activated) {
        ("✅ Remote Config fetched and activated");
      } else {
        ("ℹ️ Using cached Remote Config values");
      }

      return activated;
    } catch (error) {
      console.error("❌ Failed to fetch Remote Config:", error);
      return false;
    }
  }

  /**
   * Get countdown deadline from Remote Config
   */
  getCountdownDeadline(): string {
    try {
      if (!this.remoteConfig) {
        console.warn("⚠️ Remote Config not available, using default deadline");
        return this.defaultValues.countdown_deadline;
      }

      const deadline = getValue(
        this.remoteConfig,
        "countdown_deadline"
      ).asString();
      "📅 Retrieved countdown deadline:", deadline;
      return deadline || this.defaultValues.countdown_deadline;
    } catch (error) {
      console.error("❌ Failed to get countdown deadline:", error);
      return this.defaultValues.countdown_deadline;
    }
  }

  /**
   * Get countdown timezone from Remote Config
   */
  getCountdownTimezone(): string {
    try {
      if (!this.remoteConfig) {
        return this.defaultValues.countdown_timezone;
      }

      const timezone = getValue(
        this.remoteConfig,
        "countdown_timezone"
      ).asString();
      return timezone || this.defaultValues.countdown_timezone;
    } catch (error) {
      console.error("❌ Failed to get countdown timezone:", error);
      return this.defaultValues.countdown_timezone;
    }
  }

  /**
   * Check if countdown is enabled from Remote Config
   */
  isCountdownEnabled(): boolean {
    try {
      if (!this.remoteConfig) {
        console.warn(
          "⚠️ Remote Config not initialized, using default (enabled)"
        );
        return true; // Default to enabled
      }

      const enabled = getValue(
        this.remoteConfig,
        "countdown_enabled"
      ).asBoolean();
      "⏰ Countdown enabled:", enabled;
      return enabled;
    } catch (error) {
      console.error("❌ Failed to get countdown enabled status:", error);
      ("🔄 Using default value (enabled) due to error");
      return true; // Default to enabled
    }
  }

  /**
   * Get all Remote Config parameters
   */
  getAllParams(): RemoteConfigParams {
    return {
      countdown_deadline: this.getCountdownDeadline(),
      countdown_timezone: this.getCountdownTimezone(),
      countdown_enabled: this.isCountdownEnabled(),
    };
  }

  /**
   * Get countdown configuration as structured object
   */
  getCountdownConfig(): CountdownConfig {
    return {
      deadline: this.getCountdownDeadline(),
      timezone: this.getCountdownTimezone(),
      enabled: this.isCountdownEnabled(),
      title: "Google Cloud Skills Boost Challenge Countdown",
    };
  }

  /**
   * Manually refresh Remote Config (for testing)
   */
  async refreshConfig(): Promise<boolean> {
    ("🔄 Manually refreshing Remote Config...");
    return await this.fetchConfig();
  }

  /**
   * Refresh Remote Config and return updated countdown state
   */
  async refreshCountdownState(): Promise<CountdownStateRefreshResult> {
    ("🔄 Refreshing countdown state from Remote Config...");

    // Get current state
    const currentState = {
      enabled: this.isCountdownEnabled(),
      deadline: this.getCountdownDeadline(),
      timezone: this.getCountdownTimezone(),
    };

    // Refresh config
    const refreshed = await this.fetchConfig();

    // Get new state
    const newState = {
      enabled: this.isCountdownEnabled(),
      deadline: this.getCountdownDeadline(),
      timezone: this.getCountdownTimezone(),
    };

    // Check if anything changed
    const changed =
      currentState.enabled !== newState.enabled ||
      currentState.deadline !== newState.deadline ||
      currentState.timezone !== newState.timezone;

    if (changed) {
      "🔄 Countdown configuration changed:",
        {
          old: currentState,
          new: newState,
        };
    } else {
      ("ℹ️ No changes in countdown configuration");
    }

    return {
      ...newState,
      changed,
    };
  }

  /**
   * Get initialization status
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get Firebase app instance
   */
  getApp(): FirebaseApp | null {
    return this.app;
  }

  /**
   * Get Remote Config instance
   */
  getRemoteConfig(): RemoteConfig | null {
    return this.remoteConfig;
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
    const isUsingEnv = !!(
      import.meta.env.WXT_FIREBASE_API_KEY &&
      import.meta.env.WXT_FIREBASE_PROJECT_ID
    );

    return {
      source: isUsingEnv ? "environment" : "fallback",
      config: this.getFirebaseConfig(),
      settings: {
        minimumFetchIntervalMillis: parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_INTERVAL_MS || "3600000"
        ),
        fetchTimeoutMillis: parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_TIMEOUT_MS || "60000"
        ),
      },
      defaults: this.getDefaultValues(),
    };
  }

  /**
   * Force set countdown enabled state (for testing only)
   * This temporarily overrides Remote Config value
   */
  private tempCountdownEnabled: boolean | null = null;

  setCountdownEnabledOverride(enabled: boolean | null): void {
    this.tempCountdownEnabled = enabled;
    `🔧 Countdown override set to: ${enabled}`;
  }

  /**
   * Check if countdown is enabled from Remote Config (with override support)
   */
  isCountdownEnabledWithOverride(): boolean {
    // Check for temporary override first
    if (this.tempCountdownEnabled !== null) {
      `🔧 Using countdown override: ${this.tempCountdownEnabled}`;
      return this.tempCountdownEnabled;
    }

    return this.isCountdownEnabled();
  }

  /**
   * Debug method to check all Remote Config values and their sources
   */
  async debugRemoteConfig(): Promise<void> {
    ("🔍 === REMOTE CONFIG DEBUG ===");

    if (!this.remoteConfig) {
      ("❌ Remote Config not initialized");
      return;
    }

    try {
      // Get all values
      const allValues = getAll(this.remoteConfig);

      ("📊 All Remote Config Values:");
      for (const [key, value] of Object.entries(allValues)) {
        `  ${key}:`;
        `    - Value: ${value.asString()}`;
        `    - Source: ${value.getSource()}`;
        if (key === "countdown_enabled") {
          `    - Boolean: ${value.asBoolean()}`;
        }
      }

      // Test specific countdown values
      ("🎯 Countdown Specific Values:");
      `  - Enabled: ${this.isCountdownEnabled()}`;
      `  - Deadline: ${this.getCountdownDeadline()}`;
      `  - Timezone: ${this.getCountdownTimezone()}`;

      // Show fetch info
      const lastFetchTime = this.remoteConfig.fetchTimeMillis;
      const lastFetchStatus = this.remoteConfig.lastFetchStatus;

      ("📡 Fetch Information:");
      `  - Last fetch time: ${new Date(lastFetchTime).toLocaleString()}`;
      `  - Last fetch status: ${lastFetchStatus}`;
    } catch (error) {
      console.error("❌ Error debugging Remote Config:", error);
    }

    ("🔍 === END DEBUG ===");
  }
}

// Create and export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;
