import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFireFlame, faBullseye, faSparkles, faArrowsRotate } from '@fortawesome/duotone-regular-svg-icons';

export default function ArcadeActivity({isUpdating}: {isUpdating: boolean}) {

    return (
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
    );
}