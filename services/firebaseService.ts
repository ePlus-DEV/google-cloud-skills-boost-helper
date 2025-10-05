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
      apiKey:
        import.meta.env.WXT_FIREBASE_API_KEY,
      authDomain:
        import.meta.env.WXT_FIREBASE_AUTH_DOMAIN,
      projectId:
        import.meta.env.WXT_FIREBASE_PROJECT_ID,
      storageBucket:
        import.meta.env.WXT_FIREBASE_STORAGE_BUCKET,
      messagingSenderId:
        import.meta.env.WXT_FIREBASE_MESSAGING_SENDER_ID,
      appId:
        import.meta.env.WXT_FIREBASE_APP_ID,
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
        console.log("🔥 Firebase already initialized");
        return;
      }

      console.log("🔥 Initializing Firebase...");

      // Log configuration source
      const configInfo = this.getConfigInfo();
      console.log(`📋 Using ${configInfo.source} configuration`);
      if (configInfo.source === "environment") {
        console.log("✅ Environment variables loaded successfully");
      } else {
        console.log("⚠️ Using fallback configuration - check .env file");
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

      this.initialized = true;
      console.log("✅ Firebase initialized successfully");

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

      console.log("🔄 Fetching Remote Config...");

      const activated = await fetchAndActivate(this.remoteConfig);

      if (activated) {
        console.log("✅ Remote Config fetched and activated");
      } else {
        console.log("ℹ️ Using cached Remote Config values");
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
      console.log("📅 Retrieved countdown deadline:", deadline);
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
        return true; // Default to enabled
      }

      const enabled = getValue(
        this.remoteConfig,
        "countdown_enabled"
      ).asBoolean();
      console.log("⏰ Countdown enabled:", enabled);
      return enabled;
    } catch (error) {
      console.error("❌ Failed to get countdown enabled status:", error);
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
    console.log("🔄 Manually refreshing Remote Config...");
    return await this.fetchConfig();
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
}

// Create and export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;
