import { describe, it, expect, beforeEach, vi } from "vitest";
import { ModalUtils } from "../../utils/modalUtils";

beforeEach(() => {
  document.body.innerHTML = "";
});

function createModal(id: string) {
  const modal = document.createElement("div");
  modal.id = id;
  modal.classList.add("hidden");
  document.body.appendChild(modal);
  return modal;
}

describe("ModalUtils.showModal", () => {
  it("removes hidden class and adds flex", () => {
    const modal = createModal("test-modal");
    ModalUtils.showModal("test-modal");
    expect(modal.classList.contains("hidden")).toBe(false);
    expect(modal.classList.contains("flex")).toBe(true);
  });

  it("calls onOpen callback", () => {
    createModal("test-modal");
    const onOpen = vi.fn();
    ModalUtils.showModal("test-modal", { onOpen });
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("clears specified fields", () => {
    createModal("test-modal");
    const input = document.createElement("input");
    input.id = "field1";
    input.value = "some value";
    document.body.appendChild(input);

    ModalUtils.showModal("test-modal", { clearFields: ["field1"] });
    expect(input.value).toBe("");
  });

  it("does nothing if modal not found", () => {
    expect(() => ModalUtils.showModal("nonexistent")).not.toThrow();
  });
});

describe("ModalUtils.hideModal", () => {
  it("adds hidden class and removes flex", () => {
    const modal = createModal("test-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    ModalUtils.hideModal("test-modal");
    expect(modal.classList.contains("hidden")).toBe(true);
    expect(modal.classList.contains("flex")).toBe(false);
  });

  it("calls onClose callback", () => {
    createModal("test-modal");
    const onClose = vi.fn();
    ModalUtils.hideModal("test-modal", { onClose });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does nothing if modal not found", () => {
    expect(() => ModalUtils.hideModal("nonexistent")).not.toThrow();
  });
});

describe("ModalUtils.clearFormFields", () => {
  it("clears input values", () => {
    const input = document.createElement("input");
    input.id = "inp1";
    input.value = "hello";
    document.body.appendChild(input);

    ModalUtils.clearFormFields(["inp1"]);
    expect(input.value).toBe("");
  });

  it("clears textarea values", () => {
    const ta = document.createElement("textarea");
    ta.id = "ta1";
    ta.value = "some text";
    document.body.appendChild(ta);

    ModalUtils.clearFormFields(["ta1"]);
    expect(ta.value).toBe("");
  });

  it("skips non-existent field IDs gracefully", () => {
    expect(() => ModalUtils.clearFormFields(["nonexistent"])).not.toThrow();
  });
});

describe("ModalUtils.setupModalEvents", () => {
  it("sets up close button click to hide modal", () => {
    const modal = createModal("my-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const btn = document.createElement("button");
    btn.id = "close-btn";
    document.body.appendChild(btn);

    ModalUtils.setupModalEvents({
      modalId: "my-modal",
      closeButtonIds: ["close-btn"],
    });

    btn.click();
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  it("closes modal on backdrop click", () => {
    const modal = createModal("my-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    ModalUtils.setupModalEvents({ modalId: "my-modal" });

    // Simulate click on the modal itself (backdrop)
    const event = new MouseEvent("click", { bubbles: true });
    Object.defineProperty(event, "target", { value: modal });
    modal.dispatchEvent(event);

    expect(modal.classList.contains("hidden")).toBe(true);
  });
});
