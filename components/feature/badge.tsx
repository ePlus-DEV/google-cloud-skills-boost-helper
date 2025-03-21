function BadgeTable({ gamePoints, triviaPoints, skillPoints, specialPoints, }: { gamePoints: string; triviaPoints: string; skillPoints: string; specialPoints: string }) {
    return (
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
                        <BadgeRow name="Game Badge" value={gamePoints} isEven />
                        <BadgeRow name="Trivia Badge" value={triviaPoints} />
                        <BadgeRow name="Skill Badge" value={skillPoints} isEven />
                        <BadgeRow name="special Points" value={specialPoints} />
                    </tbody>
                </table>
            </section>
        </div>
    );
}

function BadgeRow({ name, value, isEven }: { name: string; value: string; isEven?: boolean }) {
    return (
        <tr className={isEven ? "bg-blue-200 dark:bg-gray-700" : "bg-blue-100 dark:bg-gray-800"}>
            <td className="text-left p-4 font-medium border-r border-blue-600 dark:border-gray-500">{name}</td>
            <td className="text-left p-4 font-semibold">{value}</td>
        </tr>
    );
}

export default BadgeTable;