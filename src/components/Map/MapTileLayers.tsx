import { TileLayer, LayersControl } from "react-leaflet";
import { useTileConfig } from "../../hooks/useTileConfig";
import { useTheme } from "../../contexts/ThemeContext";
import { TILE_CONFIGS } from "../../constants/map";

/**
 * MapTileLayers - Configures map tile layers with street/dark toggle
 * - Street Map: OpenStreetMap (Arabic or English based on browser language)
 * - Dark Map: CartoDB Dark Matter (optimized for data visualization)
 * - Automatically selects appropriate map based on theme
 */
export function MapTileLayers() {
  const tileConfig = useTileConfig();
  const { isDark } = useTheme();

  return (
    <LayersControl position="topright">
      {/* Street Map (Default in light mode) */}
      <LayersControl.BaseLayer checked={!isDark} name="Street Map">
        <TileLayer
          attribution={tileConfig.attribution}
          url={tileConfig.url}
          subdomains={tileConfig.subdomains}
        />
      </LayersControl.BaseLayer>

      {/* Dark Map (Default in dark mode) - CartoDB Dark Matter */}
      <LayersControl.BaseLayer checked={isDark} name="Dark Map">
        <TileLayer
          attribution={TILE_CONFIGS.dark.attribution}
          url={TILE_CONFIGS.dark.url}
          subdomains={TILE_CONFIGS.dark.subdomains}
          maxZoom={19}
        />
      </LayersControl.BaseLayer>
    </LayersControl>
  );
}
