import React, { useCallback } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopyright, faToggleOn, faBadgeCheck, faFloppyDisk } from '@fortawesome/duotone-regular-svg-icons';
import "./style.css";

/**
 * The `IndexPopup` component renders a popup interface for a browser extension.
 * It includes a title, a table with features and their statuses, and a footer with copyright information.
 *
 * Features:
 * - Displays a checkbox to toggle a feature, with its state managed using a custom hook (`useStorage`).
 * - Provides a link to the user's public profile on Google Cloud Skills Boost.
 * - Localized text is retrieved using the `chrome.i18n.getMessage` API.
 *
 * @returns {JSX.Element} The rendered popup component.
 */
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
        </div>
    );
}

/**
 * A React functional component that renders a header element.
 * The header displays the localized name of the extension using the Chrome i18n API.
 *
 * @returns {JSX.Element} A JSX element containing an h3 tag with the extension's name.
 */
function Header() {
    return (
        <h3 className="text-xl font-semibold text-center">
            {chrome.i18n.getMessage("extensionName")}
        </h3>
    );
}

/**
 * A React functional component that renders a feature table with rows for different features.
 * Each row can display a label and a corresponding content, such as a checkbox or a link.
 *
 * @param {Object} props - The props for the component.
 * @param {boolean} props.checked - The state of the checkbox for the "Show Leaderboard" feature.
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} props.onCheckboxChange - 
 * A callback function triggered when the checkbox state changes.
 *
 * @returns {JSX.Element} A table displaying feature labels and their corresponding content.
 */
function FeatureTable({ checked, onCheckboxChange }: { checked: boolean; onCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
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
                                />
                                <button className="bg-blue-600 text-white px-4 py-2 rounded">
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

/**
 * A functional component that renders a table row with two cells: one for a label and one for content.
 *
 * @param props - The props for the component.
 * @param props.label - The text to display in the first cell of the row.
 * @param props.content - A JSX element to display in the second cell of the row.
 * @returns A table row (`<tr>`) element containing the label and content.
 */
function FeatureRow({ label, content }: { label: string; content: JSX.Element }) {
    return (
        <tr>
            <td className="border px-4 py-2">{label}</td>
            <td className="border px-4 py-2">{content}</td>
        </tr>
    );
}

/**
 * A functional component that renders a footer section.
 * The footer includes the current year, a copyright symbol, and a link to the ePlus.DEV website.
 *
 * @returns {JSX.Element} The rendered footer component.
 */
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