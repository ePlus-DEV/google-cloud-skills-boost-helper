chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "updateScript") {
        chrome.storage.sync.set({ scriptEnabled: message.enabled });
    }
});
