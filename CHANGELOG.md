# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.9] - 2025-04-16
### :sparkles: New Features
- [`86a036c`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/86a036c99713ebadd944428158cf06cec5d6735f) - add new icon and remove old logo *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :bug: Bug Fixes
- [`f959733`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/f959733878623b6dbe5042b0b9dbeb473e6824d2) - Detected usage of the any type JS-0323 *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :recycle: Refactors
- [`d0c96dd`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/d0c96dd48cbb65b3b8cc83ea30c4fe8b18764f80) - remove unused pageInfo from SEARCH_POSTS_QUERY and improve type definitions *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`551a013`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/551a013dd90dbe0d3f26488fc660229d3e6f34b6) - clean up code formatting and improve query text extraction logic *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`0f84523`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/0f84523f0ef26afd811679b2e27d44095f530182) - remove unnecessary console log for query text in fetchPostsOfPublicationOnce *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`1bb7251`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1bb7251051205152393ee4cd7c16bb9b13b2e609) - enhance UI updates and improve profile data handling in options page *(commit by [@hoangsvit](https://github.com/hoangsvit))*


## [1.0.8] - 2025-04-15
### :sparkles: New Features
- [`a218fad`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/a218fad99473dd0799bbb5d1a54c69b67d2fa158) - add Firefox submission steps and environment variables to release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`765d538`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/765d53888e409a838ffcb8d01b9e7ff52ea45413) - :wrench: UAParser *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :bug: Bug Fixes
- [`9eb2779`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/9eb2779d958fcbb2d5c02709a873696f9b066c22) - ensure submission to stores only runs on tagged releases *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`5786c4b`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/5786c4b706dbde0b5c8dc8c5bcef55dbd45a295b) - ensure cache directories exist before caching Yarn dependencies *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`adc2a5e`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/adc2a5eb092e9ae3f59a6d8a5c3712aad0871993) - update release workflow to include Chrome zip submission and add missing secrets *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`4476da7`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4476da7b87731b9d8205b2d8d522571c80b4dbf2) - disable conditional check for Chrome zip submission in release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`4e7f88f`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/4e7f88fd4a89f0e73d830a7a62f388689ed27f50) - remove conditional check for GitHub ref in store submission step *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`92a6456`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/92a64565028101ebc7bc06a37ff2f000850014d0) - comment out CHANGELOG.md commit step and conditional check for store submission *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`8f4b638`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/8f4b6382f854d927e8b84f7642d22675477cb10d) - comment out CHANGELOG update and commit steps in release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`9335a87`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/9335a878f9fb9a8922aaf016aff1ab2b61708394) - restore CHANGELOG update and commit steps in release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`1ac9b7d`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1ac9b7d6478e59f509a693c9c36ed65cc8bdb6b5) - remove branch trigger from release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`5eb6608`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/5eb660816ed90c36cf72eb085c29ccb468da40ad) - restore CHANGELOG update and commit steps in release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`1ba2580`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/1ba2580775fc2e902a2b3c09e07cd0dfd2fba892) - update version to 1.0.8 in package.json *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`a065dde`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/a065dde85c62029c199c6b7c6ed43f13385942e4) - correct tag pattern in release workflow *(commit by [@hoangsvit](https://github.com/hoangsvit))*

### :recycle: Refactors
- [`710a8ad`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/710a8ad66b063027e887e0d25ae46c1074f99db7) - streamline Yarn caching and improve build output verification *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`0c92d9f`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/0c92d9fbff9c2e5ba503fba4bbadb4d7d4e63dba) - improve Yarn caching setup and simplify build output verification *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`48ac114`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/48ac11461724cf87ee604ffa951fc95a0eafd755) - remove branch restriction from release workflow and standardize cache syntax *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`8637831`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/8637831a3998d97c70622dbdef4d1665b49152b3) - restrict tag pattern for release workflow and add CHANGELOG update steps *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`51bf531`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/51bf531655109f8d1d7ce0ef8e16f5cdf44d2508) - remove branch restriction from release trigger *(commit by [@hoangsvit](https://github.com/hoangsvit))*
- [`3995f75`](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/commit/3995f75ee63995a87969f2b127505538726b0734) - add sortBy parameter to searchPostsOfPublication query and update fetch function *(commit by [@hoangsvit](https://github.com/hoangsvit))*

[1.0.8]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/compare/1.0.7...1.0.8
[1.0.9]: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/compare/1.0.8...1.0.9
