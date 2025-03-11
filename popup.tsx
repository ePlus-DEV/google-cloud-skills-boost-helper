import { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
const storage = new Storage({
  copiedKeyList: ["shield-modulation"]
})

import "./style.css"

function IndexPopup() {
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  useEffect(() => {
    // Load the initial state from storage
    storage.get("showLeaderboard").then((value) => {
      if (value !== null) {
        setShowLeaderboard(value === "true")
      }
    })

    // Watch for changes in the storage
    // storage.watch({
    //   showLeaderboard: (c) => {
    //     setShowLeaderboard(c.newValue === "true")
    //   }
    // })
  }, [])

  useEffect(() => {
    // Save the state to storage whenever it changes
    storage.set("showLeaderboard", showLeaderboard)
  }, [showLeaderboard])

  return (
    <div className="w-420px max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
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
                  checked={showLeaderboard}
                  className="form-checkbox h-5 w-5 text-blue-600"
                  onChange={() => setShowLeaderboard(!showLeaderboard)}
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
