chrome.storage.sync.get("scriptEnabled", (data) => {
    const scriptEnabled = data.scriptEnabled ?? true;

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
            statusDiv.innerText = scriptEnabled ? "✅ Script đang chạy" : "❌ Script bị tắt";
            document.body.appendChild(statusDiv);

            setTimeout(() => {
                statusDiv.remove();
            }, 3000); // Tự động ẩn sau 3 giây
        }
    }

    if (scriptEnabled) {
        console.log("CloudSkillsBoost script injected!");
        showStatusLabel();

        function modifyPage() {
            const removeLeaderboard = document.querySelector('.js-lab-leaderboard');
            const showScore = document.querySelector('.games-labs');

            if (removeLeaderboard) {
                removeLeaderboard.remove();
                console.log("Đã xóa bảng xếp hạng.");
            }

            if (showScore) {
                showScore.className = "lab-show l-full no-nav application-new lab-show l-full no-nav ";
                console.log("Đã thay đổi class của games-labs.");
            }
        }

        document.addEventListener("DOMContentLoaded", modifyPage);
        setTimeout(modifyPage, 3000);
    } else {
        console.log("Script bị tắt.");
        showStatusLabel();
    }
});
