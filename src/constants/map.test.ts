import { describe, it, expect } from "vitest";
import { TILE_CONFIGS } from "./map";

describe("TILE_CONFIGS", () => {
  // After CARTO killed unauthenticated tiles, all configs use OSM.
  it.each(["arabic", "english", "dark"] as const)("%s basemap uses OSM tiles", (key) => {
    expect(TILE_CONFIGS[key].url).toContain("tile.openstreetmap.org");
  });
});
