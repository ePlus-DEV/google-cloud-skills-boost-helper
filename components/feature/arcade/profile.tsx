import avatar from "data-base64:~assets/google.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/duotone-regular-svg-icons';

export default function ArcadeProfile({ userName, league, points, }: { userName: string; league: string;  points: number; }) {

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
    );
}