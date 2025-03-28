import { useState } from "react";
import ArcadeProfile from "~components/feature/arcade/profile";
import ArcadeBadge from "~components/feature/arcade/badges";
import ArcadeActivity from "~components/feature/arcade/activity";
import axios from "axios";
import toast from "react-hot-toast";
import { useStorage } from "@plasmohq/storage/hook";

interface ArcadeCardProps {
    userName: string;
    league: string;
    ArcadePoints: number;
    points: number;
    lastUpdated: string;
    gamePoints: number;
    triviaPoints: number;
    skillPoints: number;
    specialPoints: number;
}

const GradientButton = ({
    onClick,
    additionalClasses = "",
    isUpdating,
    label,
}: {
    onClick: () => void;
    additionalClasses?: string;
    isUpdating: boolean;
    label: string;
}) => (
    <button
        onClick={onClick}
        disabled={isUpdating}
        className={`absolute p-3 rounded-full disabled:opacity-50 transition-all duration-300 hover:scale-110 shadow-lg ${additionalClasses}`}
    >
        <span className={`h-5 w-5 transition-transform duration-300 ${isUpdating ? "animate-spin" : ""}`}>
            {label}
        </span>
    </button>
);

const ArcadeCard = ({
    userName,
    league,
    ArcadePoints,
    points,
    lastUpdated,
    gamePoints,
    triviaPoints,
    skillPoints,
    specialPoints,
}: ArcadeCardProps) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [urlProfile, setUrlProfile] = useStorage("urlProfile", "");
    const [arcadeData, setArcadeData] = useStorage("arcadeData", {});
    const [arcadeBadges, setArcadeBadges] = useStorage("arcadebadges", {});

    const handleUpdatePoints = async () => {
        setIsUpdating(true);

        try {
            const response = await axios.post("https://cors.eplus.dev/https://arcadepoints.vercel.app/api/submit", {
                url: urlProfile,
            });

            if (response.status === 200) {
                const { userDetails, arcadePoints, badges } = response.data;

                setArcadeData((prevData) => ({
                    ...prevData,
                    userDetails: userDetails[0],
                    arcadePoints,
                    lastUpdated: new Date().toISOString(),
                }));
                setArcadeBadges(badges);

                toast.success("Submission successful!");
            } else {
                toast.error("Failed to submit URL.");
            }
        } catch (error) {
            toast.error("An error occurred while submitting the URL.");
            console.error("Error submitting URL:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOpenSettings = () => chrome.runtime.openOptionsPage();

    return (
        <div className="w-[400px] mx-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-[700px] relative overflow-hidden shadow-2xl rounded-xl">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-purple-500 blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-blue-500 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-pink-500 blur-3xl opacity-20"></div>
            </div>

            {/* Content container */}
            <div className="relative z-10 p-4">
                {/* Header with points */}
                <div className="relative mb-6 pt-6"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-sm"></div>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                            Arcade Points
                        </h1>
                        <div className="relative mt-2"></div>
                            <div className="text-6xl font-black text-white tracking-tighter">{ArcadePoints}</div>
                            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                +0
                            </div>
                        </div>
                    </div>

                    {/* Update Button */}
                    <GradientButton
                        onClick={handleUpdatePoints}
                        additionalClasses="top-2 right-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white"
                        isUpdating={isUpdating}
                        label="↻"
                    />

                    {/* Settings Button */}
                    <GradientButton
                        onClick={handleOpenSettings}
                        additionalClasses="top-2 left-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                        isUpdating={isUpdating}
                        label="⚙"
                    />
                </div>

                <ArcadeProfile userName={userName} league={league} points={points} arcadePoints={ArcadePoints} />

                <ArcadeBadge gamePoints={gamePoints} triviaPoints={triviaPoints} skillPoints={skillPoints} specialPoints={specialPoints} />

                <ArcadeActivity />

                {/* Footer */}
                <button
                    onClick={handleUpdatePoints}
                    className="w-full py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold rounded-xl relative overflow-hidden group mt-3 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 transition-all duration-300"
                >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <span className="h-5 w-5 text-white animate-pulse">✨</span>
                    </div>
                    <span className="relative z-10 flex items-center justify-center">
                        <FontAwesomeIcon icon={faSparkles} className="h-5 w-5 text-white animate-pulse" />
                    </div>
                    <span className="relative z-10 flex items-center justify-center">
                        {chrome.i18n.getMessage("labelUpdatePoints")}
                        <FontAwesomeIcon icon={faArrowsRotate} className={`ml-2 h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
                    </span>
                </button>
                <div className="mt-6 text-center text-xs text-white/50">
                    {chrome.i18n.getMessage("labelLastUpdated")}: {new Date(lastUpdated).toLocaleString(navigator.language)}
                </div>
            </div>
        </div>
    );
};

export default ArcadeCard;