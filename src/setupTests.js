import { afterEach } from "vite-plus/test";
import { cleanup } from "@testing-library/react";

afterEach(cleanup);

const consoleWarn = console.warn;
console.warn = function filterWarnings(msg, ...args) {
  const suppressedWarnings = [
    "Warning: componentWillMount",
    "Warning: componentWillReceiveProps",
    "Warning: componentWillUpdate",
  ];
  if (!suppressedWarnings.some((entry) => String(msg).includes(entry))) {
    consoleWarn.apply(console, [msg, ...args]);
  }
};
