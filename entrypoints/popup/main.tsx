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

// Simple countdown timer function
function startCountdownTimer() {
  console.log("🕐 Starting countdown timer...");
  
  const deadline = new Date('2025-10-14T23:59:59+05:30'); // Oct 14, 2025 11:59 PM IST
  
  function updateCountdown() {
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      // Program ended
      const elements = ['#countdown-days', '#countdown-hours', '#countdown-minutes', '#countdown-seconds'];
      elements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) element.textContent = '00';
      });
      return;
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    const daysEl = document.querySelector('#countdown-days');
    const hoursEl = document.querySelector('#countdown-hours');
    const minutesEl = document.querySelector('#countdown-minutes');
    const secondsEl = document.querySelector('#countdown-seconds');
    
    if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
    if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
    if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
    if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
  }
  
  // Update immediately and then every second
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Initialize the popup when the script loads
PopupService.initialize().then(() => {
  // Initialize milestones section and countdown
  PopupUIService.updateMilestoneSection().then(() => {
    PopupUIService.startFacilitatorCountdown();
  });
  
  // Start countdown immediately without waiting for milestone section
  setTimeout(() => {
    startCountdownTimer();
  }, 1000);
  
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
