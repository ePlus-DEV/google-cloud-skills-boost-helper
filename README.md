<h1 align="center">
  <sub>
    <img src="https://cdn.jsdelivr.net/gh/ePlus-DEV/google-cloud-skills-boost-helper/assets/icon.png" height="38" width="38">
  </sub>
  Google Cloud Skills Boost - Helper
</h1>
<p align="center">
  A browser extension designed to optimize your learning experience on Google Cloud Skills Boost.
</p>

<p align="center">
  <a href="https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/actions/workflows/ci.yml"><img src="https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/security/code-scanning"><img src="https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/actions/workflows/github-code-scanning/codeql/badge.svg" alt="CodeQL"></a>
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
</p>

---

| [![Chrome Web Store](https://github.com/user-attachments/assets/4d8fd051-4c28-4290-afb8-9c182bb2b5d3)](https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg?utm_source=github) | [![Firefox Add-ons](https://github.com/user-attachments/assets/20177a18-81db-45ed-8838-64c29df48d34)](https://addons.mozilla.org/addon/cloud-skills-boost-helper) | [![Microsoft Edge Manual Install](https://img.shields.io/badge/Microsoft%20Edge-Manual%20Install-0078D7?logo=microsoftedge&logoColor=white)](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/releases/?utm_source=github) | [![Opera Manual Install](https://img.shields.io/badge/Opera-Manual%20Install-FF1B2D?logo=opera&logoColor=white)](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/releases/?utm_source=github) |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

---

![postspark_export_2025-03-12_16-00-50](https://github.com/user-attachments/assets/a01c7592-8c29-4002-9f27-3375df34bbdd)

---

- [Introduction](#introduction)
- [Key Features](#key-features)
- [Installation](#installation)
- [Development](#development)
- [Contributing](#contributing)
- [About](#about)
- [Disclaimer](#disclaimer)

## Introduction

Google Cloud Skills Boost Helper is a browser extension that enhances your experience on [Google Cloud Skills Boost](https://www.cloudskillsboost.google). It tracks Arcade points, manages multiple accounts, surfaces leaderboard data, and helps you find lab solutions — all without leaving the platform.

## Key Features

**🎯 Arcade Points Calculator** — Automatically fetches and calculates your total Arcade points, including Facilitator Program bonuses, with a live countdown to the current season deadline.

**👥 Multi-Account Management** — Switch between multiple profiles without logging out. Each account maintains its own snapshot of arcade data.

**📊 Leaderboard & Scoreboard** — View your ranking at a glance and toggle leaderboard visibility on demand.

**🔍 Lab Solution Search** — Fuzzy-matches the current lab name against a solutions database and surfaces a direct link, with fallback search via Google or YouTube.

**🌐 13 Languages Supported** — Interface localized for English, Vietnamese, Japanese, Korean, Chinese (Simplified), French, German, Spanish, Portuguese (BR), Italian, Russian, Arabic, and Hindi.

## Installation

Install from an official store where available:

- [Chrome Web Store][Chrome]
- [Firefox Add-ons][Mozilla]
- [Manual installation for Microsoft Edge][Edge]
- [Manual installation for Opera][Opera]
- [Manual Installation][Manual Installation] (any Chromium-based browser)

## Development

**Requirements:** Node.js ≥ 24, Yarn

```bash
yarn install          # Install dependencies
yarn dev              # Start dev server (Chrome)
yarn dev:firefox      # Start dev server (Firefox)
yarn compile          # TypeScript type check
yarn test             # Run unit tests without coverage
yarn test:coverage    # Run the CI-equivalent test suite and coverage gate
yarn build            # Production build
yarn zip              # Package for distribution
```

Built with [WXT Framework](https://wxt.dev). See [CONTRIBUTING.md](CONTRIBUTING.md) for full contribution guidelines.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request — it covers setup, branching, commit conventions, and PR requirements.

## About

[Privacy Policy][Privacy Policy] · [MIT License][License]

Free and open-source. No donations are sought.

## Disclaimer

This project is not affiliated with or endorsed by Google. All trademarks and logos belong to their respective owners.

<!----------------------------------------------------------------------------->

[Mozilla]: https://addons.mozilla.org/addon/cloud-skills-boost-helper
[Chrome]: https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg/?utm_source=github
[Opera]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/releases/?utm_source=github
[Edge]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/releases/?utm_source=github
[License]: LICENSE.md

<!---------------------------------[ Internal ]-------------------------------->
