import React from "react";
import { useStorage } from "@plasmohq/storage/hook";
import ProfileCard from "~components/feature/arcade/card";
import "./style.css";

function IndexPopup() {
    const [arcadeData] = useStorage<{
        userDetails?: any;
        arcadePoints?: any;
        lastUpdated?: string;
    }>("arcadeData", { userDetails: undefined, arcadePoints: undefined });

    const userName = arcadeData.userDetails?.userName || "Guest";
    const league = arcadeData.userDetails?.league || "Unranked";
    const { totalPoints = 0, gamePoints = 0, triviaPoints = 0, skillPoints = 0, specialPoints = 0 } = arcadeData.arcadePoints || {};
    const points = arcadeData.userDetails?.points || 0;
    const lastUpdated = arcadeData.lastUpdated || new Date().toLocaleString();

    return (
        <div className="w-[400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 shadow-lg rounded-lg p-1">
            <ProfileCard userName={userName} league={league} ArcadePoints={totalPoints} points={points} lastUpdated={lastUpdated} gamePoints={gamePoints} triviaPoints={triviaPoints} skillPoints={skillPoints} specialPoints={specialPoints}/>
        </div>
    );
}

export default IndexPopup;