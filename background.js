function updateBadge(isEnabled) {
    const text = isEnabled ? "ON " : "OFF";
    chrome.action.setBadgeText({ text: text });
    chrome.action.setBadgeBackgroundColor({ color: isEnabled ? "#4CAF50" : "#FF3B30" });
    chrome.action.setBadgeTextColor({ color: "#FFFFFF" }); // Set badge text color to white
}

function checkAndUpdateBadge() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        const urlPattern = /^https:\/\/www\.cloudskillsboost\.google\/games\/.*\/labs\/.*$/;
        if (urlPattern.test(tab.url)) {
            chrome.storage.sync.get("scriptEnabled", (data) => {
                updateBadge(data.scriptEnabled ?? true);
            });
        } else {
            chrome.action.setBadgeText({ text: "" }); // Clear the badge if the URL does not match
        }
    });
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "updateScript") {
        chrome.storage.sync.set({ scriptEnabled: message.enabled }, () => {
            checkAndUpdateBadge();
        });
    }
});

// Update badge label when the extension starts or the tab is updated
chrome.storage.sync.get("scriptEnabled", (data) => {
    checkAndUpdateBadge();
});

chrome.tabs.onUpdated.addListener(() => {
    checkAndUpdateBadge();
});

chrome.tabs.onActivated.addListener(() => {
    checkAndUpdateBadge();
});
