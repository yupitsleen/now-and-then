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

  it("shows only a calendar button with the date on hover, opening the picker on click", () => {
    const showPicker = vi.fn();
    HTMLInputElement.prototype.showPicker = showPicker;
    render(<DateLabel date="2023-10-01" variant="after" onDateChange={vi.fn()} />);

    const button = screen.getByTitle("2023-10-01");
    expect(button).not.toHaveTextContent("2023-10-01");

    fireEvent.click(button);
    expect(showPicker).toHaveBeenCalled();
  });
});
