import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFireFlame, faBullseye } from '@fortawesome/duotone-regular-svg-icons';
import { useStorage } from "@plasmohq/storage/hook";

interface Activity {
    title: string;
    dateEarned: string;
    points: number;
}

export default function ArcadeActivity() {
    const [arcadeBadges] = useStorage<Activity[]>("arcadebadges", []);
    const [visibleCount, setVisibleCount] = useState(3);

    const activities: Activity[] = arcadeBadges;
    const totalPages = Math.ceil(activities.length / 3);
    const currentPage = Math.ceil(visibleCount / 3);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 3);
    };

    return (
        <div>
            <h3 className="text-white font-bold mb-3 flex items-center">
                <FontAwesomeIcon icon={faFireFlame} className="h-5 w-5 mr-2 text-orange-400" />
                {chrome.i18n.getMessage("labelRecentActivity")}
            </h3>

            {activities.length === 0 ? (
                <div className="text-center bg-gradient-to-r from-gray-800 via-gray-900 to-black py-4 px-6 rounded-xl shadow-sm">
                    <span className="text-gray-400 font-medium">
                        {chrome.i18n.getMessage("messageNoDataAvailable")}
                    </span>
                </div>
            ) : (
                <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {activities.slice(0, visibleCount).map((activity, index) => (
                            <div
                                key={index}
                                className="bg-white/10 backdrop-blur-md rounded-xl p-3 hover:bg-white/20 transition-colors duration-300 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white">
                                            <FontAwesomeIcon icon={faBullseye} className="h-4 w-4" />
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-white font-bold">{activity.title}</div>
                                            <div className="text-sm text-gray-300">{activity.dateEarned}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-white">{activity.points} {chrome.i18n.getMessage("Points")}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center text-white mt-3">
                        {chrome.i18n.getMessage("labelPage")} {currentPage}/{totalPages}
                    </div>

                    {visibleCount < activities.length && (
                        <button
                            onClick={handleLoadMore}
                            className="w-full py-2.5 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 text-white font-bold rounded-xl mt-3 relative overflow-hidden group hover:from-teal-500 hover:via-blue-500 hover:to-green-500 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            <span className="relative z-10">{chrome.i18n.getMessage("labelLoadMore")}</span>
                        </button>
                    )}
                </>
            )}
        </div>
    );
}