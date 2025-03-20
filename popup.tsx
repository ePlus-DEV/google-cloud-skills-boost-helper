import someCoolImage from "data-base64:~assets/coming-soon.png"
import React, { useCallback, useState } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import BadgeTable from "~components/feature/badge"
import ProfileCard from "~components/feature/profile"
import "./style.css";

function IndexPopup() {
    const [checked, setChecked] = useStorage("checked", false);

    const handleCheckboxChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setChecked(event.target.checked);
        },
        [setChecked]
    );

    return (
        <div className="w-[400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 shadow-lg rounded-lg p-1">
            <ProfileCard />
            <BadgeTable />
        </div>
    );
}

export default IndexPopup;
