# CloudSkills AutoScript

CloudSkills AutoScript is a Chrome extension that automatically modifies CloudSkillsBoost Labs with toggle options.

![postspark_export_2025-03-10_18-06-17](https://github.com/user-attachments/assets/2f157ec3-b7bf-4287-a0a2-ef13c3fc69b7)

## Features

- Automatically hides or shows the leaderboard on CloudSkillsBoost Labs.
- Displays the script status on the UI.
- Provides a toggle button to enable or disable the script.

## Installation

1. Clone the repository or download the ZIP file.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the directory containing the extension files.

## Usage

1. Once the extension is installed, navigate to any CloudSkillsBoost Lab page.
2. The extension will automatically inject the content script and modify the page based on the script's status.
3. Click on the extension icon to toggle the script on or off.
4. The script status will be displayed on the UI, and the leaderboard will be hidden or shown accordingly.

## Localization

The extension supports multiple languages. The following languages are currently available:

- English (en)
- French (fr)
- Vietnamese (vi)

## File Structure

```
background.js
content.js
icon.png
manifest.json
_locales/
  en/
    messages.json
  fr/
    messages.json
  vi/
    messages.json
```

## Contributing

Feel free to contribute to this project by submitting issues or pull requests.

## License

This project is licensed under the MIT License.
