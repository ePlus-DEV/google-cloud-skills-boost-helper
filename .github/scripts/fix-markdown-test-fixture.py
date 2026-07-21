from pathlib import Path

path = Path("tests/services/markdownService.test.ts")
text = path.read_text()
old = '''    const markdown = `
      <a class="unsafe-link" href="java&#10;script:alert(1)">Unsafe</a>
      <map><area class="unsafe-area" href="javascript:alert(1)"></map>
      <img class="safe-image" src="https://example.com/image.png" onerror="alert(1)">
      <a class="safe-link" href="https://example.com/docs">Safe</a>
    `;
'''
new = '''    const markdown = [
      '<a class="unsafe-link" href="java&#10;script:alert(1)">Unsafe</a>',
      '<map><area class="unsafe-area" href="javascript:alert(1)"></map>',
      '<img class="safe-image" src="https://example.com/image.png" onerror="alert(1)">',
      '<a class="safe-link" href="https://example.com/docs">Safe</a>',
    ].join("\\n");
'''
if old in text:
    path.write_text(text.replace(old, new, 1))
elif new not in text:
    raise RuntimeError("Markdown sanitizer fixture was not found")
