# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.3] - 2025-10-10
### :sparkles: New Features
- [`4964bb7`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4964bb74d133ed02740b1d5b386f03b3abe18ef5) - add facilitator service for milestone requirements and bonus calculations
- [`6e16222`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/6e1622200d5d0dc9576be7b3240820c5b902772e) - add badge display toggle functionality and UI updates
- [`cd85636`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/cd85636e02a345b39b26e7917e245842f7416885) - update badge display functionality and integrate facilitator bonus calculation
- [`b782dbe`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b782dbebeb83ecc5b07984000c911346b683289a) - enhance search feature toggle with improved UI and status synchronization
- [`53fb842`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/53fb84244440d6cefaa56f94ee31fac048aee43e) - refactor badge update logic and implement clearBadge helper function
- [`ec1e530`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/ec1e530629584708a873fa4e66a3a1cbae90c0a8) - implement refreshBadgeForActiveAccount helper and update badge handling in OptionsService
- [`6c6614a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/6c6614afa76ce2a724fdeb4408b8c7a79fb42358) - enhance badge action handling with typed accessors for browser and chrome APIs
- [`f620bc6`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f620bc61b215c800ce58ae81161bbed31b65c20a) - add UI color configuration for consistent badge color usage across services
- [`712e7c7`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/712e7c7b512bcc7a9d22f8e752fde2f8e4ead122) - add example environment variables for local configuration
- [`226efe5`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/226efe56b39a4c64a3509463ba9ae9ae34b6900a) - add changelog functionality with test button in popup
- [`e241884`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/e2418846a315619e1e985f4c5aa6a4fe27674701) - implement changelog page with remote markdown loading
- [`944cf9c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/944cf9c24bbcb877a5ba6db72c643a5eee5e7b17) - enhance changelog UI with new styles and localization support

### :bug: Bug Fixes
- [`d19b78c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d19b78cb6b68c8e21c8c66243eacb96a2d71e906) - correct formatting in loadChangelog function and ensure version is displayed in page title

### :recycle: Refactors
- [`42eb94e`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/42eb94e7374b533da0b750afda68061c36619f85) - streamline badge handling functions and improve message processing

### :wrench: Chores
- [`bedb7c9`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/bedb7c934d995382c746aba9fd804242f8688b80) - update version to 1.2.3 in package.json


## [1.2.2] - 2025-10-07
### :sparkles: New Features
- [`59a75f1`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/59a75f1f7dffa5c293da0abdb511e1f022b04284) - enhance user profile handling and data initialization *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`0f1cea1`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/0f1cea1be6231bd7941718d984b2713a6dffb625) - add new logo and icons, update avatar selector, and improve settings handling *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b489a7f`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b489a7fd223b4eee4576406d1a9abf30563d7964) - add options page with settings and features for user customization *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`310fea5`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/310fea5f91ac666cbb8cd9b0379b8f79c66e3b43) - update content script to match new URL and enhance UI by removing leaderboard and updating score display *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`e297ce6`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/e297ce6b9a89ad03f6cef385850f8fa74fadaafe) - extend content script to support profile page and enhance UI interactions *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`6dfd0ef`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/6dfd0ef2aa4b7c4d3e09ae5ffc12346050b1c2bd) - add notification for updating settings button with styled reminder *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f26919e`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f26919ebf5565ed730554fe196d042221383dd37) - refactor UI creation and enhance public profile settings notification *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`2be10f1`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/2be10f1f48e6ad179d59e3f0be23467f48c12340) - add URL submission functionality and enhance user interface updates *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3a58d71`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3a58d71147594ff8f8c3fb1f61646a0dd2595221) - add error handling for invalid profile URL submission and update localization messages *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`a606d80`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/a606d80bbbf94a207e10b0e7ade067edcdcfcb93) - add success message display for URL submission and update localization strings *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`5dce230`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/5dce2300959e63df85fa89b318f25cdf3fc209ed) - refactor URL submission logic and improve message display functionality *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`c82de66`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/c82de66ec6092264b7a687ef3cc31c4b45cdf96c) - add last updated timestamp to user details display and storage *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`8613406`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/8613406f5636b12a5a94615f3286d02a2627f869) - reset badge counts to zero and update avatar source URL *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`824682b`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/824682b9f3b7d91a0c354e460fe698baf29ca1d6) - update progress bar and league information display logic *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`5d1127c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/5d1127c89f48e42063c4bb957fc9ec40de2926e5) - add badge display functionality to user activity UI *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`4857b07`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4857b07a955c83fcd402cde07e69b5a0eebf5607) - implement pagination for badge display in user activity UI *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`2264f78`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/2264f78d4622de6d6ed4b7e921bcca8fa2be9697) - implement load more functionality for badge display in user activity UI *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`d061f25`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d061f25062eb495cc5a783c1d45854704b799e7f) - enhance badge loading with improved pagination and dynamic load more text *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`40f4980`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/40f498086f2bbe74d02d206da294229ff73a4504) - update lastUpdated type to String and adjust related functionality *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`0a50573`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/0a50573b76ca750fe2c2d76b0e81d5f81101223c) - update INSTALL.md with installation instructions and add body_path to release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`61ad063`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/61ad0633729cb803f332fbf61468049fad422f2b) - add Safari build step to release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`c332604`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/c332604f7e081de5db045a7bd6da82aa2093830f) - enhance options page with version display and improved styling *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`d6929eb`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d6929eb034f30cd4ed1b4832252fe7ac15811785) - add background script to open options page on extension install *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`6526d53`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/6526d53d035539218e09c8595b6e0019dd761c29) - add documentation for initializeProfileUrl function to clarify its purpose and behavior *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`7201a5f`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/7201a5ff3eccc81104760888a6df885a53ba266f) - integrate Apollo Client and add GraphQL query for fetching publication posts *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3e36cdf`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3e36cdf4bc0f8305911ca301d878fc145e2c16cf) - configure environment variables for API URL and key *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f6bd6cf`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f6bd6cf7c2b3a23cf3efe320740efe5a2df75e64) - update API URL to use environment variable for submission *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`91aeeef`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/91aeeef38f15be732190f4bd9b12000bf6d918d1) - add environment variables for API key and URLs in release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b111c13`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b111c136a6b4d3ad3c2655c3fa924c7f79412b45) - add MIT License file *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`0e8eb11`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/0e8eb11fbaac79451cbf110a08a05366581e0dba) - add "Copy Link" button to public profile for easy link sharing *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`a4bd592`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/a4bd592a433ce8178e097d0866312417e5617a15) - add clipboard copy confirmation message for public profile links *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`e354def`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/e354defa5ef48cb5f362d3b83ddf38389c22cba0) - enhance UI and update version display format *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`dbe80d7`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/dbe80d7236b376f866ae7198347896f84ba9a46d) - add Firefox submission steps and environment variables to release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`6ea5a91`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/6ea5a910be656f2a5ca661630598eb340c4e8dbc) - :wrench: UAParser *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`185380d`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/185380d961438c314f90dc98b80248be063470b3) - add new icon and remove old logo *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`42c84be`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/42c84be1e41c3ff2767d62e4f071779189fe3182) - integrate Fuse.js for improved fuzzy search functionality and update version to 1.1.3 *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`88d6f03`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/88d6f03fc77072908f80ad1449507dbc2ec67d07) - Add services for API client, arcade data, badges, and UI management *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`8be1357`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/8be13576025b1b7263dda1e766cfbf1890135f4f) - Add architecture and refactoring summary documentation *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b4fbc5f`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b4fbc5f8d8424497fb9b979fbd4deae3a7ca89c1) - Enhance search service with improved identifier extraction and compatibility checks *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`70b405a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/70b405ada96feae2ba42eb313d7e1ce1a04f829f) - Implement Arcade Points Scraping without API *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`871dc96`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/871dc96fd2c6f83032680d8278b6afcb4b747f25) - Integrate real HTML structure for arcade scraping service *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3507b28`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3507b28a3f88179f07486489e5bd7faedbd499b4) - Add CSV export functionality and arcade dashboard scraping service *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3eecd3b`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3eecd3b32c7d08a16e70c2423f5afba56ef14b06) - Add functionality to export available arcade events to CSV *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`376cefa`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/376cefaf5763de34ecb7a63afb5323688a714c33) - Enhance arcade points calculation to include Level badges *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`0bd5865`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/0bd5865483a0c87fec40fe196a3e7e7f04b8a16c) - Implement enhanced matching logic in SearchService with flexible filtering criteria *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`bdbcfac`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/bdbcfacccfe541f47a9a0cb1b579566fc424f697) - Add Google and YouTube search functionality for labs without solutions *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`e75ab3d`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/e75ab3d230281f59a338a940f1cd3eea65054009) - Add i18n setup for translation handling in options page *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`5ff5c3d`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/5ff5c3de617fd1114152fcd4207f460821c20a02) - add markdown service and integrate markdown rendering in options page *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`7650821`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/7650821253dcf448e2ef0d3e4abe74574b0f80af) - Enhance Markdown rendering and link handling in popup *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`2a471fd`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/2a471fdbab85d3ccaa5f21e3882740aa122433e5) - enhance link opening functionality with improved error handling and user notifications *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`c230071`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/c230071c5691b2c6a0875b9840e6474aace3964d) - implement multi-account management system *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`bf87809`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/bf878099aeec0f32a47f966d2ac2a7eb77d2bcf2) - enhance account management UI with add, edit, and import functionalities *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f609988`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f6099885ad15c172c5539ee0e886719a2fc2156b) - add account existence check and user detail extraction *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`22742c6`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/22742c6f6d4fab4a885c553afd5871777ec95b0b) - enhance account management UI with dynamic account cards and improved event handling *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`4a7cbdd`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4a7cbdd5e574581e42dfeddbdca2a7e765df37ec) - add profile viewing functionality and quick account creation form to account management UI *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`7cc1274`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/7cc1274ee3d324494b77c379946ce40f90f06e53) - remove quick account creation form and related event listeners from account management UI *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3830c18`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3830c1895bea2fb71834e228db5db8e9659f8946) - enhance account management UI with improved button styles and accessibility features *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3fecf0a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3fecf0ade157370530134b484c4136da62c5eb7d) - streamline account creation process by removing unnecessary reload and updating UI interactions *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`c427cba`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/c427cba634af3d26cc78ace3141633ab83a4e781) - add account preview section with dynamic nickname display and statistics *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`2d9408c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/2d9408c921667fe5a6a7b3d424fc2e32d7e0c5ef) - update account preview with dynamic data and improved display *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`840b058`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/840b058e20fb0066294c60407dc8f7a76f0cc8fd) - implement guided tour functionality with custom styles and service integration *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`5375903`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/537590322923419e6d9b2781a932dc9bfc14be6a) - add guided tour functionality with localization support and new messages *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`c5c51f9`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/c5c51f96e080b4f428c740e03f4143bd0adb9d7f) - add error messages and success notifications for account management *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`6b97e82`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/6b97e82e987cded7a704896a477abc93b59cbdca) - add success and error messages for account management functionality *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b6a55f6`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b6a55f668a1f86b407f1f4ef56432e887352639b) - add utility functions for DOM manipulation, form validation, modal handling, and preview updates *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`648cc8e`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/648cc8ef4a91dece37a600117eeb9fdc6029a694) - Enhance milestone functionality in popup service *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`e61cb4d`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/e61cb4df6c9bec48edcdd230a7f08548b30c96e1) - Implement facilitator bonus points calculation and UI updates *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`6a105ee`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/6a105ee7bd5a3f0f68cd854b59ecac761479955b) - Add facilitator program countdown timer and update milestone section visibility *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`1b0ea9e`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1b0ea9ed5a2556d97ea1aa81e29511ee398a5156) - Implement countdown configuration monitoring and refresh functionality *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`0e85c75`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/0e85c759455360ac22d5cd08b948a72f8e049274) - enhance PopupUIService with milestone handling and user info normalization *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`34a75fb`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/34a75fbeed3cc569e6e9da61ba5ea696397bd3e9) - add support for additional lab page URLs in content script and update lab page check
- [`5640f59`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/5640f5916b8a5a10f441edee9da8f496980460a4) - add support for additional lab page URLs in content script and update lab page check *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :bug: Bug Fixes
- [`319c7b1`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/319c7b143ba4fddbe58d5e67411ce8e54e0fecb5) - update settings button functionality to open options page in a new tab *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f2b5068`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f2b5068625e0e67b29f3171648be371c347270bb) - update YouTube iframe attributes for improved rendering *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`7db7fc2`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/7db7fc23abe21a5d004cda2e537c047bd6bcb073) - correct file paths in release workflow configuration *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`d78a0d5`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d78a0d54cc939076bdb495943b47316b470f8f43) - update release workflow file paths and enhance INSTALL.md with download instructions *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`730afbd`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/730afbd1cf2bc547ca20a55cca39f68a1333604d) - correct build command for Safari in release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`1a93491`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1a934911387748ffb14dc26e1d22ac432dec8485) - update Safari build command to include output options and add additional output files to release *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`70fd119`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/70fd119f5e9a59b7cb1ef25f330807225e3c41b6) - remove Safari build commands from release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`5d2752d`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/5d2752d977eee0082e9562e77a16550bc83ee44a) - update extension descriptions for clarity and user experience *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`e669be2`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/e669be2d1ac16e5c4c4c2dc7379fddc55afaf575) - update initializeProfileUrl to return profile URL and set input value *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`6269455`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/6269455c56e85af196537514f17d0664e51924b1) - update options page layout for improved responsiveness *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`ec00b06`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/ec00b062b57c8edf6bc98ab38200ce8018ac9855) - handle case when no posts are found by displaying "No solution." *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`cbcabbb`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/cbcabbb0850c9fb30a6127ff92d2c3998507e973) - JS-0045, JS-0002, JS-0331 *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`ab37972`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/ab379720a3d5da0f47e4d2bde75d5c9ae9ecc22a) - update cache path for yarn dependencies in release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`d6837c2`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d6837c2c88bdce061ec849ac9e2e59be99d59db1) - refactor variable names for clarity in content script *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`bb541c6`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/bb541c613af709223bc3432cebe310cf6edb9a66) - update lab element selector for improved accuracy in content script *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`51df44e`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/51df44e3a66913316b3de7853cf9f4f11d5e51da) - reorder URL matches for content script to improve accuracy *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`8134bb6`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/8134bb612d6eff0c92212a5a1c87f53c45c564a1) - update version to 1.0.6 in package.json *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`81ceae3`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/81ceae35acf93c7786753e4446abd562b55229b8) - improve query text retrieval and clean up code formatting *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`6d65a05`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/6d65a05c31d4416e8da70c2406e4361fd4aae7cc) - simplify solution button rendering and remove unnecessary elements *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`50355f4`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/50355f43154952e86b5e609aec4b6fffe560745e) - update YouTube video source in options page *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b306956`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b306956edff92ba7e15c441a39bc84e5192ffcb1) - enhance query text validation and improve solution button rendering *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`de5c378`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/de5c378a43a864606fde485505cb0e75c43d034f) - simplify post fetching logic and refactor solution button creation *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`95ccdd9`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/95ccdd941a8e9ddeb10d0663db5c227021f5b2c0) - update version to 1.0.7 and add warning message for unsaved profile settings *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`49ae1be`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/49ae1beb534f50c24076624f01af03a288d15456) - correct formatting and logic in content script for better readability and functionality *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f324ed4`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f324ed42b18a2f949fdd45a01ff723efebbe5808) - JS-0050 *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`4df6b49`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4df6b49ce9e2ac6e0934ce14ae22ed0f133eaa0a) - add missing opening tag for div in index.html *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`9a10484`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/9a10484986f5619cb6baeddf39148593612edc16) - ensure submission to stores only runs on tagged releases *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`de79882`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/de798826ba8cf8697394f77b0ffc0e2c45bf4c19) - ensure cache directories exist before caching Yarn dependencies *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b057ac2`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b057ac29820713bb191eb5be5287a48b928a7180) - update release workflow to include Chrome zip submission and add missing secrets *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`43bb971`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/43bb97190862a48c64a1962cfc0f503006d70807) - disable conditional check for Chrome zip submission in release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`538fabf`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/538fabf2557636b7e5ffb96e8089d8da5a62a0a0) - remove conditional check for GitHub ref in store submission step *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`5e8931f`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/5e8931fff290d0bfc669de57201c203bf0fa37ec) - comment out CHANGELOG.md commit step and conditional check for store submission *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`1996ea9`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1996ea946c3f8b471f2aff76c4d2692e9747a386) - comment out CHANGELOG update and commit steps in release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`158c6cc`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/158c6cc6b12f9a649249f29550e2c6b769a5107b) - restore CHANGELOG update and commit steps in release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`a1130f8`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/a1130f80cf004d93dd733da93bc410d29a9e9b81) - remove branch trigger from release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`44ccb72`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/44ccb725edc23cb3c4113e949a591a8f7a99e509) - restore CHANGELOG update and commit steps in release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`9a95f8a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/9a95f8a614a8679375011637031068e0c7f3c135) - update version to 1.0.8 in package.json *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`9f2e515`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/9f2e5154fd640ac89211c1185ba774666e0349b5) - correct tag pattern in release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`39b7cc4`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/39b7cc4b62eee93711ce9bbc914cf523f4ebefb0) - Detected usage of the any type JS-0323 *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`d9c58de`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d9c58deaa5fcb33662b56914e490513dd8a52a8a) - clean up formatting and improve URL handling in content script *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`11cb614`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/11cb61485be95ae1fb74f06b6accb231f6c3b13c) - clean up formatting and improve readability in content script *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f167ba7`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f167ba783eec95690ee6de843de825d0696e7a55) - update developer URL to use HTTPS for improved security *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b44a500`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b44a500c57f78929c94c0fbb8f464652fbe4bf96) - remove unnecessary padding from blockquote styling in markdown *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`74f4737`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/74f4737b124e1e1af6324eb673f4a52b656e388d) - remove commented-out card for leaderboard from settings section *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3ffb26c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3ffb26c46f88270e4b63e9a7a7f1bbe3a8554610) - remove unused parameter from showLinkFallbackMessage function *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`4212c76`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4212c7642158c7dbc367c87dc8c1e5d8ba16e2d8) - validate URL in link fallback *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`d98ad16`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d98ad16a5aa07cccc63628f7b15cc2efe2c01bc0) - improve i18n error message *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`72463d4`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/72463d4566de8fddedb694583a7af6c277b19315) - handle userDetails array for profile image *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`7e6c48c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/7e6c48cbf9848a32196ddd8424dedb67a83e4547) - update tour modal content and tooltip positioning for better visibility *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`949ce8b`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/949ce8b57e0b81794fa7c57b43199309a251e52f) - enhance error handling in account management with improved UI feedback *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`7e50673`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/7e5067388552f844de393570dac49084423ddf38) - remove unnecessary await in account creation process *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`1fc531c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1fc531c20726676e51a00b21bbd9aa48b9e55ccb) - ensure safe removal of last child in account selector *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`36b166f`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/36b166fb2341c204f42ff0cab94a2ba7c7b62d4c) - simplify arcadeData parameter in account creation *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`718cab1`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/718cab1453480f39bd765f47751b1071a6dd4a2e) - clean up string interpolation in tour service messages *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`a59b9be`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/a59b9bee2eac077c2c58448cd58e848a4c240271) - ensure safe deletion of account data by setting it to undefined *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`64b4da0`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/64b4da002d445299e75c4580a8931609bf4a4e05) - clean up string formatting and remove unnecessary line breaks in options service *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`acc7c1c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/acc7c1c3c39bfd8bdb82af13632ed8209f5ca3f2) - use optional chaining to simplify error message handling in options service *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`1801cdd`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1801cddb37554955726688a03b5095066fae7d48) - refactor account preview updates for improved readability and maintainability *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`ece1916`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/ece1916564423c7bc5829e800486f824746d9f88) - use optional chaining to simplify profile URL check in handleViewProfile *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f62aeb5`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f62aeb521e71f53bf85ae7a501cbff5a11ecd563) - move helper layer styles to the correct section for better organization *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`129f93b`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/129f93bcdae4f63f834293c52bdb59bec4cc6b0d) - rename error and success message IDs for account management clarity *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`e825e57`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/e825e573e9fb8124f57d82b5feed40927355cbf9) - remove unused PreviewUtils import from account UI components *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`840171c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/840171ce8e08b8cb0267284043fe0ef089b6a29c) - prevent unused variable warning in isValidUrl function *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`cfb0a1d`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/cfb0a1d974a4c38505e64076ee79ebfc522abb4b) - update milestone points and improve code formatting *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`880504e`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/880504e389a3ca76bc4e69b0a482dad74b3ed7c9) - update version to 1.1.7 in package.json *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`1186a3c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1186a3c4592c7ac06601f37e09ae2fe2e1f522c8) - correct import statement for tailwind.css and add missing comma in URL patterns
- [`139cd07`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/139cd075b9deeb777d945c286577ccb67c773cf3) - correct import statement for tailwind.css and add missing comma in URL patterns *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :recycle: Refactors
- [`bf257b8`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/bf257b8494321d6e7208f04750b0179465212947) - simplify element updates and improve class toggling *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f022257`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f02225700f3a204dc924775eb701542966bb7164) - streamline UI updates and improve data handling in user profile *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`cb029f6`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/cb029f65dd1904d130a808374056d57bc8643da2) - simplify DOM element updates and improve readability *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`e3d84ed`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/e3d84edc2a71139522de448e0138efe1971e8dca) - remove unused components (FeatureRow, FeatureTable, Footer, Header) *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`66402ab`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/66402ab6b2fa3937365a754f50dfb061076b14d8) - simplify badge rendering logic and add detailed documentation *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`0d5df20`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/0d5df20dee45b0612098f64d7486215a896ef6d0) - enhance badge rendering logic and improve pagination handling *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f638587`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f638587b24872054a07cda8060e1a28e5b0fb3fc) - restructure profile URL initialization and event listener setup *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`065fb89`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/065fb896769a6f8abb2fbfe47e4ccc6f7ef4a0f2) - streamline release workflow and remove unused FontAwesome configuration *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`db5d911`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/db5d911cec4f46bfe7be33f4e6b4db664fc93d40) - remove unused background script *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`5efddec`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/5efddecec11b2539f7cd0d523346ad4530a94780) - clean up code by removing unnecessary comments and improving function structure *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`439e2bd`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/439e2bdec559464f2c9aea88bc5525c25b802c3a) - rename tailwind to tailwind-extension and improve profile scrolling logic *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`d8e51c5`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d8e51c5640fd9f008d574bbeeee28495da448439) - improve query handling and streamline outline processing in content script *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`e1b8c4b`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/e1b8c4b03cb92b3504ef2b3a3a9f24a675e37d1c) - clean up HTML structure and improve readability in options page *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`d59ddf0`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d59ddf0d3861572705a4983c2c12043d3e7842c9) - streamline Yarn caching and improve build output verification *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`831ae82`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/831ae825946495ccd725ac317bb92ebaf7345b3d) - improve Yarn caching setup and simplify build output verification *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`4f17ff0`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4f17ff0e85874dfd21f38f365185951419c6acba) - remove branch restriction from release workflow and standardize cache syntax *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`65ff69c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/65ff69c52c6d4cf26b6dd85b78508de0db0bb9a8) - restrict tag pattern for release workflow and add CHANGELOG update steps *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`23b32af`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/23b32af4fa5a2980d089429f4dfda535b164db3e) - remove branch restriction from release trigger *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`dc6aa43`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/dc6aa43057d6eeda0b567610ad2226d398539eef) - add sortBy parameter to searchPostsOfPublication query and update fetch function *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`a6b52f6`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/a6b52f6c59dd789cccaf56172a786d729fc24909) - remove unused pageInfo from SEARCH_POSTS_QUERY and improve type definitions *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`99ce9a1`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/99ce9a1ac5be3ea2efb0533fd1ad245bc75adfcb) - clean up code formatting and improve query text extraction logic *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`4709b22`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4709b22e5f027ea989b399c1ca5f2e29c5e30f33) - remove unnecessary console log for query text in fetchPostsOfPublicationOnce *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`5f0c508`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/5f0c5080c443b187f4d75496c964508b153497b1) - enhance UI updates and improve profile data handling in options page *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`59f90e3`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/59f90e3ce931c64f1286359843aab084f1fe693f) - move video toggle functionality to main.tsx *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`290e42d`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/290e42d3473d05dc507874634cf0db456062974d) - remove console logs for cleaner code and improved performance *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`a5d30a1`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/a5d30a1c8a16e339088fb4439798b44bad8ef36d) - clean up code formatting and remove unnecessary console logs *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`c5faa87`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/c5faa87870014bc2e7cbbd1b21e0831c83b2be56) - convert ApiClient class to a singleton function and simplify method access *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`6d44d83`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/6d44d83d0cd325645445ffc5dea21ea27d1f9a21) - convert service classes to object literals and simplify method access *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`642fbf9`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/642fbf93186a0d7ded2ba6482b8765852216727a) - enhance global interface for UIComponents search functions *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b6ca3ff`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b6ca3ffde1ea00f68172827a23e9f4337db06250) - convert StorageService class to a module with standalone functions *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`4ca08a4`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4ca08a47ecd47c8477bc3e68bc1cc235fd07219d) - convert BadgeService class to an object literal and simplify method access *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b10e55b`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b10e55b39ac4adbfa59370f3d1615aecfbfdf599) - remove unused variable from main function and clean up imports in SearchService *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`0348147`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/03481470b01f18844bcf5af0dafc901112e7060d) - remove deprecated extensionApi property from config *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`01ae9f9`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/01ae9f9b5e6b9b7fdca391330866e73ccdf4c203) - update markdown content selector and enhance loading/error handling *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`fdec5b0`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/fdec5b019a67cc98511d1d4fc4d87b51be409b03) - update UI text to English and remove unused browser badge setup *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`8e9e4a0`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/8e9e4a0c6d2c33630b5180ecc400748aa77d9a6e) - remove i18n any cast *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`d03c485`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d03c485fe0ac9d44f6b80908f315de9cf541738f) - remove any type usage *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`711f8f3`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/711f8f34c4e21681482945e4b533bacd38c1423b) - improve testCopy function and remove console alerts *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`98981ee`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/98981ee53849c6be5e962f79e4af016f63c960e3) - Clean up console log statements in Firebase and Popup UI services *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`8a35b8a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/8a35b8ad6bbb0961c9bc0b892c4341a48d0bbf3c) - Remove unused methods and types from Firebase service and types *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`aaf303e`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/aaf303e567b0c9b125211da0385a0ec25c18efcd) - Update milestone section visibility logic in PopupUIService *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`6a82a26`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/6a82a267d24f6da15414f88d29c8e4a2e0951e71) - remove unused countdownTimezone retrieval in PopupUIService *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`d4bf90a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d4bf90a60390d881b942e479ba8d5c783f828e1a) - simplify facilitatorProgram assignment in createAccount method *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`61507ac`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/61507ac266c947eee7da511afaa07e17886fed23) - replace parseInt with Number.parseInt for consistency in FirebaseService *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`779b3db`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/779b3db6e4503405e7912ef1aa3aeaf5b08f8b4f) - replace parseInt with Number.parseInt for consistency in FirebaseService and PopupUIService *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`26e13f7`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/26e13f7cd77f57457efbde699e0a23b2bc3f2c87) - replace forEach with for...of loops for improved readability and performance *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`1481a6d`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1481a6dbbd91421fecd59306498449014d548e27) - streamline modal event handling and file input processing in AccountUIService *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`83a7570`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/83a7570c88709136e6d279c2a25e4891257a0076) - simplify account loading logic by extracting display text and avatar creation into dedicated methods *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`269b1b8`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/269b1b8391fca75d05166b6baf06e9c58efa2960) - improve code readability by standardizing parameter formatting and enhancing milestone update logic *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`381a2da`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/381a2da717fb822ccf2566476e99ad6235df3d7d) - rename milestones for clarity and consistency in PopupUIService
- [`11ddaf5`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/11ddaf53a33d48fb86eb9795b41994bba88226a3) - improve calculateLeagueInfo logic and clean up updateElementText parameters
- [`81741c1`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/81741c1f225bd45db534ea24c6a1842403a0e3a3) - enhance error handling and add facilitator program labels in multiple languages
- [`7ce762e`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/7ce762e2050899b75fdfbad9e79b0c43337021a4) - add parseNumericPoints and formatPointsThousands methods for improved point handling *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`bf25602`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/bf2560213d33e26af75488352dc1afac372e4dd4) - rename variable for clarity in parseNumericPoints method
- [`1d64912`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1d649124fb9d2ec6b016c466e6258ff4b2b708eb) - improve type safety by changing parameter types to 'unknown' in parseNumericPoints and formatPointsThousands methods

### :wrench: Chores
- [`54c13da`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/54c13dafba332e0da166f535ee88b2dcbf800c17) - update README for clarity and enhance description; bump version to 1.0.4 *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b5cb71a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b5cb71ab90759b993c3efb54000d3197f14cad26) - bump version to 1.0.5 *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b99176b`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b99176bd3456b2051a6a48259f8dbeccdbc2fc54) - bump version to 1.1.1 *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`7eaddff`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/7eaddffa096a38edcb72ce5d142c97bb41fadf6f) - update node engine requirement to >=22 *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`4f1d2f4`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4f1d2f4228fdf7343f3613fdec7118f01f0c1a2a) - update node engine requirement to >=22 *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3768959`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3768959615e29594a647fd75f1e69b878a5f57c0) - update version to 1.1.2 *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`e6e8d0b`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/e6e8d0b023f9c1726302f4b7bc7e16918fcb6b66) - Remove architecture and refactoring summary documentation files *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`a92d185`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/a92d185db7d76800ca69da91bb215f185b9c5119) - Bump version to 1.1.4 in package.json *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`dbc1c2d`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/dbc1c2dd6008a5d87803cf47b3d3773ec1d2ade2) - update version to 1.1.5 and add marked dependency *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`44f3c5f`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/44f3c5fad2658d0cb291139cff1bcdeb05342068) - correct storage item types *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`fa7f536`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/fa7f536d81d27fbb644e41c88158eba97bbe8b81) - bump version to 1.1.6 *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`db8b6d0`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/db8b6d0f827d0b066f97f7697da27ee2c1c02325) - remove unused dependencies from package.json and yarn.lock *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3f3aa0c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3f3aa0c0738b695bdc00948235e8aab82159f51a) - remove outdated MULTI_ACCOUNT_FEATURE documentation *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`077171c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/077171c3e81a4f0886a46a34ed5bc70291a80898) - bump version to 1.2.2
- [`493d312`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/493d312e3caf803a1aed5419e32b32398a414347) - bump version to 1.2.2 *(commit by [@hoangsvit](https://github.com/hoangsvit))*


## [1.2.1] - 2025-10-06
### :sparkles: New Features
- [`3b2712a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3b2712a211491997c1a025f0bf9038d1f25340a6) - Enhance milestone functionality in popup service *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`a74edc4`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/a74edc4b47ae9105bea94487d0a4b52dfae1f759) - Implement facilitator bonus points calculation and UI updates *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b85f69f`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b85f69fc92c81a30eef25889777cf6a266ce54b9) - Add facilitator program countdown timer and update milestone section visibility *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3976c12`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3976c12bac285a89cd77bd3d0f6f6f6d41b3aca4) - Implement countdown configuration monitoring and refresh functionality *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`ab52838`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/ab52838f22fdf42c02de039404452ee47cfb185d) - enhance PopupUIService with milestone handling and user info normalization *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :recycle: Refactors
- [`414f181`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/414f181cff41862d89fa82322627d9679cbbb62f) - Clean up console log statements in Firebase and Popup UI services *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`8777406`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/87774066812655f049901d6595065fcc50f24b36) - Remove unused methods and types from Firebase service and types *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`c583ed1`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/c583ed15d99ce1035e781a556189dceaf1dd03d4) - Update milestone section visibility logic in PopupUIService *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`0000612`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/000061271fe40ec2ce5e600cf4d333d6d23e31b4) - remove unused countdownTimezone retrieval in PopupUIService *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`ee961a6`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/ee961a61033706c89d495309925e6aa940430779) - simplify facilitatorProgram assignment in createAccount method *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`7223946`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/7223946bcfdbf73fa65f95ab9f2c089749df7995) - replace parseInt with Number.parseInt for consistency in FirebaseService *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`227b61a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/227b61aa557fdd5e4fcfba034f5c356a860b9d61) - replace parseInt with Number.parseInt for consistency in FirebaseService and PopupUIService *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`ed47556`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/ed47556f1fbfb9ff915401c4a6f74d3f24fcf6a1) - replace forEach with for...of loops for improved readability and performance *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`993c16d`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/993c16d31acf2cea5850f8e05ad2a2ae050e19f8) - streamline modal event handling and file input processing in AccountUIService *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3a29c0b`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3a29c0bd0fbeb1d4e973e9ccd244d6d5b7e7cc3f) - simplify account loading logic by extracting display text and avatar creation into dedicated methods *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`9ce6a9b`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/9ce6a9be36a591da8c3898f25c48b9c3632b1d47) - improve code readability by standardizing parameter formatting and enhancing milestone update logic *(commit by [@hoangsvit](https://github.com/hoangsvit))*


## [1.1.7] - 2025-08-24
### :bug: Bug Fixes
- [`38284a1`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/38284a1982c00f2e98cfdf9f20def5b449a18267) - update milestone points and improve code formatting *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`d70fe27`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d70fe2799af41d5c764ddcc8d64b845546cb1faa) - update version to 1.1.7 in package.json *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :recycle: Refactors
- [`3de7b25`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3de7b25aab4ed2463d902bd3a6ae41a5bdce62a7) - improve testCopy function and remove console alerts *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :wrench: Chores
- [`ef537fa`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/ef537fad0e575c3bee3974a589e79bd06cfa45d4) - remove outdated MULTI_ACCOUNT_FEATURE documentation *(commit by [@hoangsvit](https://github.com/hoangsvit))*


## [1.1.6] - 2025-08-11
### :sparkles: New Features
- [`b057c95`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b057c95ce2b57630fa3d7d731f51d17295de208a) - implement multi-account management system *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`51df6e2`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/51df6e2f48e072cadce3d645db0a0423523f1049) - enhance account management UI with add, edit, and import functionalities *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`d6687fc`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d6687fc9593251b7093da4accc75bb9a7bdf6df8) - add account existence check and user detail extraction *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`20653fb`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/20653fb56402fca41c8806990a4261fe387daecf) - enhance account management UI with dynamic account cards and improved event handling *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`2a9cfac`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/2a9cfac1088a93e57f8d6d1753207bc7c744ff0c) - add profile viewing functionality and quick account creation form to account management UI *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f696dd8`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f696dd8bee8e0502969d326efa21adedfc5ecb44) - remove quick account creation form and related event listeners from account management UI *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`5d3c8d4`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/5d3c8d4df9fca8e8ca9da4763c530d7eecbda610) - enhance account management UI with improved button styles and accessibility features *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`e6b666a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/e6b666a91aeaebb81fb8d2d1c1a713a58afe8c5a) - streamline account creation process by removing unnecessary reload and updating UI interactions *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`4d3d91a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4d3d91a8b5ec500004c6aea91e7531bc68e1f4c8) - add account preview section with dynamic nickname display and statistics *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`2e4cd5f`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/2e4cd5fb0c490c2e2d025e5a44f634071573cb3c) - update account preview with dynamic data and improved display *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`8774fab`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/8774fab1c748860b669ca73a08d85f98107cb280) - implement guided tour functionality with custom styles and service integration *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`24e2591`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/24e25911b5167763921737f5e4fc8d605bd9793e) - add guided tour functionality with localization support and new messages *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`55d3f75`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/55d3f756cb618a79d17d06684d2274f45d4edac9) - add error messages and success notifications for account management *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3d11ec1`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3d11ec11445c7ebbd407e22ab40ef6105ed81133) - add success and error messages for account management functionality *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`059a3f5`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/059a3f59815fb06788cab52547fb3b9454b99c78) - add utility functions for DOM manipulation, form validation, modal handling, and preview updates *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :bug: Bug Fixes
- [`1456b7e`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1456b7e3aff2a785582a7fb584ebd4e159760af1) - validate URL in link fallback *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`fd0e2af`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/fd0e2af9417e83b59e8c91861bac6f4cb37696a4) - improve i18n error message *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`cf80bc4`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/cf80bc42eb96f1cd46b35a46969feed4390b87ba) - handle userDetails array for profile image *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`031fdfd`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/031fdfdc693ad210992f35b3be7767a438adc77f) - update tour modal content and tooltip positioning for better visibility *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`5589766`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/55897665230b76f9131d06b80c9fdc39c319e62d) - enhance error handling in account management with improved UI feedback *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`cedf28c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/cedf28c670623a76908d15bb14b1c5390417db3a) - remove unnecessary await in account creation process *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`65433d0`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/65433d0fdf04f6bdefac199961ec32bb4aa40ed3) - ensure safe removal of last child in account selector *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`ad73995`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/ad7399565a5a6af44b88d714bff3ba5b4bcc6c95) - simplify arcadeData parameter in account creation *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`02c744c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/02c744c53e73e7093a9b0b88041023e1873cd524) - clean up string interpolation in tour service messages *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b7c74b9`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b7c74b9aa3615e2a679bf8d3a1bf89b188bcc908) - ensure safe deletion of account data by setting it to undefined *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`4f2ddd0`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4f2ddd0b2dade09f4f2d1f21d63fadb8db9bf94f) - clean up string formatting and remove unnecessary line breaks in options service *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`b8e710a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b8e710aa2ca4b00344ed4432868819f4b29e75e4) - use optional chaining to simplify error message handling in options service *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`13ecbf3`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/13ecbf3f78512019a3cb72d387ae7fbede24b54b) - refactor account preview updates for improved readability and maintainability *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`ae20462`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/ae204628542257c1822093db3e3a70fd37b47fdc) - use optional chaining to simplify profile URL check in handleViewProfile *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`116b3b6`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/116b3b67187a1a200deceecda7327bcb966019f8) - move helper layer styles to the correct section for better organization *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`168fbfb`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/168fbfb2be3b9ee2304a84da0c0fdda367a90914) - rename error and success message IDs for account management clarity *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`e7c1c63`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/e7c1c6325d8d30cf050b7030ef1cbc6ec567bb46) - remove unused PreviewUtils import from account UI components *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`95b76b9`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/95b76b985d14bb911090296f5874f90b61607398) - prevent unused variable warning in isValidUrl function *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :recycle: Refactors
- [`09f20a3`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/09f20a30bb848a0660f9398d031cf10385a56e68) - update UI text to English and remove unused browser badge setup *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`7ac37d7`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/7ac37d776e2250e62c42f709bb5dffc9098d2ee9) - remove i18n any cast *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`969ca18`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/969ca1857e68bf6a2e54092e92c36f88f43b8d46) - remove any type usage *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :wrench: Chores
- [`2c0a893`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/2c0a893903f0a61314fc2e513af4ee0bb111675c) - correct storage item types *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`6232c05`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/6232c058d5fb12c09d6450dd276894147d939f0c) - bump version to 1.1.6 *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`dbc7cc4`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/dbc7cc497aa5763789e46c00a723aadb0ff6a65e) - remove unused dependencies from package.json and yarn.lock *(commit by [@hoangsvit](https://github.com/hoangsvit))*


## [1.1.5] - 2025-08-02
### :sparkles: New Features
- [`e8744f2`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/e8744f2a9207310a2dcf706ecb64f34e96c9fe43) - add markdown service and integrate markdown rendering in options page *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`1b11f31`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1b11f31a7f9a73fc003c906e6f25a869b75cbfc1) - Enhance Markdown rendering and link handling in popup *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`325d243`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/325d2431497fcec1a3be3b6290959a868b6d8823) - enhance link opening functionality with improved error handling and user notifications *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :bug: Bug Fixes
- [`4bcc4e4`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4bcc4e4b52da9586e1c56903463f4aeb4a08c6e0) - update developer URL to use HTTPS for improved security *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f159ff1`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f159ff1bc80ba0348733d2bdb77af2aa63d4f82f) - remove unnecessary padding from blockquote styling in markdown *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f8daaf8`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f8daaf82551437bcbff09aac5f14eac1777c67bb) - remove commented-out card for leaderboard from settings section *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`a363c9b`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/a363c9bda860355911e279e5fa4a00608c22ba55) - remove unused parameter from showLinkFallbackMessage function *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :recycle: Refactors
- [`910e7d3`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/910e7d33195613bf8628fb303bd5a16be8b513fd) - remove deprecated extensionApi property from config *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`25520ac`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/25520ac77373a9435e75439d4f29151bf028f599) - update markdown content selector and enhance loading/error handling *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :wrench: Chores
- [`be0dc82`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/be0dc820058495b37be3b0064700fb2b51a78c87) - update version to 1.1.5 and add marked dependency *(commit by [@hoangsvit](https://github.com/hoangsvit))*


## [1.1.4] - 2025-07-27
### :sparkles: New Features
- [`ea900ba`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/ea900baa8a5c225c90d5f84f68d1b1dacd880c8f) - Add services for API client, arcade data, badges, and UI management *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`2387323`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/2387323be1cbf85d094aace744b957e603def55e) - Add architecture and refactoring summary documentation *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`5dad0fa`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/5dad0fa1e945baf1356572f4d36e708d68aaedd6) - Enhance search service with improved identifier extraction and compatibility checks *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`db5f26a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/db5f26a5cc4fe47ea6770235f8e49f4f8e28bd82) - Implement Arcade Points Scraping without API *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`a0a9c83`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/a0a9c83e1ed07626f741ef0d04f0e5f9e98d6701) - Integrate real HTML structure for arcade scraping service *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f33802a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f33802af4c823fa5cde845af91b0617436e9a33a) - Add CSV export functionality and arcade dashboard scraping service *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`7cdff44`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/7cdff44414bd59707b93aa2ac520c317a4488754) - Add functionality to export available arcade events to CSV *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`147a547`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/147a54770082e877ae203ef0f9e2e454459d3a5a) - Enhance arcade points calculation to include Level badges *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`39bfa17`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/39bfa17e66b4ed0af5de3a2d30e4d56477709491) - Implement enhanced matching logic in SearchService with flexible filtering criteria *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`6278d98`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/6278d986e7b7c157c144b74f1d196b59b6d5ad8b) - Add Google and YouTube search functionality for labs without solutions *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`d3233d2`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d3233d2dd777fc8a79903789fe4bc7405da6459d) - Add i18n setup for translation handling in options page *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :recycle: Refactors
- [`7dfe5eb`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/7dfe5eb1b046eab4a877cf064421811d1048de9e) - remove console logs for cleaner code and improved performance *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f2e4269`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f2e4269db9694e8b52afcd96f84013d5e6e4bbac) - clean up code formatting and remove unnecessary console logs *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f47e03e`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f47e03e82fb17d55ac23160ed2a4832debc867af) - convert ApiClient class to a singleton function and simplify method access *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`7d23e83`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/7d23e83abb0dfbcd017fd1521e4485b4c47728ba) - convert service classes to object literals and simplify method access *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`24a00e0`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/24a00e01c72b55041f65f9aeaddef8c195bb33f6) - enhance global interface for UIComponents search functions *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`369e293`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/369e293c9a87b55487a92197b90a6a580d221ea5) - convert StorageService class to a module with standalone functions *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`e0237c9`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/e0237c994ba83f8eb5368727a632b6706aa3edb0) - convert BadgeService class to an object literal and simplify method access *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`ac62736`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/ac6273620384f23aa70b1cffbe501a927aa9b5f1) - remove unused variable from main function and clean up imports in SearchService *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :wrench: Chores
- [`15cb36a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/15cb36ac86f07002e64e59cdd29ad67b099b28ae) - Remove architecture and refactoring summary documentation files *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`f9edc0e`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f9edc0eed7a09f9a8b27fcb1136aad009eeb8849) - Bump version to 1.1.4 in package.json *(commit by [@hoangsvit](https://github.com/hoangsvit))*


## [1.1.3] - 2025-06-21
### :sparkles: New Features
- [`3fd648b`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3fd648bdb90e964f16ab3c5caf8c5c8c9e70f2b4) - integrate Fuse.js for improved fuzzy search functionality and update version to 1.1.3 *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :bug: Bug Fixes
- [`7d9b66a`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/7d9b66a5775a41105c3271c4c0c2cfcba1912a42) - clean up formatting and improve URL handling in content script *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`730e50f`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/730e50f6c581340749209b2efe75388518868f57) - clean up formatting and improve readability in content script *(commit by [@hoangsvit](https://github.com/hoangsvit))*


## [1.1.2] - 2025-05-27
### :wrench: Chores
- [`b40c0eb`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/b40c0eb8d058413d3502610fdf0ba9e8d5f247b1) - update node engine requirement to >=22
- [`8bf4813`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/8bf4813b00161c3962b692d9de1e8c3dac29bd50) - update node engine requirement to >=22 *(commit by [@hoangsvit](https://github.com/hoangsvit))*


## [1.1.1] - 2025-05-24
### :recycle: Refactors
- [`6d1dc39`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/6d1dc390b4ff6cc77757364ee7e91a1c72f90061) - move video toggle functionality to main.tsx *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :wrench: Chores
- [`fd731e5`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/fd731e5614cddc39d6c0835347e57ad3091ad37c) - bump version to 1.1.1 *(commit by [@hoangsvit](https://github.com/hoangsvit))*


## [1.0.9] - 2025-04-16

### :sparkles: New Features

- [`86a036c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/86a036c99713ebadd944428158cf06cec5d6735f) - add new icon and remove old logo _(commit by [@hoangsvit](https://github.com/hoangsvit))_

### :bug: Bug Fixes

- [`f959733`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f959733878623b6dbe5042b0b9dbeb473e6824d2) - Detected usage of the any type JS-0323 _(commit by [@hoangsvit](https://github.com/hoangsvit))_

### :recycle: Refactors

- [`d0c96dd`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d0c96dd48cbb65b3b8cc83ea30c4fe8b18764f80) - remove unused pageInfo from SEARCH*POSTS_QUERY and improve type definitions *(commit by [@hoangsvit](https://github.com/hoangsvit))\_
- [`551a013`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/551a013dd90dbe0d3f26488fc660229d3e6f34b6) - clean up code formatting and improve query text extraction logic _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`0f84523`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/0f84523f0ef26afd811679b2e27d44095f530182) - remove unnecessary console log for query text in fetchPostsOfPublicationOnce _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`1bb7251`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1bb7251051205152393ee4cd7c16bb9b13b2e609) - enhance UI updates and improve profile data handling in options page _(commit by [@hoangsvit](https://github.com/hoangsvit))_

## [1.0.8] - 2025-04-15

### :sparkles: New Features

- [`a218fad`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/a218fad99473dd0799bbb5d1a54c69b67d2fa158) - add Firefox submission steps and environment variables to release workflow _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`765d538`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/765d53888e409a838ffcb8d01b9e7ff52ea45413) - :wrench: UAParser _(commit by [@hoangsvit](https://github.com/hoangsvit))_

### :bug: Bug Fixes

- [`9eb2779`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/9eb2779d958fcbb2d5c02709a873696f9b066c22) - ensure submission to stores only runs on tagged releases _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`5786c4b`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/5786c4b706dbde0b5c8dc8c5bcef55dbd45a295b) - ensure cache directories exist before caching Yarn dependencies _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`adc2a5e`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/adc2a5eb092e9ae3f59a6d8a5c3712aad0871993) - update release workflow to include Chrome zip submission and add missing secrets _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`4476da7`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4476da7b87731b9d8205b2d8d522571c80b4dbf2) - disable conditional check for Chrome zip submission in release workflow _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`4e7f88f`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4e7f88fd4a89f0e73d830a7a62f388689ed27f50) - remove conditional check for GitHub ref in store submission step _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`92a6456`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/92a64565028101ebc7bc06a37ff2f000850014d0) - comment out CHANGELOG.md commit step and conditional check for store submission _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`8f4b638`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/8f4b6382f854d927e8b84f7642d22675477cb10d) - comment out CHANGELOG update and commit steps in release workflow _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`9335a87`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/9335a878f9fb9a8922aaf016aff1ab2b61708394) - restore CHANGELOG update and commit steps in release workflow _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`1ac9b7d`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1ac9b7d6478e59f509a693c9c36ed65cc8bdb6b5) - remove branch trigger from release workflow _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`5eb6608`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/5eb660816ed90c36cf72eb085c29ccb468da40ad) - restore CHANGELOG update and commit steps in release workflow _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`1ba2580`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1ba2580775fc2e902a2b3c09e07cd0dfd2fba892) - update version to 1.0.8 in package.json _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`a065dde`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/a065dde85c62029c199c6b7c6ed43f13385942e4) - correct tag pattern in release workflow _(commit by [@hoangsvit](https://github.com/hoangsvit))_

### :recycle: Refactors

- [`710a8ad`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/710a8ad66b063027e887e0d25ae46c1074f99db7) - streamline Yarn caching and improve build output verification _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`0c92d9f`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/0c92d9fbff9c2e5ba503fba4bbadb4d7d4e63dba) - improve Yarn caching setup and simplify build output verification _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`48ac114`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/48ac11461724cf87ee604ffa951fc95a0eafd755) - remove branch restriction from release workflow and standardize cache syntax _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`8637831`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/8637831a3998d97c70622dbdef4d1665b49152b3) - restrict tag pattern for release workflow and add CHANGELOG update steps _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`51bf531`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/51bf531655109f8d1d7ce0ef8e16f5cdf44d2508) - remove branch restriction from release trigger _(commit by [@hoangsvit](https://github.com/hoangsvit))_
- [`3995f75`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3995f75ee63995a87969f2b127505538726b0734) - add sortBy parameter to searchPostsOfPublication query and update fetch function _(commit by [@hoangsvit](https://github.com/hoangsvit))_

[1.0.8]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/compare/1.0.7...1.0.8
[1.0.9]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/compare/1.0.8...1.0.9
[1.1.1]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/compare/1.1.0...1.1.1
[1.1.2]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/compare/1.1.1...1.1.2
[1.1.3]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/compare/1.1.2...1.1.3
[1.1.4]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/compare/1.1.3...1.1.4
[1.1.5]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/compare/1.1.4...1.1.5
[1.1.6]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/compare/1.1.5...1.1.6
[1.1.7]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/compare/1.1.6...1.1.7
[1.2.1]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/compare/1.1.7...1.2.1
[1.2.2]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/compare/1.2.1...1.2.2
[1.2.3]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/compare/1.2.2...1.2.3
