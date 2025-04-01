# Contributions

Please refer to the sections below to find the appropriate destination for your contributions. Thank you for your support!

---

## Reporting Issues

The issue tracker in this repository is deprecated. Use the links below to report your issues.

[![DeepSource](https://app.deepsource.com/gh/ePlus-DEV/google-cloud-skills-boost-helper.svg/?label=resolved+issues&show_trend=true&token=AHAf1IA_VVViJ2ZUj08CNAdX)](https://app.deepsource.com/gh/ePlus-DEV/google-cloud-skills-boost-helper/) [![DeepSource](https://app.deepsource.com/gh/ePlus-DEV/google-cloud-skills-boost-helper.svg/?label=active+issues&show_trend=true&token=AHAf1IA_VVViJ2ZUj08CNAdX)](https://app.deepsource.com/gh/ePlus-DEV/google-cloud-skills-boost-helper/)

---

## Contributing Code

We welcome contributions to the project! Please follow these steps to contribute:

1. **Fork the Repository**  

    Create a fork of this repository to your GitHub account.

2. **Clone Your Fork**  

    Clone your forked repository to your local machine:

    ```bash
    git clone https://github.com/your-username/google-cloud-skills-boost-helper.git
    cd google-cloud-skills-boost-helper
    ```

3. **Install Dependencies**

    Ensure you meet the following system requirements:
    - Node.js 16.14.x or later
    - macOS, Windows, or Linux
    - (Strongly Recommended) [pnpm](https://pnpm.io/)

    Install the required dependencies using your preferred package manager:

    ```bash
    pnpm install

    # OR

    yarn install

    # OR

    npm install
    ```

4. **Development Server**

    Start the development server for live-reloading and HMR:

    ```bash
    pnpm dev
    ```

    This command will watch for file changes, regenerate a bundle of your extension in `.output\chrome-mv3`, and automatically reload your extension in the browser.

5. **Production Build**

    To create a production build, run:

    ```bash
    pnpm zip
    ```

    This will generate a production version of the extension in `.output\google-cloud-skills-boost-helper-{version}-chrome.zip`.

For more details, refer to the [WXT Framework Documentation](https://wxt.dev/guide/installation.html).
