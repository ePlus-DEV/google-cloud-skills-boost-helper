# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
