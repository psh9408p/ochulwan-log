import React from "react";
import { describe, expect, it } from "vitest";

describe("RootLayout", () => {
  it("suppresses hydration warnings caused by browser extension body attributes", async () => {
    globalThis.React = React;
    const { default: RootLayout } = await import("./layout");
    const layout = RootLayout({ children: "content" });
    const body = layout.props.children;

    expect(body.props.suppressHydrationWarning).toBe(true);
  });
});
