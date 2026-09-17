import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateLabel } from "./DateLabel";

describe("DateLabel", () => {
  it("renders static text when not editable", () => {
    render(<DateLabel date="2023-10-01" variant="before" />);

    expect(screen.getByTestId("date-label-before")).toHaveTextContent("2023-10-01");
  });

  it("reports the new date when edited", () => {
    const onDateChange = vi.fn();
    render(<DateLabel date="2023-10-01" variant="after" onDateChange={onDateChange} />);

    fireEvent.change(screen.getByTestId("date-label-after"), {
      target: { value: "2024-01-15" },
    });

    expect(onDateChange).toHaveBeenCalledWith("2024-01-15");
  });

  it("hides the date visually and surfaces it via the input's hover title", () => {
    render(<DateLabel date="2023-10-01" variant="after" onDateChange={vi.fn()} />);

    const input = screen.getByTestId("date-label-after");
    expect(input).toHaveAttribute("title", "2023-10-01");
    // The wrapper doesn't render the date as text — only on hover via the input's title
    expect(input.parentElement).not.toHaveTextContent("2023-10-01");
  });

  it("keeps the date input keyboard-accessible (focusable, typeable)", () => {
    render(<DateLabel date="2023-10-01" variant="after" onDateChange={vi.fn()} />);

    const input = screen.getByTestId("date-label-after") as HTMLInputElement;
    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("date");
    // No tabIndex=-1 — keyboard users can reach it
    expect(input.tabIndex).toBeGreaterThanOrEqual(0);
  });
});
