import React from "react";
import { useStorage } from "@plasmohq/storage/hook";
import BadgeTable from "~components/feature/badge";
import ProfileCard from "~components/feature/profile";
import "./style.css";

function IndexPopup() {
    const [arcadeData] = useStorage<{
        userDetails?: any;
        arcadePoints?: any;
    }>("arcadeData", { userDetails: undefined, arcadePoints: undefined });
    console.log(arcadeData);
    const userName = arcadeData.userDetails?.userName || "Guest";
    const league = arcadeData.userDetails?.league || "Unranked";
    const { totalPoints = 0, gamePoints = 0, triviaPoints = 0, skillPoints = 0, specialPoints = 0 } = arcadeData.arcadePoints || {};

    return (
        <div className="w-[400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 shadow-lg rounded-lg p-1">
            <ProfileCard userName={userName} league={league} ArcadePoints={totalPoints} points={totalPoints} />
            <BadgeTable />
        </div>
    );
}

export default IndexPopup;