import { memo, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import type { Site } from "../../types";
import { GAZA_CENTER } from "../../constants/map";
import { useTileConfig } from "../../hooks/useTileConfig";
import { useTheme } from "../../contexts/ThemeContext";
import "leaflet/dist/leaflet.css";

// ponytail: zoom 8.5 fits all of Gaza + Rafah in the tiny container
const MINI_MAP_ZOOM = 8.5;

interface MiniMapProps {
  /** The resolved highlighted site, or null. Passed in already-looked-up so
   *  MiniMap doesn't take a whole array reference that changes every filter tick
   *  (which would defeat the memo below). */
  highlightedSite: Site | null;
}

/** Tells Leaflet to recalculate when the container resizes (e.g. stacked timelines). */
function InvalidateOnResize(): null {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    return () => ro.disconnect();
  }, [map]);

  return null;
}

/**
 * Small, non-interactive overview map showing Gaza with a single marker
 * for the currently highlighted site.
 */
export const MiniMap = memo(function MiniMap({ highlightedSite }: MiniMapProps) {
  const { isDark } = useTheme();
  const tileConfig = useTileConfig({ theme: isDark ? "dark" : "light" });

  return (
    <MapContainer
      center={GAZA_CENTER}
      zoom={MINI_MAP_ZOOM}
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
      attributionControl={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      boxZoom={false}
      className="h-full w-full"
      style={{ background: isDark ? "#1a1a2e" : "#f0f0f0" }}
    >
      <TileLayer url={tileConfig.url} subdomains={tileConfig.subdomains} />
      <InvalidateOnResize />
      {highlightedSite && (
        <CircleMarker
          center={highlightedSite.coordinates}
          radius={4}
          pathOptions={{
            color: "#fff",
            weight: 1,
            fillColor: "#ff1a1a",
            fillOpacity: 1,
          }}
        />
      )}
    </MapContainer>
  );
});
