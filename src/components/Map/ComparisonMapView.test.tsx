import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ComparisonMapView } from "./ComparisonMapView";

// SiteDetailView mounts Leaflet; stub it to a marker div.
vi.mock("./SiteDetailView", () => ({
  SiteDetailView: () => <div data-testid="map" />,
}));

const imagery = { tileUrl: "u", maxZoom: 19, dateLabel: "2023-10-01" };

describe("ComparisonMapView", () => {
  it("stacks the two maps vertically when stacked", () => {
    const { container } = render(
      <ComparisonMapView
        sites={[]}
        highlightedSiteId={null}
        before={imagery}
        after={imagery}
        stacked
      />
    );
    const maps = container.querySelectorAll('[data-testid="map"]');
    expect(maps).toHaveLength(2);
    // The direct flex wrapper switches to column in stacked mode.
    expect(container.querySelector(".flex.flex-col")).not.toBeNull();
    expect(container.querySelector(".flex-row")).toBeNull();
  });

  it("keeps maps side-by-side by default", () => {
    const { container } = render(
      <ComparisonMapView
        sites={[]}
        highlightedSiteId={null}
        before={imagery}
        after={imagery}
      />
    );
    // Default wrapper is a row (no explicit flex-col).
    expect(container.querySelector(".flex.flex-col")).toBeNull();
  });
});
