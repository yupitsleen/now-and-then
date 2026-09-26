import { describe, it, expect } from "vitest";
import { TILE_CONFIGS } from "./map";

describe("TILE_CONFIGS", () => {
  // Regression: dark_all lacked {r}, so MiniMap drew half-resolution tiles on HiDPI screens.
  it.each(["english", "dark"] as const)("%s CartoDB basemap requests retina tiles", (key) => {
    expect(TILE_CONFIGS[key].url).toContain("{r}");
  });

  // ponytail: no {r} case for `arabic` — OSM doesn't serve @2x tiles.
  it("arabic basemap stays on plain OSM tiles", () => {
    expect(TILE_CONFIGS.arabic.url).toContain("tile.openstreetmap.org");
  });
});
