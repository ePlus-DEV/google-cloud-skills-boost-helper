import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFireFlame, faBullseye, faSparkles, faArrowsRotate } from '@fortawesome/duotone-regular-svg-icons';
import { useStorage } from "@plasmohq/storage/hook";

interface Activity {
    title: string;
    dateEarned: string;
    points: number;
}

export default function ArcadeActivity({ isUpdating, onUpdatePoints }: { isUpdating: boolean; onUpdatePoints: () => void }) {
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
                Recent Activity
            </h3>

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
                            <div className="text-sm text-white">{activity.points} points</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center text-white mt-3">
                Page {currentPage}/{totalPages}
            </div>

            {visibleCount < activities.length && (
                <button
                    onClick={handleLoadMore}
                    className="w-full py-2.5 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 text-white font-bold rounded-xl mt-3 relative overflow-hidden group hover:from-teal-500 hover:via-blue-500 hover:to-green-500 transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <span className="relative z-10">Load More</span>
                </button>
            )}

            <button onClick={onUpdatePoints} className="w-full py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold rounded-xl relative overflow-hidden group mt-3 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 transition-all duration-300">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <FontAwesomeIcon icon={faSparkles} className="h-5 w-5 text-white animate-pulse" />
                </div>
                <span className="relative z-10 flex items-center justify-center">
                    Update Points
                    <FontAwesomeIcon icon={faArrowsRotate} className={`ml-2 h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
                </span>
            </button>
        </div>
    );
}