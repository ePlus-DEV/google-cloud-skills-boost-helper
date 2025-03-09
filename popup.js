document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("toggleScript");

    // Lấy trạng thái lưu trữ
    chrome.storage.sync.get("scriptEnabled", (data) => {
        toggle.checked = data.scriptEnabled ?? true; // Mặc định bật
    });

    // Khi người dùng thay đổi trạng thái
    toggle.addEventListener("change", () => {
        const isEnabled = toggle.checked;
        chrome.storage.sync.set({ scriptEnabled: isEnabled });

        // Gửi tín hiệu đến background.js để cập nhật script
        chrome.runtime.sendMessage({ action: "updateScript", enabled: isEnabled });
    });
});
