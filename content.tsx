import type { PlasmoCSConfig } from "plasmo";
import { useStorage } from "@plasmohq/storage/hook";

export const config: PlasmoCSConfig = {
  matches: ["https://www.cloudskillsboost.google/games/*/labs/*"]
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

  return (
    <>
      {checked && (
        <button
          onClick={toggleLeaderboard}
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
