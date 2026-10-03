import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import SentryBoundary from "./SentryBoundary";

const BrokenChild = (): never => {
  throw new Error("test");
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("SentryBoundary", () => {
  it("renders", () => {
    expect(
      render(<SentryBoundary>Test</SentryBoundary>).asFragment(),
    ).toMatchSnapshot();
  });

  it("catches errors and renders recovery controls", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { getByText, asFragment } = render(
      <SentryBoundary>
        <BrokenChild />
      </SentryBoundary>,
    );
    expect(getByText("Oops. The editor just crashed.")).toBeTruthy();
    expect(asFragment()).toMatchSnapshot();
  });

  it("reloads the page after an error", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { getByRole } = render(
      <SentryBoundary>
        <BrokenChild />
      </SentryBoundary>,
    );
    const reload = vi.fn();
    vi.stubGlobal(
      "window",
      new Proxy(window, {
        get(target, property) {
          return property === "location"
            ? { reload }
            : Reflect.get(target, property);
        },
      }),
    );
    fireEvent.click(getByRole("button", { name: "Reload the page" }));
    expect(reload).toHaveBeenCalledOnce();
  });
});
