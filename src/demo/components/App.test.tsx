import { describe, it, expect } from "vite-plus/test";
import { render } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders both editors", () => {
    const { container, getAllByRole } = render(<App />);
    expect(container.querySelector(".App")).not.toBeNull();
    expect(getAllByRole("textbox").length).toBeGreaterThanOrEqual(2);
  });
});
