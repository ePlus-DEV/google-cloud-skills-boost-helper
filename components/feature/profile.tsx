import someCoolImage from "data-base64:~assets/google.png";
import diamond from "data-base64:~assets/badge/diamond.png";
import silver from "data-base64:~assets/badge/silver.png";
import gold from "data-base64:~assets/badge/gold.png";
import bronze from "data-base64:~assets/badge/bronze.png";

function ProfileCard({ userName, league, ArcadePoints, points, lastUpdated }: { userName: string; league: string; ArcadePoints: number; points: number; lastUpdated: string }) {
    return (
        <div className="md:col-span-2 lg:col-span-1">
            <h1 className="w-full text-center bg-gradient-to-r from-red-500 to-red-700 text-white py-3 mb-2 rounded-lg shadow-md">
                <div>
                    Arcade Points: {ArcadePoints}
                    <br />
                    <small className="text-gray-400">Last updated: {new Date(lastUpdated).toLocaleString(navigator.language)}</small>
                </div>
            </h1>
            <div className="flex flex-col items-center justify-center gap-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl px-6 py-10 shadow-lg transform transition duration-300">
                <img
                    alt="profile-image"
                    loading="lazy"
                    width="160"
                    height="160"
                    decoding="async"
                    data-nimg="1"
                    className="rounded-full border-4 border-white shadow-lg transition duration-200 transform hover:scale-105"
                    src={someCoolImage}
                />
                <h1 className="text-center text-2xl font-bold tracking-wide">{userName}</h1>
                <img
                    src={ league === "Diamond League" ? diamond : league === "Gold League" ? gold : league === "Silver League" ? silver : bronze }
                    alt="badge-icon"
                    className="w-24 h-24 transition duration-200 transform hover:scale-110"
                />
                <h1 className="text-lg font-medium tracking-wide bg-white text-blue-600 px-4 py-2 rounded-full shadow-md">{league}</h1>
                <h1 className="text-lg font-medium tracking-wide">{points.toLocaleString(navigator.language)}</h1>
            </div>
        </div>
    );
}

ProfileCard.defaultProps = {
    userName: "Default User",
    league: "Bronze",
    ArcadePoints: 0,
    points: 0,
};

export default ProfileCard;