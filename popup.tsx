import React, { useCallback } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopyright, faToggleOn } from '@fortawesome/duotone-regular-svg-icons';
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
        <div style={{ display: "flex", flexDirection: "column", padding: 16, width: 300 }}>
            <Header />
            <FeatureTable checked={checked} onCheckboxChange={handleCheckboxChange} />
            <Footer />
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

function FeatureTable({ checked, onCheckboxChange }: { checked: boolean; onCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div className="mt-4">
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2">{chrome.i18n.getMessage("labelFeature")}</th>
                        <th className="py-2">{chrome.i18n.getMessage("labelStatus")}</th>
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
                        label="Public Profile"
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