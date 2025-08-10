// Types for popup and options functionality

export interface ArcadeData {
  userDetails?: {
    userName?: string;
    league?: string;
    points?: number;
    profileImage?: string;
  };
  arcadePoints?: {
    totalPoints?: number;
    gamePoints?: number;
    triviaPoints?: number;
    skillPoints?: number;
    specialPoints?: number;
  };
  badges?: BadgeData[];
  lastUpdated?: string;
}

export interface BadgeData {
  title: string;
  imageURL: string;
  dateEarned: string;
  points: number;
}

export interface Milestone {
  points: number;
  league: string;
}

export interface UIUpdateData {
  selector: string;
  value: string | number | null | undefined;
}

// New interfaces for multiple accounts support
export interface Account {
  id: string;
  name: string;
  nickname?: string;
  profileUrl: string;
  arcadeData?: ArcadeData;
  createdAt: string;
  lastUsed: string;
  isActive?: boolean;
}

export interface AccountsData {
  accounts: Record<string, Account>;
  activeAccountId: string | null;
  settings: {
    enableSearchFeature: boolean;
  };
}

export interface CreateAccountOptions {
  name?: string;
  nickname?: string;
  profileUrl: string;
  arcadeData?: ArcadeData;
}

export interface StorageKeys {
  arcadeData: "local:arcadeData";
  urlProfile: "local:urlProfile";
  accountsData: "local:accountsData";
  enableSearchFeature: "local:enableSearchFeature";
}
