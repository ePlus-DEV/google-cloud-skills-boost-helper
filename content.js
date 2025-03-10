chrome.storage.sync.get("scriptEnabled", (data) => {
  let scriptEnabled = data.scriptEnabled ?? true;

  // Hiển thị label trạng thái trên UI
  function showStatusLabel() {
    let statusDiv = document.getElementById("script-status");
    if (!statusDiv) {
      statusDiv = document.createElement("div");
      statusDiv.id = "script-status";
      statusDiv.style.position = "fixed";
      statusDiv.style.top = "10px";
      statusDiv.style.right = "10px";
      statusDiv.style.padding = "10px 15px";
      statusDiv.style.backgroundColor = scriptEnabled ? "#4CAF50" : "#FF3B30";
      statusDiv.style.color = "#FFFFFF";
      statusDiv.style.fontSize = "14px";
      statusDiv.style.fontWeight = "bold";
      statusDiv.style.borderRadius = "5px";
      statusDiv.style.zIndex = "9999";
      statusDiv.innerText = scriptEnabled ? chrome.i18n.getMessage("scriptRunning") : chrome.i18n.getMessage("scriptStopped");
      document.body.appendChild(statusDiv);

      setTimeout(() => {
        statusDiv.remove();
      }, 3000); // Tự động ẩn sau 3 giây
    }
  }

  function createToggleButton() {
    let toggleButton = document.getElementById("script-toggle");
    if (!toggleButton) {
      toggleButton = document.createElement("button");
      toggleButton.id = "script-toggle";
      toggleButton.style.position = "fixed";
      toggleButton.style.bottom = "10px"; // Changed from top to bottom
      toggleButton.style.right = "10px";
      toggleButton.style.padding = "10px 15px";
      toggleButton.style.backgroundColor = "#007BFF";
      toggleButton.style.color = "#FFFFFF";
      toggleButton.style.fontSize = "14px";
      toggleButton.style.fontWeight = "bold";
      toggleButton.style.border = "none";
      toggleButton.style.borderRadius = "5px";
      toggleButton.style.zIndex = "9999";
      toggleButton.innerText = scriptEnabled ? chrome.i18n.getMessage("hideLeaderboard") : chrome.i18n.getMessage("showLeaderboard");
      document.body.appendChild(toggleButton);

      toggleButton.addEventListener("click", () => {
        scriptEnabled = !scriptEnabled;
        chrome.storage.sync.set({ scriptEnabled }, () => {
          toggleButton.innerText = scriptEnabled ? chrome.i18n.getMessage("hideLeaderboard") : chrome.i18n.getMessage("showLeaderboard");
          showStatusLabel();
          modifyPage();
        });
      });
    }
  }

  function modifyPage() {
    const leaderboard = document.querySelector('.js-lab-leaderboard');
    const score = document.querySelector('.games-labs');

    if (leaderboard) {
      leaderboard.style.display = scriptEnabled ? "none" : "block";
      console.log(scriptEnabled ? chrome.i18n.getMessage("hideLeaderboard") : chrome.i18n.getMessage("showLeaderboard"));
    }

    if (score) {
      score.className = scriptEnabled ? "lab-show l-full no-nav application-new lab-show l-full no-nav " : "games-labs";
      console.log(scriptEnabled ? "Đã thay đổi class của games-labs." : "Đã khôi phục class của games-labs.");
    }
  }

  if (scriptEnabled) {
    console.log("CloudSkillsBoost script injected!");
    showStatusLabel();
    modifyPage();
  } else {
    console.log("Script bị tắt.");
    showStatusLabel();
  }

  createToggleButton();
});
