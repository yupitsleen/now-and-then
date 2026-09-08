import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme } from "../../test-utils/renderWithTheme";
import { AppHeader } from "./AppHeader";
import { MemoryRouter } from "react-router-dom";

const AppHeaderWithRouter = () => (
  <MemoryRouter>
    <AppHeader />
  </MemoryRouter>
);

describe("AppHeader", () => {
  it("renders the logo inside the home button", () => {
    const { container } = renderWithTheme(<AppHeaderWithRouter />);
    // Logo is decorative (alt="") — the button carries the accessible name.
    const logo = container.querySelector("img");
    expect(screen.getByRole("button", { name: /go to home page/i })).toContainElement(logo);
  });

  it("displays the place and the framing as one title", () => {
    renderWithTheme(<AppHeaderWithRouter />);
    expect(screen.getByRole("heading", { name: /Gaza\s+Then & Now/i })).toBeInTheDocument();
  });

  it("renders nothing but the home button", () => {
    renderWithTheme(<AppHeaderWithRouter />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
