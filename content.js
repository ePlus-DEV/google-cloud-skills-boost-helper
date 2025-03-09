chrome.storage.sync.get("scriptEnabled", (data) => {
    if (data.scriptEnabled ?? true) {
        console.log("CloudSkillsBoost script injected!");

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
    } else {
        console.log("Script bị tắt.");
    }
});
