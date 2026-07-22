import type { ArcadeData, BadgeData } from "../types";

const leaderBoardChecked = storage.defineItem<boolean>("local:leaderBoard", {
  fallback: false,
});

const urlProfile = storage.defineItem<string>("local:urlProfile");
const arcadeData = storage.defineItem<ArcadeData>("local:arcadeData", {
  fallback: {},
});
const arcadeBadges = storage.defineItem<BadgeData[]>("local:arcadeBadges", {
  fallback: [],
});
