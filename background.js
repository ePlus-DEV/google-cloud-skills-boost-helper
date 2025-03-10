function injectContentScript(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["content.js"]
    }, () => {
        console.log("Đã inject content.js vào tab:", tabId);
    });
}

// Cập nhật trạng thái badge trên icon extension
function updateBadge(isEnabled) {
    const text = isEnabled ? "ON " : "OFF";
    chrome.action.setBadgeText({ text: text });
    chrome.action.setBadgeBackgroundColor({ color: isEnabled ? "#4CAF50" : "#FF3B30" });
}

// Kiểm tra và cập nhật trạng thái khi vào trang
function checkAndInjectScript(tabId, tab) {
    const urlPattern = /^https:\/\/www\.cloudskillsboost\.google\/games\/.*\/labs\/.*$/;
    if (tab.url && urlPattern.test(tab.url)) {
        chrome.storage.sync.get("scriptEnabled", (data) => {
            const isEnabled = data.scriptEnabled ?? true;
            updateBadge(isEnabled);
            if (isEnabled) injectContentScript(tabId);
        });
    } else {
        chrome.action.setBadgeText({ text: "" }); // Ẩn badge nếu không đúng trang
    }
}

// Nhấn vào icon extension để bật/tắt script
chrome.action.onClicked.addListener((tab) => {
    chrome.storage.sync.get("scriptEnabled", (data) => {
        const newStatus = !data.scriptEnabled;
        chrome.storage.sync.set({ scriptEnabled: newStatus }, () => {
            updateBadge(newStatus);
            checkAndInjectScript(tab.id, tab);
        });
    });
});

// Lắng nghe khi tab được cập nhật hoặc chuyển đổi
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        checkAndInjectScript(tabId, tab);
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        checkAndInjectScript(activeInfo.tabId, tab);
    });
});

// Chạy khi extension khởi động
chrome.runtime.onStartup.addListener(() => {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            checkAndInjectScript(tab.id, tab);
        });
    });
});
