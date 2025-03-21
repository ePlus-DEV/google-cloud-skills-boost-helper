import React, { useCallback, useState } from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { useStorage } from "@plasmohq/storage/hook";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToggleOn, faBadgeCheck, faFloppyDisk } from '@fortawesome/duotone-regular-svg-icons';
import Header from "~components/header"
import Footer from "~components/footer"
import FeatureRow from "~components/feature/row"
import "./style.css";

function IndexOptions() {
  const [checked, setChecked] = useStorage("checked", false);

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked);
    },
    [setChecked]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: 16, width: 400, margin: "0 auto", height: "100vh", justifyContent: "center" }}>
      <Header />
      <FeatureTable checked={checked} onCheckboxChange={handleCheckboxChange} />
      <Footer />
      <Toaster position="top-center" reverseOrder={false}/>
    </div>
  );
}

function FeatureTable({ checked, onCheckboxChange }: { checked: boolean; onCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void }): JSX.Element {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [urlProfile, setUrlProfile] = useStorage("urlProfile", "");
  const [arcadeData, setArcadeData] = useStorage("arcadeData", {});
  const [arcadeBadges, setArcadeBadges] = useStorage("arcadebadges", {});

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleSubmit = async () => {
    const link = url || urlProfile;
    if (!link || !link.startsWith("https://www.cloudskillsboost.google/public_profiles/")) {
      toast.error("Please enter a valid URL starting with 'https://www.cloudskillsboost.google/public_profiles/'.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("https://cors.eplus.dev/https://arcadepoints.vercel.app/api/submit", {
        url: link
      });

      if (response.status === 200) {
        const { userDetails, arcadePoints, badges } = response.data;
        const { userName, memberSince, league } = userDetails[0] || {};
        const { totalPoints, gamePoints, triviaPoints, skillPoints, specialPoints } = arcadePoints;

        const lastUpdated = new Date().toISOString();
        setUrlProfile(link);
        setArcadeData((prevData) => ({
          ...prevData,
          userDetails: userDetails[0],
          arcadePoints,
          lastUpdated
        }));
        setArcadeBadges({
          badge: badges[0] || {}
        });

        const manifest = chrome.runtime.getManifest();
        const iconUrl = chrome.runtime.getURL(manifest.icons["48"]);

        chrome.notifications.create({
          type: "basic",
          iconUrl: iconUrl,
          title: `User: ${userName}`,
          message: `League: ${league}\nMember Since: ${memberSince}\nTotal Points: ${totalPoints}\nGame Points: ${gamePoints}\nTrivia Points: ${triviaPoints}\nSkill Points: ${skillPoints}\nSpecial Points: ${specialPoints}`,
          priority: 2
        });
        toast.success("Submission successful!");
      } else {
        toast.error("Failed to submit URL.");
      }
    } catch (error) {
      toast.error("An error occurred while submitting the URL.");
      console.error("Error submitting URL:", error);
    } finally {
      setLoading(false);
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
              <div>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    className="border px-4 py-2 flex-grow"
                    placeholder="Enter url public profile"
                    value={url || urlProfile}
                    onChange={handleUrlChange}
                  />
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : <FontAwesomeIcon icon={faFloppyDisk} />}
                  </button>
                </div>
                <div className="max-h-96 overflow-y-scroll border border-gray-300 p-2 max-w-md mt-3">
                  <pre>{JSON.stringify(arcadeBadges, null, 2)}</pre>
                </div>
              </div>
            }
          />
        </tbody>
      </table>
    </div>
  );
}

export default IndexOptions;
