import { describe, it, expect, beforeEach } from "vitest";
import { DOMUtils } from "../../utils/domUtils";

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("DOMUtils.getElementById", () => {
  it("returns element when found", () => {
    const el = document.createElement("div");
    el.id = "test";
    document.body.appendChild(el);
    expect(DOMUtils.getElementById("test")).toBe(el);
  });

  it("returns null when not found", () => {
    expect(DOMUtils.getElementById("missing")).toBeNull();
  });
});

describe("DOMUtils.setTextContent", () => {
  it("sets text content on element", () => {
    const el = document.createElement("div");
    el.id = "txt";
    document.body.appendChild(el);
    DOMUtils.setTextContent("txt", "Hello");
    expect(el.textContent).toBe("Hello");
  });

  it("does nothing if element not found", () => {
    expect(() => DOMUtils.setTextContent("missing", "text")).not.toThrow();
  });
});

describe("DOMUtils.setInputValue / getInputValue", () => {
  it("sets and gets input value", () => {
    const input = document.createElement("input");
    input.id = "inp";
    document.body.appendChild(input);

    DOMUtils.setInputValue("inp", "test value");
    expect(DOMUtils.getInputValue("inp")).toBe("test value");
  });

  it("trims whitespace on getInputValue", () => {
    const input = document.createElement("input");
    input.id = "inp";
    input.value = "  trimmed  ";
    document.body.appendChild(input);
    expect(DOMUtils.getInputValue("inp")).toBe("trimmed");
  });

  it("returns empty string when input not found", () => {
    expect(DOMUtils.getInputValue("missing")).toBe("");
  });
});

describe("DOMUtils.toggleElementVisibility", () => {
  it("shows element by removing hidden class", () => {
    const el = document.createElement("div");
    el.id = "el";
    el.classList.add("hidden");
    document.body.appendChild(el);

    DOMUtils.toggleElementVisibility("el", true);
    expect(el.classList.contains("hidden")).toBe(false);
  });

  it("hides element by adding hidden class", () => {
    const el = document.createElement("div");
    el.id = "el";
    document.body.appendChild(el);

    DOMUtils.toggleElementVisibility("el", false);
    expect(el.classList.contains("hidden")).toBe(true);
  });

  it("does nothing if element not found", () => {
    expect(() =>
      DOMUtils.toggleElementVisibility("missing", true),
    ).not.toThrow();
  });
});

describe("DOMUtils.updateTextWithFallback", () => {
  it("sets content when value is provided", () => {
    const el = document.createElement("div");
    el.id = "el";
    document.body.appendChild(el);
    DOMUtils.updateTextWithFallback("el", 42);
    expect(el.textContent).toBe("42");
  });

  it("uses fallback when value is undefined", () => {
    const el = document.createElement("div");
    el.id = "el";
    document.body.appendChild(el);
    DOMUtils.updateTextWithFallback("el", undefined, "N/A");
    expect(el.textContent).toBe("N/A");
  });

  it("uses default fallback '0' when not specified", () => {
    const el = document.createElement("div");
    el.id = "el";
    document.body.appendChild(el);
    DOMUtils.updateTextWithFallback("el");
    expect(el.textContent).toBe("0");
  });
});

describe("DOMUtils.clearInputs", () => {
  it("clears multiple inputs", () => {
    for (const id of ["a", "b", "c"]) {
      const input = document.createElement("input");
      input.id = id;
      input.value = "value";
      document.body.appendChild(input);
    }
    DOMUtils.clearInputs(["a", "b", "c"]);
    for (const id of ["a", "b", "c"]) {
      expect(DOMUtils.getInputValue(id)).toBe("");
    }
  });
});

describe("DOMUtils.setImageSrc", () => {
  it("sets src and shows image", () => {
    const img = document.createElement("img");
    img.id = "img";
    img.style.display = "none";
    document.body.appendChild(img);

    DOMUtils.setImageSrc("img", "https://example.com/img.png");
    expect(img.src).toContain("example.com/img.png");
    expect(img.style.display).toBe("block");
  });
});
