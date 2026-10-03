import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";

import Highlight from "./Highlight";

const renderElement = (element: React.ReactElement) =>
  render(element).container.firstChild;

describe("Highlight", () => {
  it("renders", () => {
    expect(renderElement(<Highlight value="" />)).toMatchSnapshot();
  });

  it("onCopy", () => {
    document.execCommand = vi.fn();
    const { getByRole } = render(<Highlight value="" />);

    fireEvent.click(getByRole("button", { name: "Copy" }));

    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });
});
