# Contributions

Please refer to the sections below to find the appropriate destination for your contributions. Thank you for your support!

---

## Reporting Issues

Open an issue in the [GitHub issue tracker](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/issues) when you find a bug or want to request an improvement.

---

## Contributing Code

We welcome contributions to the project! Please follow these steps to contribute:

1. **Fork the Repository**

   Create a fork of this repository in your GitHub account.

2. **Clone Your Fork**

   Clone your forked repository to your local machine:

   ```bash
   git clone https://github.com/your-username/google-cloud-skills-boost-helper.git
   cd google-cloud-skills-boost-helper
   ```

3. **Install Dependencies**

   Ensure you meet the following system requirements:

   - Node.js 24 or later
   - Yarn
   - macOS, Windows, or Linux

   Install the required dependencies:

   ```bash
   yarn install
   ```

4. **Development Server**

   Start the development server for live reloading and HMR:

   ```bash
   yarn dev
   ```

   This command watches for file changes, regenerates the extension bundle in `.output/chrome-mv3`, and reloads the extension in the browser.

5. **Validate Your Changes**

   Run the type checker and tests before submitting a pull request:

   ```bash
   yarn compile
   yarn test
   ```

6. **Production Package**

   Create the distributable package:

   ```bash
   yarn zip
   ```

   The generated archive is available at `.output/google-cloud-skills-boost-helper-{version}-chrome.zip`.

For more details, refer to the [WXT Framework Documentation](https://wxt.dev/guide/installation.html).