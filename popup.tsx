import someCoolImage from "data-base64:~assets/coming-soon.png";
import React, { useCallback, useEffect, useState } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import BadgeTable from "~components/feature/badge";
import ProfileCard from "~components/feature/profile";
import axios from "axios";
import "./style.css";

function IndexPopup() {
    const [urlProfile, seturlProfile] = useStorage("urlProfile", "");

    useEffect(() => {
        if (urlProfile) {
            (async () => {
                try {
                const response = await axios.post("https://cors.eplus.dev/https://arcadepoints.vercel.app/api/submit", {
                    url: urlProfile
                });

                if (response.status === 200) {
                    const { userDetails, arcadePoints } = response.data;
                    const { userName, memberSince, league, points } = userDetails[0] || {};
                    const { totalPoints, gamePoints, triviaPoints, skillPoints, specialPoints } = arcadePoints;

                    const manifest = chrome.runtime.getManifest();
                    const iconUrl = chrome.runtime.getURL(manifest.icons["48"]);

                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: iconUrl,
                        title: `User: ${userName}`,
                        message: `League: ${league}\nMember Since: ${memberSince}\nTotal Points: ${totalPoints}\nGame Points: ${gamePoints}\nTrivia Points: ${triviaPoints}\nSkill Points: ${skillPoints}\nSpecial Points: ${specialPoints}`,
                        priority: 2
                    });
                } else {
                    console.error("Failed to submit URL.");
                }
                } catch (error) {
                    console.error("Error submitting URL:", error);
                }
            })();
        }
    }, [urlProfile]);

    return (
        <div className="w-[400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 shadow-lg rounded-lg p-1">
            <ProfileCard />
            <BadgeTable />
        </div>
    );
}

export default IndexPopup;