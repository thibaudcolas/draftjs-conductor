import { describe, it, expect, vi } from "vite-plus/test";
import { render, fireEvent } from "@testing-library/react";

import Highlight from "./Highlight";

const renderElement = (element: React.ReactElement) =>
  render(element).container.firstChild;

describe("Highlight", () => {
  it("renders", () => {
    expect(renderElement(<Highlight value="" />)).toMatchSnapshot();
  });

  it("onCopy", () => {
    const execCommand = vi.fn();
    document.execCommand = execCommand;
    const { getByRole } = render(<Highlight value="" />);

    fireEvent.click(getByRole("button", { name: "Copy" }));

    expect(execCommand).toHaveBeenCalledWith("copy");
  });
});
