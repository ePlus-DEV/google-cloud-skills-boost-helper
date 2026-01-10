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
 * Remote Config default values interface
 */
export interface RemoteConfigDefaults {
  countdown_deadline_facilitator: string;
  countdown_timezone: string;
  countdown_enabled_facilitator: string;
  countdown_deadline_arcade: string;
  countdown_enabled_arcade: string;
  [key: string]: string | number | boolean; // Index signature for Firebase compatibility
}
