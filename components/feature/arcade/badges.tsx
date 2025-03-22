import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faStar, faBolt, faAward, faMedal } from '@fortawesome/duotone-regular-svg-icons';

export default function ArcadeBadge({ gamePoints, triviaPoints, skillPoints, specialPoints }: { gamePoints: number; triviaPoints: number;  skillPoints: number; specialPoints: number; }) {
    
    const badgeData = [
        {
            name: "Game Badge",
            value: gamePoints,
            icon: <FontAwesomeIcon icon={faTrophy} className="w-5 h-5 text-yellow-400" />,
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
            icon: <FontAwesomeIcon icon={faBolt} className="w-5 h-5 text-blue-400" />,
            color: "from-blue-400 to-indigo-500",
        },
        {
            name: "Special Points",
            value: specialPoints,
            icon: <FontAwesomeIcon icon={faMedal} className="w-5 h-5 text-green-400" />,
            color: "from-green-400 to-emerald-500",
        },
    ];

    return (
     <div className="mb-4">
        <h3 className="text-white font-bold mb-3 flex items-center">
            <FontAwesomeIcon icon={faAward} className="h-5 w-5 mr-2 text-pink-400" />
            {chrome.i18n.getMessage("labelBadgesAchievements")}
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
    );
}