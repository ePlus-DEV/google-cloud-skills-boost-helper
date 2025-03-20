import React, { useCallback, useState } from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { useStorage } from "@plasmohq/storage/hook";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopyright, faToggleOn, faBadgeCheck, faFloppyDisk } from '@fortawesome/duotone-regular-svg-icons';
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
        <div style={{ display: "flex", flexDirection: "column", padding: 16, width: 400 }}>
            <Header />
            <FeatureTable checked={checked} onCheckboxChange={handleCheckboxChange} />
            <Footer />
            <Toaster />
        </div>
    );
}

function Header() {
    return (
        <h3 className="text-xl font-semibold text-center">
            {chrome.i18n.getMessage("extensionName")}
        </h3>
    );
}

function FeatureTable({ checked, onCheckboxChange }: { checked: boolean; onCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void }): JSX.Element {
    const [url, setUrl] = useState("");

    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
    };

    const handleSubmit = async () => {
        if (!url) {
            toast.error("Please enter a URL.");
            return;
        }

        try {
            const response = await axios.post("https://cors.eplus.dev/https://arcadepoints.vercel.app/api/submit", {
                url
            });

            if (response.status === 200) {
                const { userDetails, arcadePoints } = response.data;
                const { userName, memberSince, league } = userDetails[0] || {};
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
                toast.error("Failed to submit URL.");
            }
        } catch (error) {
            toast.error("An error occurred while submitting the URL.");
            console.error("Error submitting URL:", error);
        }
    };

    return (
        <div className="mt-4">
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2">{chrome.i18n.getMessage("labelFeature")}</th>
                        <th className="py-2">{chrome.i18n.getMessage("labelAction")}</th>
                    </tr>
                </thead>
                <tbody>
                    <FeatureRow
                        label={chrome.i18n.getMessage("labelShowLeaderboard")}
                        content={
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600"
                                checked={checked}
                                onChange={onCheckboxChange}
                            />
                        }
                    />
                    <FeatureRow
                        label={chrome.i18n.getMessage("labelPublicProfile")}
                        content={
                            <a
                                href="https://www.cloudskillsboost.google/my_account/profile#public-profile"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600"
                            >
                                <FontAwesomeIcon icon={faToggleOn} size="2x" />
                            </a>
                        }
                    />
                    <FeatureRow
                        label={chrome.i18n.getMessage("labelMyBadges")}
                        content={
                            <a
                                href="https://www.cloudskillsboost.google/profile/badges"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600"
                            >
                                <FontAwesomeIcon icon={faBadgeCheck} size="2x" />
                            </a>
                        }
                    />
                    <FeatureRow
                        label={chrome.i18n.getMessage("labelArcadePointsCalculator")}
                        content={
                            <div className="flex items-center space-x-2">
                                <input
                                    type="url"
                                    className="border px-4 py-2 flex-grow"
                                    placeholder="Enter url public profile"
                                    value={url}
                                    onChange={handleUrlChange}
                                />
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                    onClick={handleSubmit}
                                >
                                    <FontAwesomeIcon icon={faFloppyDisk} />
                                </button>
                            </div>
                        }
                    />
                </tbody>
            </table>
        </div>
    );
}

function FeatureRow({ label, content }: { label: string; content: JSX.Element }) {
    return (
        <tr>
            <td className="border px-4 py-2">{label}</td>
            <td className="border px-4 py-2">{content}</td>
        </tr>
    );
}

function Footer() {
    return (
        <footer className="mt-4 text-center text-gray-500">
            <FontAwesomeIcon icon={faCopyright} /> {new Date().getFullYear()} -{" "}
            <a href="http://eplus.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                ePlus.DEV
            </a>
        </footer>
    );
}

export default IndexPopup;
