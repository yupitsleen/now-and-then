import { useEffect } from "react";
import { TileLayer, LayersControl, useMap } from "react-leaflet";
import { useTileConfig } from "../../hooks/useTileConfig";
import { useTheme } from "../../contexts/ThemeContext";
import { TILE_CONFIGS } from "../../constants/map";

// ponytail: CSS invert on OSM tiles → dark basemap without a paid tile provider
const DARK_FILTER = "invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9)";

function DarkTileFilter({ active }: { active: boolean }): null {
  const map = useMap();
  useEffect(() => {
    const pane = map.getPane("tilePane");
    if (pane) pane.style.filter = active ? DARK_FILTER : "";
  }, [map, active]);
  return null;
}

export function MapTileLayers(): React.JSX.Element {
  const tileConfig = useTileConfig();
  const { isDark } = useTheme();

  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer checked={!isDark} name="Street Map">
        <TileLayer
          attribution={tileConfig.attribution}
          url={tileConfig.url}
          subdomains={tileConfig.subdomains}
        />
      </LayersControl.BaseLayer>

      <LayersControl.BaseLayer checked={isDark} name="Dark Map">
        <TileLayer
          attribution={TILE_CONFIGS.dark.attribution}
          url={TILE_CONFIGS.dark.url}
          subdomains={TILE_CONFIGS.dark.subdomains}
          maxZoom={19}
        />
      </LayersControl.BaseLayer>
      <DarkTileFilter active={isDark} />
    </LayersControl>
  );
}
