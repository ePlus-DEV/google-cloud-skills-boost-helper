// Types for Firebase Remote Config

/**
 * Firebase configuration interface
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Remote Config parameters interface
 */
export interface RemoteConfigParams {
  countdown_deadline: string;
  countdown_timezone: string;
  countdown_enabled: boolean;
}

/**
 * Remote Config default values interface
 */
export interface RemoteConfigDefaults {
  countdown_deadline: string;
  countdown_timezone: string;
  countdown_enabled: string; // String because Remote Config stores as string
  [key: string]: string | number | boolean; // Index signature for Firebase compatibility
}

/**
 * Firebase service configuration options
 */
export interface FirebaseServiceOptions {
  config?: Partial<FirebaseConfig>;
  minimumFetchIntervalMillis?: number;
  fetchTimeoutMillis?: number;
}

/**
 * Remote Config fetch result
 */
export interface RemoteConfigFetchResult {
  activated: boolean;
  fetchedValues: RemoteConfigParams;
  error?: string;
}

/**
 * Countdown configuration from Remote Config
 */
export interface CountdownConfig {
  deadline: string;
  timezone: string;
  enabled: boolean;
  title?: string;
}

/**
 * Countdown state refresh result
 */
export interface CountdownStateRefreshResult {
  enabled: boolean;
  deadline: string;
  timezone: string;
  changed: boolean;
}
