import { useState, useEffect } from "react"
import avatar from "data-base64:~assets/google.png";
import diamond from "data-base64:~assets/badge/diamond.png";
import silver from "data-base64:~assets/badge/silver.png";
import gold from "data-base64:~assets/badge/gold.png";
import bronze from "data-base64:~assets/badge/bronze.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/duotone-regular-svg-icons';
import ArcadeProfile from "~components/feature/arcade/profile";
import ArcadeBadge from "~components/feature/arcade/badges";
import ArcadeActivity from "~components/feature/arcade/activity";

export default function ArcadeCard({ userName, league, ArcadePoints, points, lastUpdated, gamePoints, triviaPoints, skillPoints, specialPoints }: { userName: string; league: string; ArcadePoints: number; points: number; lastUpdated: string; gamePoints: number; triviaPoints: number; skillPoints: number; specialPoints: number }) {
    const [isUpdating, setIsUpdating] = useState(false)

    const handleUpdatePoints = () => {
        setIsUpdating(true)

        setTimeout(() => {
            setIsUpdating(false)
        }, 1500)
    }

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
                <div className="relative mb-6 pt-6">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-sm"></div>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                            Arcade Points
                        </h1>
                        <div className="relative mt-2">
                            <div className="text-6xl font-black text-white tracking-tighter">{ ArcadePoints }</div>
                            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                +2.3
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleUpdatePoints}
                        disabled={isUpdating}
                        className="absolute top-0 right-0 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-full disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20"
                    >
                        <FontAwesomeIcon icon={faArrowsRotate} className={`h-5 w-5 ${isUpdating ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {/* Profile card */}
                <ArcadeProfile userName={userName} league={league} points={points} />

                {/* Badges section */}
                <ArcadeBadge gamePoints={gamePoints} triviaPoints={triviaPoints} skillPoints={skillPoints} specialPoints={specialPoints} />

                {/* Recent activity */}
                <ArcadeActivity isUpdating={ isUpdating } />

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-white/50">
                    Last updated: { new Date(lastUpdated).toLocaleString(navigator.language) }
                </div>
            </div>
        </div>
    );
}