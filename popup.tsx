import { useStorage } from "@plasmohq/storage/hook"
import "./style.css"

function IndexPopup() {
  const [openCount] = useStorage<number>("open-count", (storedCount) =>
    typeof storedCount === "undefined" ? 0 : storedCount + 1
  )

  const [checked, setChecked] = useStorage("checked", true)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
        width: 300,
      }}>
        <h1 className="text-2xl font-bold text-center">Cloud Skills Boost</h1>
      <p className="text-gray-600 mt-2 text-center">Enhance your cloud skills with our leaderboard feature.</p>
      <div className="mt-4">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Tính năng</th>
              <th className="py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Show Leaderboard</td>
              <td className="border px-4 py-2">
                <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default IndexPopup