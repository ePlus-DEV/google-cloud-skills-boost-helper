import type { PlasmoCSConfig } from "plasmo";
import { useStorage } from "@plasmohq/storage/hook";
import { useEffect } from "react";

export const config: PlasmoCSConfig = {
  matches: ["https://www.cloudskillsboost.google/games/*/labs/*"]
};

const PlasmoOverlay = () => {
  const [checked] = useStorage<boolean>("checked");

  useEffect(() => {
    const showScore = document.querySelector('.games-labs');
    const leaderboard = document.querySelector('.js-lab-leaderboard');

    if (showScore) {
      showScore.className = "lab-show l-full no-nav application-new lab-show l-full no-nav";
    }

    if (leaderboard) {
      leaderboard.classList.add('hidden');
    }
  }, []);

  const toggleLeaderboard = () => {
    const leaderboard = document.querySelector('.js-lab-leaderboard');
    if (leaderboard) {
      leaderboard.classList.toggle('hidden');
    }
    console.log("Toggling leaderboard visibility");
  };

  return (
    <button
      onClick={toggleLeaderboard}
      style={{
        position: "fixed",
        right: 0,
        bottom: 5,
        zIndex: 50,
        backgroundColor: "#38a169",
        color: "white",
        padding: "0.5rem 1rem",
        borderRadius: "0.25rem"
      }}
    >
      Toggle Leaderboard
    </button>
  );
};

export default PlasmoOverlay;
