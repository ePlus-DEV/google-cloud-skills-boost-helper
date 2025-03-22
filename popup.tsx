import React, { useEffect } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import ProfileCard from "~components/feature/arcade/card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/duotone-regular-svg-icons';
import "./style.css";

function IndexPopup() {
    const [arcadeData] = useStorage<{
        userDetails?: any;
        arcadePoints?: any;
        lastUpdated?: string;
    }>("arcadeData", { userDetails: undefined, arcadePoints: undefined });

    const handleOpenSettings = () => {
        chrome.runtime.openOptionsPage();
    };

    useEffect(() => {
        if (!arcadeData) {
            window.open("options.html", "_blank");
        }
    }, [arcadeData?.userDetails]);

    const userName = arcadeData?.userDetails?.userName || "Guest";
    const league = arcadeData?.userDetails?.league || "Unranked";
    const { totalPoints = 0, gamePoints = 0, triviaPoints = 0, skillPoints = 0, specialPoints = 0 } = arcadeData?.arcadePoints || {};
    const points = arcadeData?.userDetails?.points || 0;
    const lastUpdated = arcadeData?.lastUpdated || new Date().toLocaleString();

    const isLoading = !arcadeData?.userDetails;

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-10">
                    <span className="text-white text-lg mr-2">{chrome.i18n.getMessage("textPleaseSetUpTheSettings")}</span>
                    <button
                        onClick={handleOpenSettings}
                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-full disabled:opacity-50 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center"
                    >
                        <FontAwesomeIcon icon={faGear} className={`h-5 w-5 transition-transform duration-300 hover:rotate-90"}`} />
                    </button>
                </div>
            )}
            <div className={`w-[400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 shadow-lg rounded-lg p-1 ${isLoading ? "blur-sm" : ""}`}>
                <ProfileCard userName={userName} league={league} ArcadePoints={totalPoints} points={points} lastUpdated={lastUpdated} gamePoints={gamePoints} triviaPoints={triviaPoints} skillPoints={skillPoints} specialPoints={specialPoints}/>
            </div>
        </div>
    );
}

export default IndexPopup;