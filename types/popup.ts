// Types for popup and options functionality

export interface CompletedBadge {
  badgeType?: string;
  type?: string;
}

export interface UserDetail {
  userName?: string;
  memberSince?: string;
  league?: string;
  points?: string;
  profileImage?: string;
  completedBadgeIds?: CompletedBadge[];
}

export interface ArcadeData {
  success?: boolean;
  userDetails?: UserDetail | UserDetail[]; // Support both single object and array
  arcadePoints?: {
    totalPoints?: number;
    gamePoints?: number;
    triviaPoints?: number;
    skillPoints?: number;
    specialPoints?: number;
  };
  totalArcadePoints?: number;
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
