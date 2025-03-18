import type { PlasmoCSConfig } from "plasmo";
import { useStorage } from "@plasmohq/storage/hook";

export const config: PlasmoCSConfig = {
  matches: ["https://www.cloudskillsboost.google/games/*/labs/*", "https://www.cloudskillsboost.google/my_account/profile*"]
};

const PlasmoOverlay = () => {
  const [checked] = useStorage<boolean>("checked");

  const showScore = document.querySelector('.games-labs');
  const leaderboard = document.querySelector('.js-lab-leaderboard');
  
  if (showScore) {
    showScore.className = "lab-show l-full no-nav application-new lab-show l-full no-nav";
  }

  if (leaderboard) {
      leaderboard.classList.add('hidden');
  }

  const toggleLeaderboard = () => {
    if (leaderboard) {
      leaderboard.classList.toggle('hidden');
    }
  };

  // Scroll to #public-profile if on the specific page
  if (window.location.hash === "#public-profile" && window.location.pathname === "/my_account/profile") {
    const publicProfileElement = document.getElementById("public-profile");
    publicProfileElement?.scrollIntoView({ behavior: "smooth" });

    const publicProfileChecked = document.querySelector<HTMLInputElement>("#public_profile_checked");
    if (publicProfileChecked && !publicProfileChecked.checked) {
      publicProfileChecked.checked = true;

      // Add tooltip to the "Update settings" button
      const updateSettingsButton = document.querySelector<HTMLElement>(
        'ql-button[type="submit"][name="commit"][data-disable-with="Update settings"]'
      );
      updateSettingsButton?.setAttribute("title", "Click to update your settings");

      // Create and display a notification
      const saveNotification = document.createElement("div");
      Object.assign(saveNotification.style, {
        position: "fixed",
        bottom: "10px",
        right: "10px",
        backgroundColor: "#f8d7da",
        color: "#721c24",
        padding: "10px",
        border: "1px solid #f5c6cb",
        borderRadius: "5px",
        zIndex: "1000"
      });
      saveNotification.textContent = "Please click the 'Update settings' button above.";
      document.body.appendChild(saveNotification);
    }
  }

  const handleToggleLeaderboard = () => {
    toggleLeaderboard();
  };

  return (
    <>
      {checked && (
        <button
          onClick={handleToggleLeaderboard}
          style={{
            position: "fixed",
            right: 15,
            bottom: 15,
            zIndex: 50,
            backgroundColor: "#38a169",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.25rem",
            cursor: "pointer"
          }}
        >
          { chrome.i18n.getMessage("labelShowLeaderboard") }
        </button>
      )}
    </>
  );
};

export default PlasmoOverlay;
