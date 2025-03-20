import someCoolImage from "data-base64:~assets/coming-soon.png"
import React, { useCallback, useState } from "react";
import "./style.css";
import { useStorage } from "@plasmohq/storage/hook";

function IndexPopup() {
    const [checked, setChecked] = useStorage("checked", false);

    const handleCheckboxChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setChecked(event.target.checked);
        },
        [setChecked]
    );

    return (
        <div className="w-[400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 shadow-lg rounded-lg p-1">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 shadow-lg rounded-lg p-1">
            <div className="md:col-span-2 lg:col-span-1">
                <h1 className="w-full text-center bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 mb-2 rounded-lg shadow-md">Arcade Points: 20</h1>
                <div className="flex flex-col items-center justify-center gap-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl px-6 py-10 shadow-lg transform transition duration-300">
                    <img alt="profile-image" loading="lazy" width="160" height="160" decoding="async" data-nimg="1" className="rounded-full border-4 border-white shadow-lg transition duration-200 transform hover:scale-105" src={someCoolImage}/>
                    <h1 className="text-center text-2xl font-bold tracking-wide">Hoang Minh</h1>
                    <img src={someCoolImage} alt="badge-icon" className="w-24 h-24 transition duration-200 transform hover:scale-110" />
                    <h1 className="text-lg font-medium tracking-wide bg-white text-blue-600 px-4 py-2 rounded-full shadow-md">Diamond League</h1>
                    <h1 className="">107745 points</h1>
                </div>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
                <section className="flex flex-col justify-between items-center h-full">
                    <table className="font-mono w-full overflow-hidden shadow-lg rounded-lg">
                        <thead>
                        <tr>
                            <th className="text-center p-4 font-bold text-lg bg-gradient-to-r from-blue-300 to-blue-500 dark:from-blue-500 dark:to-blue-700 border-r border-blue-600 dark:border-gray-500 rounded-tl-lg">Badges</th>
                            <th className="text-center p-4 font-bold text-lg bg-gradient-to-r from-blue-300 to-blue-500 dark:from-blue-500 dark:to-blue-700 rounded-tr-lg">Completion</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr className="bg-blue-200 dark:bg-gray-700">
                            <td className="text-left p-4 font-medium border-r border-blue-600 dark:border-gray-500">Game Badge</td>
                            <td className="text-left p-4 font-semibold">7</td>
                        </tr>
                        <tr className="bg-blue-100 dark:bg-gray-800">
                            <td className="text-left p-4 font-medium border-r border-blue-600 dark:border-gray-500">Trivia Badge</td>
                            <td className="text-left p-4 font-semibold">8</td>
                        </tr>
                        <tr className="bg-blue-200 dark:bg-gray-700">
                            <td className="text-left p-4 font-medium border-r border-blue-600 dark:border-gray-500">Skill Badge</td>
                            <td className="text-left p-4 font-semibold">1</td>
                        </tr>
                        <tr className="bg-blue-100 dark:bg-gray-800">
                            <td className="text-left p-4 font-medium border-r border-blue-600 dark:border-gray-500">Swag Eligibility</td>
                            <td className="text-left p-4 font-semibold">TBD</td>
                        </tr>
                        </tbody>
                    </table>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full mt-4">
                        <div className="flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-red-300 dark:from-gray-700 dark:to-red-900 px-1 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-full">
                        <h1 className="text-base lg:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">STANDARD</h1>
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-gray-800 rounded-full flex justify-center items-center overflow-hidden shadow-inner mb-4"><img src={someCoolImage} alt="Prize 15" className="w-20 h-20 md:w-28 md:h-28 object-contain hover:scale-150 transition-all duration-500" /></div>
                        <h1 className="text-lg font-medium text-gray-700 dark:text-gray-300">15 Points</h1>
                        </div>
                        <div className="flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-700 dark:to-blue-900 px-1 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-full">
                        <h1 className="text-base lg:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">ADVANCED</h1>
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-gray-800 rounded-full flex justify-center items-center overflow-hidden shadow-inner mb-4"><img src={someCoolImage} alt="Prize 30" className="w-20 h-20 md:w-28 md:h-28 object-contain hover:scale-150 transition-all duration-500" /></div>
                        <h1 className="text-lg font-medium text-gray-700 dark:text-gray-300">30 Points</h1>
                        </div>
                        <div className="flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-green-300 dark:from-gray-700 dark:to-green-900 px-1 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-full">
                        <h1 className="text-base lg:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">PREMIUM</h1>
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-gray-800 rounded-full flex justify-center items-center overflow-hidden shadow-inner mb-4"><img src={someCoolImage} alt="Prize 45" className="w-20 h-20 md:w-28 md:h-28 object-contain hover:scale-150 transition-all duration-500" /></div>
                        <h1 className="text-lg font-medium text-gray-700 dark:text-gray-300">45 Points</h1>
                        </div>
                        <div className="flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-yellow-300 dark:from-gray-700 dark:to-yellow-900 px-1 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-full">
                        <h1 className="text-base lg:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">PREMIUM PLUS</h1>
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-gray-800 rounded-full flex justify-center items-center overflow-hidden shadow-inner mb-4"><img src={someCoolImage} alt="Prize 65" className="w-20 h-20 md:w-28 md:h-28 object-contain hover:scale-150 transition-all duration-500" /></div>
                        <h1 className="text-lg font-medium text-gray-700 dark:text-gray-300">65 Points</h1>
                        </div>
                    </div>
                    <div className="my-2 bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-700 dark:to-gray-900 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-full">
                        <h1 className="text-center">Expected prize tiers shown here.</h1>
                    </div>
                </section>
            </div>
            </div>
        </div>
    );
}

export default IndexPopup;
