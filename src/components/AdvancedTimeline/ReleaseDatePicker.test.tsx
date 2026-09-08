import { describe, it, expect, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithTheme, screen } from "../../test-utils/renderWithTheme";
import { ReleaseDatePicker } from "./ReleaseDatePicker";
import type { WaybackRelease } from "../../services/waybackService";

const releases: WaybackRelease[] = [
  { releaseNum: 1, releaseDate: "2019-06-05", label: "2019-06-05", tileUrl: "a", maxZoom: 19 },
  { releaseNum: 2, releaseDate: "2019-06-20", label: "2019-06-20", tileUrl: "b", maxZoom: 19 },
  { releaseNum: 3, releaseDate: "2024-01-17", label: "2024-01-17", tileUrl: "c", maxZoom: 19 },
];

function setup(disabled = false) {
  const onBeforeChange = vi.fn();
  const onAfterChange = vi.fn();
  renderWithTheme(
    <ReleaseDatePicker
      releases={releases}
      beforeIndex={0}
      onBeforeChange={onBeforeChange}
      afterIndex={2}
      onAfterChange={onAfterChange}
      disabled={disabled}
    />
  );
  return { onBeforeChange, onAfterChange };
}

describe("ReleaseDatePicker", () => {
  it("shows the release date of each slider position", () => {
    setup();

    expect(screen.getByLabelText(/before imagery/i)).toHaveValue("2019-06-05");
    expect(screen.getByLabelText(/after imagery/i)).toHaveValue("2024-01-17");
  });

  it("disables both fields when the map version is synced", () => {
    setup(true);

    expect(screen.getByLabelText(/before imagery/i)).toBeDisabled();
    expect(screen.getByLabelText(/after imagery/i)).toBeDisabled();
  });

  it("snaps an entered date to the nearest release", () => {
    const { onBeforeChange } = setup();

    fireEvent.change(screen.getByLabelText(/before imagery/i), {
      target: { value: "2019-06-18" },
    });

    expect(onBeforeChange).toHaveBeenCalledWith(1);
  });
});
