function injectContentScript(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["content.js"]
    }, () => {
        console.log("Đã inject content.js vào tab:", tabId);
    });
}

function updateBadge(status) {
    chrome.action.setBadgeText({ text: status ? "ON " : "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: status ? "#00FF00" : "#FF0000" });
    chrome.action.setBadgeTextColor({ color: "#FFFFFF" });
}

// Kiểm tra và inject script khi tab thay đổi hoặc cập nhật
function checkAndInjectScript(tabId, changeInfo, tab) {
    const urlPattern = /^https:\/\/www\.cloudskillsboost\.google\/games\/.*\/labs\/.*$/;
    if (tab.url && urlPattern.test(tab.url)) {
        chrome.storage.sync.get("scriptEnabled", (data) => {
            const scriptEnabled = data.scriptEnabled ?? true;
            updateBadge(scriptEnabled);
            if (scriptEnabled) {
                injectContentScript(tabId);
            }
        });
    }
}

// Lắng nghe khi tab được cập nhật hoặc thay đổi
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        checkAndInjectScript(tabId, changeInfo, tab);
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        checkAndInjectScript(activeInfo.tabId, {}, tab);
    });
});

// Chạy khi extension được bật
chrome.runtime.onStartup.addListener(() => {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            checkAndInjectScript(tab.id, {}, tab);
        });
    });
});

// Kiểm tra và inject script ngay khi cài đặt
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            checkAndInjectScript(tab.id, {}, tab);
        });
    });
});

// Listen for changes in the scriptEnabled setting
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.scriptEnabled) {
        updateBadge(changes.scriptEnabled.newValue);
    }
});
