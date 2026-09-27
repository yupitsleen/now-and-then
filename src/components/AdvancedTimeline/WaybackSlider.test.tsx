import { describe, it, expect, vi } from "vitest";
import { renderWithTheme, screen, fireEvent } from "../../test-utils/renderWithTheme";
import { WaybackSlider } from "./WaybackSlider";
import type { WaybackRelease } from "../../services/waybackService";

// Mock releases for testing
const mockReleases: WaybackRelease[] = [
  {
    releaseNum: 1,
    releaseDate: "2014-02-20",
    label: "2014-02-20",
    tileUrl: "https://example.com/tile/1/{z}/{y}/{x}",
    maxZoom: 19,
  },
  {
    releaseNum: 2,
    releaseDate: "2014-06-15",
    label: "2014-06-15",
    tileUrl: "https://example.com/tile/2/{z}/{y}/{x}",
    maxZoom: 19,
  },
  {
    releaseNum: 3,
    releaseDate: "2015-01-10",
    label: "2015-01-10",
    tileUrl: "https://example.com/tile/3/{z}/{y}/{x}",
    maxZoom: 19,
  },
  {
    releaseNum: 4,
    releaseDate: "2015-08-20",
    label: "2015-08-20",
    tileUrl: "https://example.com/tile/4/{z}/{y}/{x}",
    maxZoom: 19,
  },
  {
    releaseNum: 5,
    releaseDate: "2016-03-05",
    label: "2016-03-05",
    tileUrl: "https://example.com/tile/5/{z}/{y}/{x}",
    maxZoom: 19,
  },
];

describe("WaybackSlider", () => {
  describe("Rendering", () => {
    it("renders without crashing with releases", () => {
      const onIndexChange = vi.fn();
      renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={0} onIndexChange={onIndexChange} />
      );

      // Should render Previous and Next buttons
      expect(screen.getByLabelText("Go to previous satellite image release")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to next satellite image release")).toBeInTheDocument();
    });

    it("renders empty state when no releases provided", () => {
      const onIndexChange = vi.fn();
      renderWithTheme(<WaybackSlider releases={[]} currentIndex={0} onIndexChange={onIndexChange} />);

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText(/No imagery releases available/i)).toBeInTheDocument();
    });

    it("renders navigation buttons correctly", () => {
      const onIndexChange = vi.fn();
      renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={2} onIndexChange={onIndexChange} />
      );

      // Should have Previous and Next buttons
      expect(screen.getByLabelText("Go to previous satellite image release")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to next satellite image release")).toBeInTheDocument();
    });

    it("renders year labels for timeline", () => {
      const onIndexChange = vi.fn();
      renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={0} onIndexChange={onIndexChange} />
      );

      // Should show years from 2014 to 2016
      expect(screen.getByText("2014")).toBeInTheDocument();
      expect(screen.getByText("2015")).toBeInTheDocument();
      expect(screen.getByText("2016")).toBeInTheDocument();
    });

    it("spaces year labels evenly and keeps the ticks on their true dates", () => {
      renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={0} onIndexChange={vi.fn()} />
      );

      // 3 years → bands of 33.3%, labels centered at 16.7 / 50 / 83.3
      const left = (year: string) =>
        parseFloat(screen.getByText(year).parentElement!.style.left);
      expect(left("2015") - left("2014")).toBeCloseTo(left("2016") - left("2015"), 5);
      expect(left("2015")).toBeCloseTo(50, 5);

      // First release is Feb 20 2014, so its tick sits inside the track, not at 0%
      const firstTickPercent = parseFloat(
        (document.querySelectorAll(".group")[0] as HTMLElement).style.left
      );
      expect(firstTickPercent).toBeGreaterThan(0);
      expect(firstTickPercent).toBeLessThan(100 / 3); // still inside the 2014 band
    });
  });

  describe("Previous/Next Buttons", () => {
    it("renders Previous and Next buttons", () => {
      const onIndexChange = vi.fn();
      renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={2} onIndexChange={onIndexChange} />
      );

      expect(screen.getByRole("button", { name: /Previous/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
    });

    it("calls onIndexChange when Next button clicked", () => {
      const onIndexChange = vi.fn();
      renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={2} onIndexChange={onIndexChange} />
      );

      const nextButton = screen.getByRole("button", { name: /Next/i });
      fireEvent.click(nextButton);

      expect(onIndexChange).toHaveBeenCalledWith(3);
    });

    it("calls onIndexChange when Previous button clicked", () => {
      const onIndexChange = vi.fn();
      renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={2} onIndexChange={onIndexChange} />
      );

      const prevButton = screen.getByRole("button", { name: /Previous/i });
      fireEvent.click(prevButton);

      expect(onIndexChange).toHaveBeenCalledWith(1);
    });

    it("disables Previous button at first release", () => {
      const onIndexChange = vi.fn();
      renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={0} onIndexChange={onIndexChange} />
      );

      const prevButton = screen.getByRole("button", { name: /Previous/i });
      expect(prevButton).toBeDisabled();
    });

    it("disables Next button at last release", () => {
      const onIndexChange = vi.fn();
      renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={4} onIndexChange={onIndexChange} />
      );

      const nextButton = screen.getByRole("button", { name: /Next/i });
      expect(nextButton).toBeDisabled();
    });

    it("does not call onIndexChange when disabled Previous is clicked", () => {
      const onIndexChange = vi.fn();
      renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={0} onIndexChange={onIndexChange} />
      );

      const prevButton = screen.getByRole("button", { name: /Previous/i });
      fireEvent.click(prevButton);

      expect(onIndexChange).not.toHaveBeenCalled();
    });

    it("does not call onIndexChange when disabled Next is clicked", () => {
      const onIndexChange = vi.fn();
      renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={4} onIndexChange={onIndexChange} />
      );

      const nextButton = screen.getByRole("button", { name: /Next/i });
      fireEvent.click(nextButton);

      expect(onIndexChange).not.toHaveBeenCalled();
    });
  });

  describe("Clickable Timeline", () => {
    it("handles timeline click to change release", () => {
      const onIndexChange = vi.fn();
      const { container } = renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={0} onIndexChange={onIndexChange} />
      );

      // Find the clickable timeline bar (has cursor-pointer class)
      const timeline = container.querySelector(".cursor-pointer");
      expect(timeline).toBeTruthy();

      if (timeline) {
        // Mock getBoundingClientRect for click position calculation
        vi.spyOn(timeline, "getBoundingClientRect").mockReturnValue({
          left: 0,
          width: 100,
          top: 0,
          right: 100,
          bottom: 10,
          height: 10,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        });

        // Click at 50% position (middle of timeline)
        fireEvent.click(timeline, { clientX: 50 });

        // Should call onIndexChange with some index
        expect(onIndexChange).toHaveBeenCalled();
      }
    });

    it("finds nearest release when timeline is clicked", () => {
      const onIndexChange = vi.fn();
      const { container } = renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={0} onIndexChange={onIndexChange} />
      );

      const timeline = container.querySelector(".cursor-pointer");
      if (timeline) {
        vi.spyOn(timeline, "getBoundingClientRect").mockReturnValue({
          left: 0,
          width: 100,
          top: 0,
          right: 100,
          bottom: 10,
          height: 10,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        });

        // Click at start (should select first release)
        fireEvent.click(timeline, { clientX: 0 });
        expect(onIndexChange).toHaveBeenCalledWith(0);

        // Click at end (should select last release)
        fireEvent.click(timeline, { clientX: 100 });
        expect(onIndexChange).toHaveBeenCalledWith(4);
      }
    });
  });

  describe("Tooltips", () => {
    it("renders tooltips with release dates", () => {
      const onIndexChange = vi.fn();
      const { container } = renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={0} onIndexChange={onIndexChange} />
      );

      // Tooltips should contain release dates
      // They are `hidden` initially and group-hover:block
      const tooltips = container.querySelectorAll(".group-hover\\:block");
      expect(tooltips.length).toBeGreaterThan(0);
    });

    it("tooltip elements are present for each release", () => {
      const onIndexChange = vi.fn();
      const { container } = renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={0} onIndexChange={onIndexChange} />
      );

      // One hover group per release. The scrubber's date bubble is always
      // visible (not hover-triggered), so it isn't part of this group.
      const hoverGroups = container.querySelectorAll(".group");
      expect(hoverGroups.length).toBe(mockReleases.length);
    });
  });

  // ponytail: visual elements located by data-testid, not color classes — palette changes shouldn't break tests
  describe("Visual Indicators", () => {
    it("renders scrubber indicator at current position", () => {
      const onIndexChange = vi.fn();
      renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={2} onIndexChange={onIndexChange} />
      );

      expect(screen.getByTestId("wayback-current-scrubber")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles single release", () => {
      const onIndexChange = vi.fn();
      const singleRelease = [mockReleases[0]];

      renderWithTheme(
        <WaybackSlider releases={singleRelease} currentIndex={0} onIndexChange={onIndexChange} />
      );

      // Both buttons should be disabled (only one release)
      const prevButton = screen.getByRole("button", { name: /Previous/i });
      const nextButton = screen.getByRole("button", { name: /Next/i });
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it("handles currentIndex beyond releases length gracefully", () => {
      const onIndexChange = vi.fn();

      // Should not crash even with invalid index
      expect(() => {
        renderWithTheme(
          <WaybackSlider releases={mockReleases} currentIndex={100} onIndexChange={onIndexChange} />
        );
      }).not.toThrow();
    });

    it("updates display when currentIndex changes", () => {
      const onIndexChange = vi.fn();
      const { rerender } = renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={0} onIndexChange={onIndexChange} />
      );

      // Initial date check
      let dateElements = screen.getAllByText("2014-02-20");
      expect(dateElements.length).toBeGreaterThan(0);

      // Update to different index
      rerender(
        <WaybackSlider releases={mockReleases} currentIndex={2} onIndexChange={onIndexChange} />
      );

      // New date check
      dateElements = screen.getAllByText("2015-01-10");
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  describe("Dark Mode Support", () => {
    it("renders in dark mode without errors", () => {
      // Set dark mode
      localStorage.setItem("heritage-tracker-theme", "dark");

      const onIndexChange = vi.fn();
      renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={0} onIndexChange={onIndexChange} />
      );

      // Date appears in multiple places (main display + tooltips), so use getAllByText
      const dateElements = screen.getAllByText("2014-02-20");
      expect(dateElements.length).toBeGreaterThan(0);

      localStorage.removeItem("heritage-tracker-theme");
    });

    it("renders in light mode without errors", () => {
      // Set light mode
      localStorage.setItem("heritage-tracker-theme", "light");

      const onIndexChange = vi.fn();
      renderWithTheme(
        <WaybackSlider releases={mockReleases} currentIndex={0} onIndexChange={onIndexChange} />
      );

      // Date appears in multiple places (main display + tooltips), so use getAllByText
      const dateElements = screen.getAllByText("2014-02-20");
      expect(dateElements.length).toBeGreaterThan(0);

      localStorage.removeItem("heritage-tracker-theme");
    });
  });

  describe("Comparison Mode", () => {
    describe("Dual Scrubber Rendering", () => {
      it("renders two scrubbers when comparison mode is enabled", () => {
        const onIndexChange = vi.fn();
        const onBeforeIndexChange = vi.fn();
        renderWithTheme(
          <WaybackSlider
            releases={mockReleases}
            currentIndex={4}
            onIndexChange={onIndexChange}
            comparisonMode={true}
            beforeIndex={1}
            onBeforeIndexChange={onBeforeIndexChange}
          />
        );

        expect(screen.getByTestId("wayback-current-scrubber")).toBeInTheDocument();
        expect(screen.getByTestId("wayback-before-scrubber")).toBeInTheDocument();
      });

      it("gives each scrubber an always-visible date bubble", () => {
        renderWithTheme(
          <WaybackSlider
            releases={mockReleases}
            currentIndex={4}
            onIndexChange={vi.fn()}
            comparisonMode={true}
            beforeIndex={1}
            onBeforeIndexChange={vi.fn()}
          />
        );

        expect(
          screen.getByTestId("wayback-before-scrubber").parentElement
        ).toHaveTextContent("2014-06-15");
        expect(
          screen.getByTestId("wayback-current-scrubber").parentElement
        ).toHaveTextContent("2016-03-05");
      });

      it("renders only one scrubber when comparison mode is disabled", () => {
        const onIndexChange = vi.fn();
        renderWithTheme(
          <WaybackSlider
            releases={mockReleases}
            currentIndex={2}
            onIndexChange={onIndexChange}
            comparisonMode={false}
          />
        );

        expect(screen.getByTestId("wayback-current-scrubber")).toBeInTheDocument();
        expect(screen.queryByTestId("wayback-before-scrubber")).not.toBeInTheDocument();
      });

    });

    describe("Click Behavior in Comparison Mode", () => {
      it("calls onBeforeIndexChange when clicking near yellow scrubber", () => {
        const onIndexChange = vi.fn();
        const onBeforeIndexChange = vi.fn();
        const { container } = renderWithTheme(
          <WaybackSlider
            releases={mockReleases}
            currentIndex={4}
            onIndexChange={onIndexChange}
            comparisonMode={true}
            beforeIndex={1}
            onBeforeIndexChange={onBeforeIndexChange}
          />
        );

        // Find timeline bar
        const timeline = container.querySelector(".h-3.cursor-pointer");
        expect(timeline).toBeInTheDocument();

        // Simulate click at 10% (closer to beforeIndex at position ~25%)
        if (timeline) {
          const rect = { left: 0, width: 1000 } as DOMRect;
          vi.spyOn(timeline, "getBoundingClientRect").mockReturnValue(rect);

          fireEvent.click(timeline, { clientX: 100 }); // 10% position
        }

        // Should call onBeforeIndexChange, not onIndexChange
        expect(onBeforeIndexChange).toHaveBeenCalled();
      });

      it("calls onIndexChange when clicking near green scrubber", () => {
        const onIndexChange = vi.fn();
        const onBeforeIndexChange = vi.fn();
        const { container } = renderWithTheme(
          <WaybackSlider
            releases={mockReleases}
            currentIndex={4}
            onIndexChange={onIndexChange}
            comparisonMode={true}
            beforeIndex={1}
            onBeforeIndexChange={onBeforeIndexChange}
          />
        );

        // Find timeline bar
        const timeline = container.querySelector(".h-3.cursor-pointer");
        expect(timeline).toBeInTheDocument();

        // Simulate click at 90% (closer to currentIndex at position ~100%)
        if (timeline) {
          const rect = { left: 0, width: 1000 } as DOMRect;
          vi.spyOn(timeline, "getBoundingClientRect").mockReturnValue(rect);

          fireEvent.click(timeline, { clientX: 900 }); // 90% position
        }

        // Should call onIndexChange, not onBeforeIndexChange
        expect(onIndexChange).toHaveBeenCalled();
      });

      it("moves closest scrubber based on click position", () => {
        const onIndexChange = vi.fn();
        const onBeforeIndexChange = vi.fn();
        const { container } = renderWithTheme(
          <WaybackSlider
            releases={mockReleases}
            currentIndex={3}
            onIndexChange={onIndexChange}
            comparisonMode={true}
            beforeIndex={1}
            onBeforeIndexChange={onBeforeIndexChange}
          />
        );

        const timeline = container.querySelector(".h-3.cursor-pointer");

        // Click in the middle (50%) - should move whichever is closer
        if (timeline) {
          const rect = { left: 0, width: 1000 } as DOMRect;
          vi.spyOn(timeline, "getBoundingClientRect").mockReturnValue(rect);

          fireEvent.click(timeline, { clientX: 500 }); // 50% position
        }

        // Either handler should be called (which one depends on scrubber positions)
        expect(onIndexChange.mock.calls.length + onBeforeIndexChange.mock.calls.length).toBe(1);
      });
    });

    describe("Single Mode Fallback", () => {
      it("calls onIndexChange when comparison mode is off", () => {
        const onIndexChange = vi.fn();
        const { container } = renderWithTheme(
          <WaybackSlider
            releases={mockReleases}
            currentIndex={2}
            onIndexChange={onIndexChange}
            comparisonMode={false}
          />
        );

        const timeline = container.querySelector(".h-3.cursor-pointer");

        if (timeline) {
          const rect = { left: 0, width: 1000 } as DOMRect;
          vi.spyOn(timeline, "getBoundingClientRect").mockReturnValue(rect);

          fireEvent.click(timeline, { clientX: 500 });
        }

        expect(onIndexChange).toHaveBeenCalled();
      });

      it("does not call onBeforeIndexChange when comparison mode is off", () => {
        const onIndexChange = vi.fn();
        const onBeforeIndexChange = vi.fn();
        const { container } = renderWithTheme(
          <WaybackSlider
            releases={mockReleases}
            currentIndex={2}
            onIndexChange={onIndexChange}
            comparisonMode={false}
            beforeIndex={0}
            onBeforeIndexChange={onBeforeIndexChange}
          />
        );

        const timeline = container.querySelector(".h-3.cursor-pointer");

        if (timeline) {
          const rect = { left: 0, width: 1000 } as DOMRect;
          vi.spyOn(timeline, "getBoundingClientRect").mockReturnValue(rect);

          fireEvent.click(timeline, { clientX: 500 });
        }

        expect(onBeforeIndexChange).not.toHaveBeenCalled();
      });
    });

    describe("Navigation Buttons in Comparison Mode", () => {
      // The per-scrubber pairs live in the maps now (WaybackNav), not the slider.
      it("renders no nav buttons of its own in comparison mode", () => {
        renderWithTheme(
          <WaybackSlider
            releases={mockReleases}
            currentIndex={3}
            onIndexChange={vi.fn()}
            comparisonMode={true}
            beforeIndex={1}
            onBeforeIndexChange={vi.fn()}
          />
        );

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
      });

      it("does not update yellow slider when comparison mode is off", () => {
        const onIndexChange = vi.fn();
        const onBeforeIndexChange = vi.fn();
        renderWithTheme(
          <WaybackSlider
            releases={mockReleases}
            currentIndex={2}
            onIndexChange={onIndexChange}
            comparisonMode={false}
            beforeIndex={1}
            onBeforeIndexChange={onBeforeIndexChange}
          />
        );

        const nextButton = screen.getByRole("button", { name: /Next/i });
        fireEvent.click(nextButton);

        // Green slider should move
        expect(onIndexChange).toHaveBeenCalledWith(3);
        // Yellow slider should NOT move (comparison mode off)
        expect(onBeforeIndexChange).not.toHaveBeenCalled();
      });
    });

    describe("Edge Cases", () => {
      it("handles missing onBeforeIndexChange gracefully", () => {
        const onIndexChange = vi.fn();
        const { container } = renderWithTheme(
          <WaybackSlider
            releases={mockReleases}
            currentIndex={2}
            onIndexChange={onIndexChange}
            comparisonMode={true}
            beforeIndex={0}
          />
        );

        const timeline = container.querySelector(".h-3.cursor-pointer");

        // Should not crash when clicking
        if (timeline) {
          const rect = { left: 0, width: 1000 } as DOMRect;
          vi.spyOn(timeline, "getBoundingClientRect").mockReturnValue(rect);

          expect(() => {
            fireEvent.click(timeline, { clientX: 100 });
          }).not.toThrow();
        }
      });

      it("renders only current scrubber when beforeRelease is null", () => {
        const onIndexChange = vi.fn();
        const onBeforeIndexChange = vi.fn();
        renderWithTheme(
          <WaybackSlider
            releases={mockReleases}
            currentIndex={2}
            onIndexChange={onIndexChange}
            comparisonMode={true}
            beforeIndex={-1} // Invalid index
            onBeforeIndexChange={onBeforeIndexChange}
          />
        );

        expect(screen.getByTestId("wayback-current-scrubber")).toBeInTheDocument();
        expect(screen.queryByTestId("wayback-before-scrubber")).not.toBeInTheDocument();
      });

      it("handles same beforeIndex and currentIndex", () => {
        const onIndexChange = vi.fn();
        const onBeforeIndexChange = vi.fn();
        renderWithTheme(
          <WaybackSlider
            releases={mockReleases}
            currentIndex={2}
            onIndexChange={onIndexChange}
            comparisonMode={true}
            beforeIndex={2} // Same as currentIndex
            onBeforeIndexChange={onBeforeIndexChange}
          />
        );

        // Both scrubbers render (they may overlap visually)
        expect(screen.getByTestId("wayback-current-scrubber")).toBeInTheDocument();
        expect(screen.getByTestId("wayback-before-scrubber")).toBeInTheDocument();
      });
    });
  });
});
