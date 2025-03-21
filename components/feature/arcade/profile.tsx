import { useState, useEffect } from "react"
import avatar from "data-base64:~assets/google.png";
import diamond from "data-base64:~assets/badge/diamond.png";
import silver from "data-base64:~assets/badge/silver.png";
import gold from "data-base64:~assets/badge/gold.png";
import bronze from "data-base64:~assets/badge/bronze.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faStar, faBolt, faAwardSimple, faCrown, faAward, faFireFlame, faBullseye, faSparkles, faArrowsRotate } from '@fortawesome/duotone-regular-svg-icons';

export default function ArcadeProfile({ userName, league, ArcadePoints, points, lastUpdated, gamePoints, triviaPoints, skillPoints, specialPoints }: { userName: string; league: string; ArcadePoints: number; points: number; lastUpdated: string; gamePoints: string; triviaPoints: string; skillPoints: string; specialPoints: string }) {
    const [currentDateTime, setCurrentDateTime] = useState(new Date())
    const [isUpdating, setIsUpdating] = useState(false)
    const [activeTab, setActiveTab] = useState("profile")

    const handleUpdatePoints = () => {
            setIsUpdating(true)

            setTimeout(() => {
                setIsUpdating(false)
            }, 1500)
        }

    const formattedDate = currentDateTime.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })

  const formattedTime = currentDateTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  const badgeData = [
    {
        name: "Game Badge",
        value: gamePoints,
        icon: <FontAwesomeIcon icon={faTrophy} className="w-5 h-5 text-yellow-400"  />,
        color: "from-yellow-400 to-orange-500",
    },
    {
        name: "Trivia Badge",
        value: triviaPoints,
        icon: <FontAwesomeIcon icon={faStar} className="w-5 h-5 text-purple-400" />,
        color: "from-purple-400 to-indigo-500",
    },
    {
        name: "Skill Badge",
        value: skillPoints,
        icon: <FontAwesomeIcon icon={faBolt} className="w-5 h-5 text-white" />,
        color: "from-blue-400 to-cyan-500",
    },
    {
        name: "Special Points",
        value: specialPoints,
        icon: <FontAwesomeIcon icon={faAwardSimple} className="w-5 h-5 text-green-400" />,
        color: "from-green-400 to-emerald-500",
    },
  ]

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
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-4 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="flex items-center">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-spin-slow blur-md"></div>
                            <div className="relative z-10">
                                <img src={avatar} width={80} height={80} className="rounded-full border-2 border-white/50 p-0.5" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1 z-20">
                                <FontAwesomeIcon icon={faCrown} className="h-3 w-3 text-white" />
                            </div>
                        </div>

                        <div className="ml-4">
                            <h2 className="text-xl font-bold text-white">{userName}</h2>
                            <div className="flex items-center mt-1">
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center">
                                    <FontAwesomeIcon icon={faCrown} className="h-3 w-3 mr-1" />
                                    {league}
                                </div>
                                <div className="ml-2 text-xs text-white/70">{points}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 w-full bg-white/10 rounded-full h-1.5">
                        <div
                            className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 h-1.5 rounded-full relative overflow-hidden"
                            style={{ width: "65%" }}
                        >
                            <div className="absolute inset-0 bg-white/30 animate-pulse-slow"></div>
                        </div>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-white/70">
                        <span>Level 3</span>
                        <span>Next: 25 points</span>
                    </div>
                </div>

                {/* Badges section */}
                <div className="mb-4">
                    <h3 className="text-white font-bold mb-3 flex items-center">
                        <FontAwesomeIcon icon={faAward} className="h-5 w-5 mr-2 text-pink-400" />
                        Badges & Achievements
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        {badgeData.map((badge, index) => (
                            <div
                                key={index}
                                className="bg-white/10 backdrop-blur-md rounded-xl p-3 hover:bg-white/20 transition-colors duration-300 group relative overflow-hidden"
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                                ></div>

                                <div className="flex items-center">
                                    <div
                                        className={`h-10 w-10 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center`}
                                    >
                                        {badge.icon}
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-white font-bold">{badge.value}</div>
                                        <div className="text-xs text-white/70">{badge.name}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent activity */}
                <div>
                    <h3 className="text-white font-bold mb-3 flex items-center">
                        <FontAwesomeIcon icon={faFireFlame} className="h-5 w-5 mr-2 text-orange-400" />
                        Recent Activity
                    </h3>

                    <div className="space-y-3">
                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="bg-white/10 backdrop-blur-md rounded-xl p-3 hover:bg-white/20 transition-colors duration-300 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                                <div className="flex justify-between items-start">
                                    <div className="flex items-start">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white">
                                            <FontAwesomeIcon icon={faBullseye} className="h-4 w-4" />
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-white font-bold">Challenge #{item}</div>
                                            <div className="text-xs text-white/70 mt-0.5">
                                                Earned {Math.floor(Math.random() * 100) + 50} points
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-white/50">
                                        {new Date(Date.now() - item * 86400000).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="mt-3 w-full bg-white/10 rounded-full h-1.5">
                                    <div
                                        className="bg-gradient-to-r from-blue-400 to-indigo-500 h-1.5 rounded-full relative overflow-hidden"
                                        style={{ width: `${Math.floor(Math.random() * 60) + 40}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/30 animate-pulse-slow"></div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button className="w-full py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold rounded-xl relative overflow-hidden group">
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
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-white/50">
                    Last updated: {formattedDate}, {formattedTime}
                </div>
            </div>
        </div>
    );
}