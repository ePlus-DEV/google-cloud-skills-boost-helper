chrome.storage.sync.get("scriptEnabled", (data) => {
    const scriptEnabled = data.scriptEnabled ?? true;
    if (scriptEnabled) {
        console.log("CloudSkillsBoost script injected!");

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

        // Chờ DOM load xong
        document.addEventListener("DOMContentLoaded", modifyPage);
        setTimeout(modifyPage, 3000); // Tránh trường hợp trang load chậm
    } else {
        console.log("Script bị tắt.");
    }
});