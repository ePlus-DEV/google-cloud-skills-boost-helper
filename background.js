function updateBadge(isEnabled) {
    const text = isEnabled ? "ON " : "OFF";
    chrome.action.setBadgeText({ text: text });
    chrome.action.setBadgeBackgroundColor({ color: isEnabled ? "#4CAF50" : "#FF3B30" });
    chrome.action.setBadgeTextColor({ color: "#FFFFFF" }); // Set badge text color to white
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "updateScript") {
        chrome.storage.sync.set({ scriptEnabled: message.enabled }, () => {
            updateBadge(message.enabled);
        });
    }
});

// Update badge label when the extension starts
chrome.storage.sync.get("scriptEnabled", (data) => {
    updateBadge(data.scriptEnabled ?? true);
});
