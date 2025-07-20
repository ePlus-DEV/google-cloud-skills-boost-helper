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

export interface StorageKeys {
  arcadeData: "local:arcadeData";
  urlProfile: "local:urlProfile";
}
