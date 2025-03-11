import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

export const config: PlasmoCSConfig = {
  matches: ["https://www.cloudskillsboost.google/games/*/labs/*"],
  all_frames: true
}

window.addEventListener("load", () => {
  console.log(
    "You may find that having is not so pleasing a thing as wanting. This is not logical, but it is often true."
  )

  const removeLeaderboard = document.querySelector(".js-lab-leaderboard")
  const showScore = document.querySelector(".games-labs")

  if (removeLeaderboard) {
    removeLeaderboard.remove()
  }

  if (showScore) {
    showScore.className =
      "lab-show l-full no-nav application-new lab-show l-full no-nav"
  }
})
