import { useStorage } from "@plasmohq/storage/hook"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopyright, faToggleOn } from '@fortawesome/duotone-regular-svg-icons'
import "./style.css"

function IndexPopup() {

    const [checked, setChecked] = useStorage("checked", false)

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked)
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", padding: 16, width: 300, }}>
                <h3 className="text-xl font-semibold text-center">{ chrome.i18n.getMessage("extensionName") }</h3>

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
                                        onChange={handleCheckboxChange}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2">
                                Public Profile
                            </td>
                            <td className="border px-4 py-2">
                                <a href="https://www.cloudskillsboost.google/my_account/profile#public-profile" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                                    <FontAwesomeIcon icon={faToggleOn} size="2x" />
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <footer className="mt-4 text-center text-gray-500">
                <FontAwesomeIcon icon={faCopyright} /> {new Date().getFullYear()} - <a href="http://eplus.dev" target="_blank" className="text-blue-600">ePlus.DEV</a>
            </footer>
        </div>
    )
}

export default IndexPopup