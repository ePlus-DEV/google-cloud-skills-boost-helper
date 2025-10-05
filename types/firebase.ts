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
  countdown_deadline: string;
  countdown_timezone: string;
  countdown_enabled: string; // String because Remote Config stores as string
  [key: string]: string | number | boolean; // Index signature for Firebase compatibility
}
