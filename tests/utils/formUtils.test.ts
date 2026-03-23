import { describe, it, expect, beforeEach } from "vitest";
import { FormUtils } from "../../utils/formUtils";

// Setup DOM helpers
function createInput(id: string, value: string) {
  const input = document.createElement("input");
  input.id = id;
  input.value = value;
  document.body.appendChild(input);
  return input;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("FormUtils.validateForm", () => {
  it("returns valid when no rules", () => {
    const result = FormUtils.validateForm([]);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns error for required field with empty value", () => {
    createInput("name", "");
    const result = FormUtils.validateForm([{ id: "name", required: true }]);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].id).toBe("name");
  });

  it("passes required field with value", () => {
    createInput("name", "John");
    const result = FormUtils.validateForm([{ id: "name", required: true }]);
    expect(result.isValid).toBe(true);
  });

  it("returns error for minLength violation", () => {
    createInput("bio", "hi");
    const result = FormUtils.validateForm([{ id: "bio", minLength: 5 }]);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].message).toContain("5");
  });

  it("passes minLength when value is long enough", () => {
    createInput("bio", "hello world");
    const result = FormUtils.validateForm([{ id: "bio", minLength: 5 }]);
    expect(result.isValid).toBe(true);
  });

  it("returns error for pattern mismatch", () => {
    createInput("code", "abc");
    const result = FormUtils.validateForm([
      { id: "code", pattern: /^\d+$/, message: "Must be digits" },
    ]);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].message).toBe("Must be digits");
  });

  it("passes pattern when value matches", () => {
    createInput("code", "12345");
    const result = FormUtils.validateForm([{ id: "code", pattern: /^\d+$/ }]);
    expect(result.isValid).toBe(true);
  });

  it("uses custom message when provided", () => {
    createInput("field", "");
    const result = FormUtils.validateForm([
      { id: "field", required: true, message: "Custom error" },
    ]);
    expect(result.errors[0].message).toBe("Custom error");
  });

  it("skips pattern check for empty non-required field", () => {
    createInput("field", "");
    const result = FormUtils.validateForm([{ id: "field", pattern: /^\d+$/ }]);
    expect(result.isValid).toBe(true);
  });
});

describe("FormUtils.isValidUrl", () => {
  it("returns true for valid https URL", () => {
    expect(FormUtils.isValidUrl("https://example.com")).toBe(true);
  });

  it("returns true for valid http URL", () => {
    expect(FormUtils.isValidUrl("http://example.com/path?q=1")).toBe(true);
  });

  it("returns false for invalid URL", () => {
    expect(FormUtils.isValidUrl("not-a-url")).toBe(false);
    expect(FormUtils.isValidUrl("")).toBe(false);
  });
});

describe("FormUtils.isValidProfileUrl", () => {
  it("returns true for valid profile URL", () => {
    expect(
      FormUtils.isValidProfileUrl(
        "https://www.skills.google/public_profiles/abc123",
      ),
    ).toBe(true);
  });

  it("returns false for non-profile URL", () => {
    expect(
      FormUtils.isValidProfileUrl("https://www.skills.google/catalog"),
    ).toBe(false);
  });

  it("returns false for invalid URL", () => {
    expect(FormUtils.isValidProfileUrl("not-a-url")).toBe(false);
  });
});

describe("FormUtils.clearFormErrors", () => {
  it("removes border-red-500 class from elements", () => {
    const el = document.createElement("input");
    el.classList.add("border-red-500");
    document.body.appendChild(el);

    FormUtils.clearFormErrors();
    expect(el.classList.contains("border-red-500")).toBe(false);
  });

  it("removes error message elements", () => {
    const err = document.createElement("div");
    err.id = "field-error";
    document.body.appendChild(err);

    FormUtils.clearFormErrors();
    expect(document.getElementById("field-error")).toBeNull();
  });
});
