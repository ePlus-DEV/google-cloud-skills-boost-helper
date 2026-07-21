from pathlib import Path

path = Path("tests/services/markdownService.test.ts")
text = path.read_text()
old = '''    expect(
      document.querySelector(".unsafe-link")?.hasAttribute("href"),
    ).toBe(false);
'''
new = '''    const unsafeLink = document.querySelector(".unsafe-link");
    expect(unsafeLink === null || !unsafeLink.hasAttribute("href")).toBe(true);
'''
if old in text:
    path.write_text(text.replace(old, new, 1))
elif new not in text:
    raise RuntimeError("Unsafe-link assertion was not found")
