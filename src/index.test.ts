import { describe, it, expect, beforeEach, vi } from "vitest";
export {};

describe("demo", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(window.sessionStorage, "getItem");
    vi.spyOn(window.sessionStorage, "setItem");
  });

  it("mount", async () => {
    document.body.innerHTML = "<div id=root></div>";
    await import("./index");
    expect(document.body.innerHTML).toContain("App");
  });

  it("no mount", async () => {
    document.body.innerHTML = "";
    await import("./index");
    expect(document.body.innerHTML).toBe("");
  });
});
