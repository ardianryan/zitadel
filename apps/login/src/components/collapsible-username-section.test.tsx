import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CollapsibleUsernameSection } from "./collapsible-username-section";

describe("CollapsibleUsernameSection", () => {
  afterEach(cleanup);

  it("should be collapsed by default when defaultOpen is false", () => {
    render(
      <CollapsibleUsernameSection defaultOpen={false} toggleText="Atau masuk dengan Email / NISN / NIP">
        <div data-testid="child-content">Child Form</div>
      </CollapsibleUsernameSection>,
    );

    expect(screen.getByText("Atau masuk dengan Email / NISN / NIP")).toBeInTheDocument();
    expect(screen.queryByTestId("child-content")).toBeNull();
  });

  it("should expand content when toggle button is clicked", () => {
    render(
      <CollapsibleUsernameSection defaultOpen={false} toggleText="Atau masuk dengan Email / NISN / NIP">
        <div data-testid="child-content">Child Form</div>
      </CollapsibleUsernameSection>,
    );

    const button = screen.getByTestId("toggle-username-form");
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("child-content")).toBeInTheDocument();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("child-content")).toBeNull();
  });

  it("should be open initially when defaultOpen is true", () => {
    render(
      <CollapsibleUsernameSection defaultOpen={true} toggleText="Atau masuk dengan Email / NISN / NIP">
        <div data-testid="child-content">Child Form</div>
      </CollapsibleUsernameSection>,
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    const button = screen.getByTestId("toggle-username-form");
    expect(button).toHaveAttribute("aria-expanded", "true");
  });
});
