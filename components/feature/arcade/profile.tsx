import avatar from "data-base64:~assets/google.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/duotone-regular-svg-icons';

export default function ArcadeProfile({ userName, league, points, arcadePoints }: { userName: string; league: string; points: number; arcadePoints: number; }) {
    const milestones = [
        { points: 15, league: "STANDARD" },
        { points: 30, league: "ADVANCED" },
        { points: 45, league: "PREMIUM" },
        { points: 65, league: "PREMIUM PLUS" }
    ];

    const roundedArcadePoints = Math.floor(arcadePoints);
    const currentLevel = milestones.findIndex(milestone => roundedArcadePoints < milestone.points) + 1 || milestones.length + 1;
    const nextMilestone = milestones.find(milestone => milestone.points > roundedArcadePoints) || milestones[milestones.length - 1];
    const isMaxLevel = nextMilestone.points === milestones[milestones.length - 1].points;
    const currentLeague = milestones.find(milestone => roundedArcadePoints < milestone.points)?.league || milestones[milestones.length - 1].league;

    return (
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
                            {currentLeague}
                        </div>
                        <div className="ml-2 text-xs text-white/70">{points}</div>
                    </div>
                </div>
            </div>

            <div className="mt-4 w-full bg-white/10 rounded-full h-1.5">
                <div style={{ width: `${(roundedArcadePoints / (isMaxLevel ? milestones[milestones.length - 1].points : nextMilestone.points)) * 100}%` }}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full">
                    <div className="absolute inset-0 bg-white/30 animate-pulse-slow"></div>
                </div>
            </div>
            <div className="mt-1 flex justify-between text-xs text-white/70">
                <span>Level {currentLevel}</span>
                <span>Next: {isMaxLevel ? "Max Level" : `${nextMilestone.points - arcadePoints} points`}</span>
            </div>
        </div>
    );
}