# Contributing

Thank you for your interest in contributing. Please read this guide before submitting issues or pull requests.

---

## Reporting Issues

Use the [GitHub issue tracker](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/issues) to report bugs or request features.

When filing a bug report, include:

- Browser name and version
- Extension version
- Steps to reproduce
- Expected vs. actual behavior

---

## Contributing Code

### Requirements

- **Node.js** ≥ 24
- **Yarn** (the project uses Yarn — do not use npm or pnpm)
- macOS, Windows, or Linux

### Setup

```bash
git clone https://github.com/ePlus-DEV/google-cloud-skills-boost-helper.git
cd google-cloud-skills-boost-helper
yarn install
```

### Development

```bash
yarn dev            # Chrome (hot-reload)
yarn dev:firefox    # Firefox (hot-reload)
```

The extension is output to `.output/chrome-mv3/` and reloads automatically on file changes.

### Before Submitting a PR

All of the following must pass:

```bash
yarn compile          # TypeScript type check
yarn test:coverage    # CI-equivalent tests and 60% coverage gate
yarn build            # Production Chrome build
```

### Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR.
- Target the `dev` branch, not `main`.
- Write or update tests for any changed logic in `services/` or `utils/`.
- Commit messages should follow [Conventional Commits](https://www.conventionalcommits.org/):

  ```text
  feat: add arcade milestone badge
  fix: correct profile URL canonicalization for qwiklabs.com
  chore: bump wxt to 0.21.0
  ```

- PRs that fail `yarn compile`, `yarn test:coverage`, or `yarn build` will not be reviewed.

### Project Structure

| Path           | Purpose                                                      |
| -------------- | ------------------------------------------------------------ |
| `entrypoints/` | WXT entrypoints (background, content script, popup, options) |
| `services/`    | All business logic — keep UI-free                            |
| `components/`  | DOM element factories for content script UI                  |
| `utils/`       | Pure utility functions                                       |
| `types/`       | Shared TypeScript types                                      |
| `tests/`       | Vitest unit tests mirroring `services/` and `utils/`         |

---

## Building for Release

```bash
yarn build          # Chrome production build
yarn build:firefox  # Firefox production build
yarn zip            # Package Chrome build → .zip
yarn zip:firefox    # Package Firefox build → .zip
```

Output artifacts are placed in `.output/`.

---

This project is not affiliated with or endorsed by Google.
