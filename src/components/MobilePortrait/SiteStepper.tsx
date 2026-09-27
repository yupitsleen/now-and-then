import type { Site } from "../../types";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useTranslation } from "../../contexts/LocaleContext";
import { COLORS } from "../../config/colorThemes";

/**
 * Target index for a Prev/Next step, -1 to return to the zoomed-out overview,
 * or null when the move is not allowed.
 * With nothing selected (current < 0), Next selects the first site and Prev is disabled.
 * From the first site (current === 0), Prev returns to the overview (-1).
 */
// eslint-disable-next-line react-refresh/only-export-components
export function stepIndex(current: number, dir: 1 | -1, count: number): number | null {
  if (count <= 0) return null;
  if (current < 0) return dir === 1 ? 0 : null;
  const target = current + dir;
  if (target >= count) return null;
  if (target < 0) return -1;
  return target;
}

interface SiteStepperProps {
  sites: Site[];
  highlightedSiteId: string | null;
  onSelect: (siteId: string | null) => void;
  /** "horizontal" (default, portrait bar) or "vertical" (landscape side rail) */
  orientation?: "horizontal" | "vertical";
}

/**
 * Prev/Next control that steps the highlighted site through the filtered
 * list. Horizontal: portrait's seam bar. Vertical: landscape's side rail.
 */
export function SiteStepper({
  sites,
  highlightedSiteId,
  onSelect,
  orientation = "horizontal",
}: SiteStepperProps) {
  const t = useThemeClasses();
  const translate = useTranslation();

  const current = sites.findIndex((s) => s.id === highlightedSiteId);
  const prev = stepIndex(current, -1, sites.length);
  const next = stepIndex(current, 1, sites.length);

  const btn =
    "flex-1 px-4 py-2 text-sm font-bold rounded text-white disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand focus:outline-none";

  const containerClass =
    orientation === "vertical"
      ? `flex flex-col gap-2 p-2 h-full ${t.containerBg.semiTransparent}`
      : `flex items-center gap-2 px-3 py-2 ${t.containerBg.semiTransparent}`;

  return (
    <div className={containerClass}>
      <button
        type="button"
        className={btn}
        style={{ backgroundColor: COLORS.FLAG_GREEN }}
        disabled={prev === null}
        onClick={() => prev !== null && onSelect(prev === -1 ? null : sites[prev].id)}
        aria-label={translate("common.previous")}
      >
        ◀ {translate("common.previous")}
      </button>
      <button
        type="button"
        className={btn}
        style={{ backgroundColor: COLORS.FLAG_RED }}
        disabled={next === null}
        onClick={() => next !== null && onSelect(sites[next].id)}
        aria-label={translate("common.next")}
      >
        {translate("common.next")} ▶
      </button>
    </div>
  );
}
