const leaderBoardChecked = storage.defineItem<boolean>("local:leaderBoard", {
  fallback: false,
});

const urlProfile = storage.defineItem<boolean>("local:urlProfile");
const arcadeData = storage.defineItem<boolean>("local:arcadeData", {
  fallback: false,
});
const arcadeBadges = storage.defineItem<boolean>("local:arcadeBadges", {
  fallback: false,
});
