import { PopupService, AccountService } from "../../services";

// Test function for copy button
(window as any).testCopy = async () => {
  console.log("TEST: Button clicked via inline onclick!");
  
  try {
    const testUrl = "https://www.cloudskillsboost.google/public_profiles/test";
    await navigator.clipboard.writeText(testUrl);
    console.log("TEST: Copy successful!");
    alert("Copy test successful!");
  } catch (error) {
    console.error("TEST: Copy failed:", error);
    alert("Copy test failed: " + (error as Error).message);
  }
};

// Initialize the popup when the script loads
PopupService.initialize().then(() => {
  console.log("PopupService initialized");
  
  // Add copy button event listener after initialization
  setTimeout(() => {
    const copyBtn = document.getElementById("copy-profile-url");
    console.log("Main.tsx: Copy button found:", !!copyBtn);
    if (copyBtn) {
      copyBtn.addEventListener("click", async (e) => {
        console.log("Main.tsx: Copy button clicked!");
        e.preventDefault();
        e.stopPropagation();
        
        // Get URL from active account
        const activeAccount = await AccountService.getActiveAccount();
        const profileUrl = activeAccount?.profileUrl || PopupService.profileUrl;
        
        console.log("Main.tsx: Profile URL:", profileUrl);
        
        if (profileUrl) {
          try {
            await navigator.clipboard.writeText(profileUrl);
            console.log("Main.tsx: Copy successful!");
            
            // Visual feedback
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check text-xs"></i>';
            copyBtn.classList.add("text-green-400", "bg-green-400/20", "border-green-400/50");
            copyBtn.classList.remove("text-blue-400", "bg-blue-400/20", "border-blue-400/30");
            copyBtn.title = "Copied!";
            
            setTimeout(() => {
              copyBtn.innerHTML = originalIcon;
              copyBtn.classList.remove("text-green-400", "bg-green-400/20", "border-green-400/50");
              copyBtn.classList.add("text-blue-400", "bg-blue-400/20", "border-blue-400/30");
              copyBtn.title = "Copy Profile URL";
            }, 1500);
          } catch (error) {
            console.error("Main.tsx: Copy failed:", error);
          }
        } else {
          console.log("Main.tsx: No URL available");
        }
      });
    }
  }, 500); // Wait 500ms to ensure DOM is ready
});
