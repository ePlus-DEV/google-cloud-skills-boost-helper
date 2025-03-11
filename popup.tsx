import { useStorage } from "@plasmohq/storage/hook"
import "./style.css"

function IndexPopup() {

  const [checked, setChecked] = useStorage("checked", true)

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: 16, width: 300, }}>
        <h3 className="text-xl font-semibold text-center">{ chrome.i18n.getMessage("extensionName") }</h3>
        <p className="text-gray-600 mt-2 text-center">{ chrome.i18n.getMessage("optionsPageDescription") }</p>
      <div className="mt-4">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">{ chrome.i18n.getMessage("labelFeature") }</th>
              <th className="py-2">{ chrome.i18n.getMessage("labelStatus") }</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">{ chrome.i18n.getMessage("labelShowLeaderboard") }</td>
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