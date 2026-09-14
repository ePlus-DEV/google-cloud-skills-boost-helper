import "./bonusMilestoneControl";
import CompactModePreferenceService from "../../services/compactModePreferenceService";

CompactModePreferenceService.initializeMirrorSync().catch((error) => {
  console.debug("Failed to initialize compact mode mirror:", error);
});
