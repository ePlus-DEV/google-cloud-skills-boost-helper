function BadgeTable() {
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
                        <BadgeRow name="Game Badge" value="7" isEven />
                        <BadgeRow name="Trivia Badge" value="8" />
                        <BadgeRow name="Skill Badge" value="1" isEven />
                        <BadgeRow name="Swag Eligibility" value="TBD" />
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