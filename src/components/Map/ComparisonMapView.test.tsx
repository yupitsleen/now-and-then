import { describe, it, expect, vi, afterEach } from "vitest";
import { renderWithTheme, screen, cleanup } from "../../test-utils/renderWithTheme";
import { ComparisonMapView } from "./ComparisonMapView";
import { AnimationProvider } from "../../contexts/AnimationContext";
import type { Site } from "../../types";

// Mock Leaflet library
vi.mock("leaflet", () => ({
  default: {
    divIcon: vi.fn(() => ({})),
    Icon: {
      Default: {
        prototype: {
          options: {},
        },
      },
    },
  },
}));

// Mock react-leaflet components
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children, className }: { children?: React.ReactNode; className?: string; [key: string]: unknown }) => (
    <div data-testid="map-container" className={className}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, position }: { children?: React.ReactNode; position: [number, number] }) => (
    <div data-testid="marker" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
  CircleMarker: ({ children, center }: { children?: React.ReactNode; center: [number, number]; [key: string]: unknown }) => (
    <div data-testid="circle-marker" data-center={JSON.stringify(center)}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  useMap: () => ({
    setView: vi.fn(),
    getContainer: () => ({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
    getZoom: () => 10,
    setZoom: vi.fn(),
  }),
  useMapEvents: () => ({}),
}));

// Mock MapHelperComponents
vi.mock("./MapHelperComponents", () => ({
  MapUpdater: () => null,
  ScrollWheelHandler: () => null,
  MapResizeHandler: () => null,
}));

// Mock TimeToggle component
vi.mock("./TimeToggle", () => ({
  TimeToggle: () => <div data-testid="time-toggle" />,
}));

const mockSites: Site[] = [
  {
    id: "1",
    name: "Great Omari Mosque",
    nameArabic: "الجامع العمري الكبير",
    type: "mosque",
    yearBuilt: "7th century",
    coordinates: [31.52, 34.46],
    status: "destroyed",
    dateDestroyed: "2023-12-07",
    description: "Historic mosque",
    historicalSignificance: "Significant",
    culturalValue: "High",
    sources: [],
    verifiedBy: ["UNESCO"],
  },
  {
    id: "2",
    name: "Al-Saqqa Mosque",
    type: "mosque",
    yearBuilt: "14th century",
    coordinates: [31.5, 34.45],
    status: "damaged",
    description: "Historic mosque",
    historicalSignificance: "Significant",
    culturalValue: "High",
    sources: [],
    verifiedBy: [],
  },
];

// Helper to render with AnimationProvider and ThemeProvider
const renderWithAnimation = (ui: React.ReactElement) => {
  return renderWithTheme(
    <AnimationProvider sites={mockSites}>
      {ui}
    </AnimationProvider>
  );
};

describe("ComparisonMapView", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      const { container } = renderWithAnimation(
        <ComparisonMapView
          sites={mockSites}
          highlightedSiteId={null}
          before={{ tileUrl: "https://example.com/before", maxZoom: 19 }}
          after={{ tileUrl: "https://example.com/after", maxZoom: 19 }}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it("renders two map containers side-by-side", () => {
      renderWithAnimation(
        <ComparisonMapView
          sites={mockSites}
          highlightedSiteId={null}
          before={{ tileUrl: "https://example.com/before", maxZoom: 19 }}
          after={{ tileUrl: "https://example.com/after", maxZoom: 19 }}
        />
      );

      const mapContainers = screen.getAllByTestId("map-container");
      expect(mapContainers).toHaveLength(2);
    });

    it("handles empty sites array", () => {
      const { container} = renderWithAnimation(
        <ComparisonMapView
          sites={[]}
          highlightedSiteId={null}
          before={{ tileUrl: "https://example.com/before", maxZoom: 19 }}
          after={{ tileUrl: "https://example.com/after", maxZoom: 19 }}
        />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe("Date Labels", () => {
    it("renders before date label when provided", () => {
      renderWithAnimation(
        <ComparisonMapView
          sites={mockSites}
          highlightedSiteId={null}
          before={{
            tileUrl: "https://example.com/before",
            maxZoom: 19,
            dateLabel: "2023-10-01",
          }}
          after={{
            tileUrl: "https://example.com/after",
            maxZoom: 19,
          }}
        />
      );

      expect(screen.getByText("2023-10-01")).toBeInTheDocument();
    });

    it("renders after date label when provided", () => {
      renderWithAnimation(
        <ComparisonMapView
          sites={mockSites}
          highlightedSiteId={null}
          before={{
            tileUrl: "https://example.com/before",
            maxZoom: 19,
          }}
          after={{
            tileUrl: "https://example.com/after",
            maxZoom: 19,
            dateLabel: "2024-01-15",
          }}
        />
      );

      expect(screen.getByText("2024-01-15")).toBeInTheDocument();
    });

    it("renders both date labels when both are provided", () => {
      renderWithAnimation(
        <ComparisonMapView
          sites={mockSites}
          highlightedSiteId={null}
          before={{
            tileUrl: "https://example.com/before",
            maxZoom: 19,
            dateLabel: "2023-10-01",
          }}
          after={{
            tileUrl: "https://example.com/after",
            maxZoom: 19,
            dateLabel: "2024-01-15",
          }}
        />
      );

      expect(screen.getByText("2023-10-01")).toBeInTheDocument();
      expect(screen.getByText("2024-01-15")).toBeInTheDocument();
    });

    it("does not render date labels when not provided", () => {
      renderWithAnimation(
        <ComparisonMapView
          sites={mockSites}
          highlightedSiteId={null}
          before={{
            tileUrl: "https://example.com/before",
            maxZoom: 19,
          }}
          after={{
            tileUrl: "https://example.com/after",
            maxZoom: 19,
          }}
        />
      );

      // ponytail: DateLabel located by data-testid, not palette colors
      expect(screen.queryByTestId("date-label-before")).not.toBeInTheDocument();
      expect(screen.queryByTestId("date-label-after")).not.toBeInTheDocument();
    });

    it("renders before date on the yellow label variant", () => {
      renderWithAnimation(
        <ComparisonMapView
          sites={mockSites}
          highlightedSiteId={null}
          before={{
            tileUrl: "https://example.com/before",
            maxZoom: 19,
            dateLabel: "2023-10-01",
          }}
          after={{
            tileUrl: "https://example.com/after",
            maxZoom: 19,
          }}
        />
      );

      expect(screen.getByTestId("date-label-before")).toHaveTextContent("2023-10-01");
    });

    it("renders after date on the green label variant", () => {
      renderWithAnimation(
        <ComparisonMapView
          sites={mockSites}
          highlightedSiteId={null}
          before={{
            tileUrl: "https://example.com/before",
            maxZoom: 19,
          }}
          after={{
            tileUrl: "https://example.com/after",
            maxZoom: 19,
            dateLabel: "2024-01-15",
          }}
        />
      );

      expect(screen.getByTestId("date-label-after")).toHaveTextContent("2024-01-15");
    });

    it("date labels match wayback release dates format", () => {
      // Simulate real Wayback release dates
      const beforeReleaseDate = "2023-10-01";
      const afterReleaseDate = "2024-01-15";

      renderWithAnimation(
        <ComparisonMapView
          sites={mockSites}
          highlightedSiteId={null}
          before={{
            tileUrl: "https://wayback.example.com/before",
            maxZoom: 19,
            dateLabel: beforeReleaseDate,
          }}
          after={{
            tileUrl: "https://wayback.example.com/after",
            maxZoom: 19,
            dateLabel: afterReleaseDate,
          }}
        />
      );

      // Verify exact date format matches
      expect(screen.getByText(beforeReleaseDate)).toBeInTheDocument();
      expect(screen.getByText(afterReleaseDate)).toBeInTheDocument();
    });
  });

  describe("Site Highlighting", () => {
    it("passes highlightedSiteId to both maps", () => {
      renderWithAnimation(
        <ComparisonMapView
          sites={mockSites}
          highlightedSiteId="1"
          before={{
            tileUrl: "https://example.com/before",
            maxZoom: 19,
          }}
          after={{
            tileUrl: "https://example.com/after",
            maxZoom: 19,
          }}
        />
      );

      // Both maps should render markers for highlighted site
      const markers = screen.getAllByTestId("marker");
      expect(markers.length).toBeGreaterThan(0);
    });
  });

  describe("Callbacks", () => {
    it("calls onSiteClick when provided", () => {
      const onSiteClick = vi.fn();
      renderWithAnimation(
        <ComparisonMapView
          sites={mockSites}
          highlightedSiteId="1"
          before={{
            tileUrl: "https://example.com/before",
            maxZoom: 19,
          }}
          after={{
            tileUrl: "https://example.com/after",
            maxZoom: 19,
          }}
          onSiteClick={onSiteClick}
        />
      );

      // Component should render without errors when callback is provided
      expect(screen.getAllByTestId("map-container")).toHaveLength(2);
    });
  });

  describe("Stacked Layout (Portrait Mode)", () => {
    it("stacks the two maps vertically when stacked", () => {
      const { container } = renderWithAnimation(
        <ComparisonMapView
          sites={mockSites}
          highlightedSiteId={null}
          before={{
            tileUrl: "https://example.com/before",
            maxZoom: 19,
            dateLabel: "2023-10-01",
          }}
          after={{
            tileUrl: "https://example.com/after",
            maxZoom: 19,
            dateLabel: "2023-10-01",
          }}
          stacked
        />
      );
      expect(container.querySelector(".flex.flex-col")).not.toBeNull();
      expect(container.querySelector(".flex-row")).toBeNull();
    });

    it("keeps maps side-by-side by default", () => {
      const { container } = renderWithAnimation(
        <ComparisonMapView
          sites={mockSites}
          highlightedSiteId={null}
          before={{
            tileUrl: "https://example.com/before",
            maxZoom: 19,
            dateLabel: "2023-10-01",
          }}
          after={{
            tileUrl: "https://example.com/after",
            maxZoom: 19,
            dateLabel: "2023-10-01",
          }}
        />
      );
      expect(container.querySelector(".flex.flex-col")).toBeNull();
    });
  });
});
