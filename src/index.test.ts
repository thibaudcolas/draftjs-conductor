export {};

describe("demo", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(window.sessionStorage, "getItem");
    jest.spyOn(window.sessionStorage, "setItem");
  });

  it("mount", () => {
    document.body.innerHTML = "<div id=root></div>";
    require("./index");
    expect(document.body.innerHTML).toContain("App");
  });

  it("no mount", () => {
    document.body.innerHTML = "";
    require("./index");
    expect(document.body.innerHTML).toBe("");
  });
});
