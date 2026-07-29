import CompactModePreferenceService from "../../services/compactModePreferenceService";

void CompactModePreferenceService.initializeMirrorSync().catch((error) => {
  console.debug("Failed to initialize compact mode mirror:", error);
});
