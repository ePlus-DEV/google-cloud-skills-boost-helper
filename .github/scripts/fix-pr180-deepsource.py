from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file_path = Path(path)
    text = file_path.read_text()
    if old not in text:
        raise RuntimeError(f"Expected text not found in {path}: {old[:80]!r}")
    file_path.write_text(text.replace(old, new, 1))


replace_once(
    "components/accountUIComponents.ts",
    'import type { Account, CreateAccountOptions } from "../types";\n\nfunction escapeHtml(value: string): string {',
    'import type { Account, CreateAccountOptions } from "../types";\n\n/**\n * Escape text before interpolating it into HTML markup.\n */\nfunction escapeHtml(value: string): string {',
)

replace_once(
    "components/accountUIComponents.ts",
    '    const hideModal = () => this.hideImportModal();',
    '    /** Hide the import modal. */\n    const hideModal = () => this.hideImportModal();',
)

replace_once(
    "services/accountService.ts",
    '    const accounts = data.accounts;\n\n    // First, canonicalize profileUrl for each account if possible',
    '    const accounts = data.accounts;\n    const duplicateAccountIds = new Set<string>();\n\n    // First, canonicalize profileUrl for each account if possible',
)

replace_once(
    "services/accountService.ts",
    '        // Remove the duplicate account\n        delete accounts[otherId];',
    '        // Mark the duplicate account for removal after merging completes.\n        duplicateAccountIds.add(otherId);',
)

replace_once(
    "services/accountService.ts",
    '    // Persist changes\n    await this.saveAccountsData(data);',
    '    data.accounts = Object.fromEntries(\n      Object.entries(accounts).filter(\n        ([accountId]) => !duplicateAccountIds.has(accountId),\n      ),\n    ) as typeof accounts;\n\n    // Persist changes\n    await this.saveAccountsData(data);',
)

replace_once(
    "services/markdownService.ts",
    'function normalizeUrlForSchemeCheck(value: string): string {',
    '/**\n * Normalize a URL-like value before checking its scheme.\n */\nfunction normalizeUrlForSchemeCheck(value: string): string {',
)

replace_once(
    "services/markdownService.ts",
    'function hasAllowedUrlScheme(\n  value: string,',
    '/**\n * Check whether a URL uses an allowed scheme or is relative.\n */\nfunction hasAllowedUrlScheme(\n  value: string,',
)

replace_once(
    "services/markdownService.ts",
    'function hasAllowedImageSource(value: string): boolean {',
    '/**\n * Check whether an image source is safe to render.\n */\nfunction hasAllowedImageSource(value: string): boolean {',
)

replace_once(
    "services/markdownService.ts",
    'function sanitizeMarkdownHtml(html: string): string {',
    '/**\n * Sanitize rendered Markdown and enforce safe link and image attributes.\n */\nfunction sanitizeMarkdownHtml(html: string): string {',
)

replace_once(
    "services/popupService.ts",
    'function escapeHtml(value: string): string {',
    '/**\n * Escape text before interpolating it into popup HTML markup.\n */\nfunction escapeHtml(value: string): string {',
)

replace_once(
    "services/popupService.ts",
    'function sanitizeProfileImageUrl(value?: string | null): string {',
    '/**\n * Return a profile image URL only when it uses an approved image scheme.\n */\nfunction sanitizeProfileImageUrl(value?: string | null): string {',
)

replace_once(
    "services/searchService.ts",
    '  private static querySelectorDeep(selector: string): Element | null {',
    '  /**\n   * Search the document and all accessible nested shadow roots.\n   */\n  private static querySelectorDeep(selector: string): Element | null {',
)

print("Applied all PR 180 DeepSource fixes.")
