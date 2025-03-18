import type { PlasmoCSConfig } from "plasmo";
import { useStorage } from "@plasmohq/storage/hook";
import React from "react";

export const config: PlasmoCSConfig = {
  matches: ["https://www.cloudskillsboost.google/games/*/labs/*", "https://www.cloudskillsboost.google/my_account/profile*"]
};

/**
 * The `PlasmoOverlay` component is a React functional component that provides
 * an overlay with specific functionality for modifying the DOM and interacting
 * with the page's elements. It includes features such as toggling the visibility
 * of a leaderboard, scrolling to a specific section of the page, and displaying
 * notifications or tooltips for user actions.
 *
 * Functionality:
 * - Toggles the visibility of a leaderboard element on the page.
 * - Automatically scrolls to the `#public-profile` section if the URL hash matches
 *   and the user is on the profile page.
 * - Ensures a checkbox is checked and provides a tooltip for the "Update settings" button.
 * - Displays a notification prompting the user to update their settings.
 *
 * UI:
 * - Renders a floating button at the bottom-right corner of the page that allows
 *   users to toggle the leaderboard visibility.
 *
 * Dependencies:
 * - Uses the `useStorage` hook to manage the `checked` state.
 * - Relies on the `chrome.i18n.getMessage` API for internationalized button labels.
 *
 * @returns {JSX.Element | null} A button element for toggling the leaderboard if `checked` is true, or `null` otherwise.
 */
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

  const toggleLeaderboard = React.useCallback(() => {
    if (leaderboard) {
      leaderboard.classList.toggle('hidden');
    }
  }, [leaderboard]);

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

  return (
    checked && (
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
    )
  );
};

export default PlasmoOverlay;
