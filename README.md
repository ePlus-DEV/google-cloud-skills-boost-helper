# CloudSkills AutoScript

CloudSkills AutoScript is a Chrome extension that automatically modifies CloudSkillsBoost Labs with toggle options. It allows users to enable or disable the script, hide or show the leaderboard, and provides visual feedback on the script's status.

## Features

- Enable or disable the script from the popup.
- Hide or show the leaderboard on CloudSkillsBoost Labs.
- Visual feedback on the script's status.

## Installation

1. Clone the repository or download the ZIP file.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the directory containing the extension files.

## Usage

1. Click on the extension icon to open the popup.
2. Use the toggle switch to enable or disable the script.
3. The script will automatically modify the CloudSkillsBoost Labs page based on the toggle state.
4. The extension icon will display a badge indicating whether the script is enabled ("ON") or disabled ("OFF").

## Localization

The extension supports multiple languages. The following locales are available:

- English (en)
- French (fr)
- Vietnamese (vi)

## Files

- `background.js`: Handles background tasks, such as injecting the content script and updating the extension badge.
- `content.js`: Modifies the CloudSkillsBoost Labs page based on the script's enabled state.
- `_locales/`: Contains localization files for different languages.
- `manifest.json`: The manifest file for the Chrome extension.

## License

This project is licensed under the MIT License.
