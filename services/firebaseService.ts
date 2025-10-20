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
        return;
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
        minimumFetchIntervalMillis: Number.parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_INTERVAL_MS || "3600000",
        ), // 1 hour
        fetchTimeoutMillis: Number.parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_TIMEOUT_MS || "60000",
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
   * Get countdown deadline from Remote Config
   */
  getCountdownDeadline(): string {
    try {
      if (!this.remoteConfig) {
        return this.defaultValues.countdown_deadline;
      }

      const deadline = getValue(
        this.remoteConfig,
        "countdown_deadline",
      ).asString();
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
        "countdown_timezone",
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
        "countdown_enabled",
      ).asBoolean();
      return enabled;
    } catch (error) {
      console.error("❌ Failed to get countdown enabled status:", error);
      return true; // Default to enabled
    }
  }

  /**
   * Get initialization status
   */
  isInitialized(): boolean {
    return this.initialized;
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
    const isUsingEnv = Boolean(import.meta.env.WXT_FIREBASE_API_KEY &&
      import.meta.env.WXT_FIREBASE_PROJECT_ID);

    return {
      source: isUsingEnv ? "environment" : "fallback",
      config: this.getFirebaseConfig(),
      settings: {
        minimumFetchIntervalMillis: Number.parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_INTERVAL_MS || "3600000",
        ),
        fetchTimeoutMillis: Number.parseInt(
          import.meta.env.WXT_FIREBASE_FETCH_TIMEOUT_MS || "60000",
        ),
      },
      defaults: this.getDefaultValues(),
    };
  }
}

// Create and export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;
