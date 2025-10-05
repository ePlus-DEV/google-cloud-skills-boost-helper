import { PopupService, AccountService } from "../../services";
import PopupUIService from "../../services/popupUIService";

// Extend Window interface to include testCopy and testMilestone
declare global {
  interface Window {
    testCopy: () => Promise<void>;
    testMilestone: () => void;
  }
}

// Test function for copy button
(window as Window & typeof globalThis).testCopy = async () => {
  try {
    const testUrl = "https://www.cloudskillsboost.google/public_profiles/test";
    await navigator.clipboard.writeText(testUrl);
  } catch (error) {
    console.error("TEST: Copy failed:", error);
  }
};

// Test function for milestone data
(window as Window & typeof globalThis).testMilestone = () => {
  PopupUIService.testMilestoneWithAPIData();
};

// Initialize the popup when the script loads
PopupService.initialize().then(() => {
  // Initialize milestones section and countdown with Firebase Remote Config
  PopupUIService.updateMilestoneSection().then(async () => {
    // Start Firebase-powered countdown
    await PopupUIService.startFacilitatorCountdown();
    
    // Start countdown configuration monitor for remote toggle
    PopupUIService.startCountdownConfigMonitor();
  });
  
  // Add copy button event listener after initialization
  setTimeout(() => {
    const copyBtn = document.getElementById("copy-profile-url");
    if (copyBtn) {
      copyBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Get URL from active account
        const activeAccount = await AccountService.getActiveAccount();
        const profileUrl = activeAccount?.profileUrl || PopupService.profileUrl;

        if (profileUrl) {
          try {
            await navigator.clipboard.writeText(profileUrl);

            // Visual feedback
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check text-xs"></i>';
            copyBtn.classList.add(
              "text-green-400",
              "bg-green-400/20",
              "border-green-400/50",
            );
            copyBtn.classList.remove(
              "text-blue-400",
              "bg-blue-400/20",
              "border-blue-400/30",
            );
            copyBtn.title = "Copied!";

            setTimeout(() => {
              copyBtn.innerHTML = originalIcon;
              copyBtn.classList.remove(
                "text-green-400",
                "bg-green-400/20",
                "border-green-400/50",
              );
              copyBtn.classList.add(
                "text-blue-400",
                "bg-blue-400/20",
                "border-blue-400/30",
              );
              copyBtn.title = "Copy Profile URL";
            }, 1500);
          } catch (error) {
            console.error("Main.tsx: Copy failed:", error);
          }
        }
      });
    }
  }, 500); // Wait 500ms to ensure DOM is ready
});
