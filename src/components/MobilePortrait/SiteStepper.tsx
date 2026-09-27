import type { Site } from "../../types";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useTranslation } from "../../contexts/LocaleContext";

/**
 * Target index for a Prev/Next step, or null when the move is not allowed.
 * With nothing selected (current < 0), Next selects the first site and Prev is disabled.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function stepIndex(current: number, dir: 1 | -1, count: number): number | null {
  if (count <= 0) return null;
  if (current < 0) return dir === 1 ? 0 : null;
  const target = current + dir;
  if (target < 0 || target >= count) return null;
  return target;
}

interface SiteStepperProps {
  sites: Site[];
  highlightedSiteId: string | null;
  onSelect: (siteId: string) => void;
}

/**
 * Prev/Next bar for portrait phones — steps the highlighted site through the
 * filtered list. Sits at the seam between the stacked maps and the sites list.
 */
export function SiteStepper({ sites, highlightedSiteId, onSelect }: SiteStepperProps): JSX.Element {
  const t = useThemeClasses();
  const translate = useTranslation();

  const current = sites.findIndex((s) => s.id === highlightedSiteId);
  const prev = stepIndex(current, -1, sites.length);
  const next = stepIndex(current, 1, sites.length);

  const btn =
    "flex-1 px-4 py-2 text-sm font-bold rounded disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand focus:outline-none";

  return (
    <div className={`flex items-center gap-2 px-3 py-2 ${t.containerBg.semiTransparent}`}>
      <button
        type="button"
        className={`${btn} ${t.bg.hover} ${t.text.heading}`}
        disabled={prev === null}
        onClick={() => prev !== null && onSelect(sites[prev].id)}
        aria-label={translate("common.previous")}
      >
        ◀ {translate("common.previous")}
      </button>
      <button
        type="button"
        className={`${btn} ${t.bg.hover} ${t.text.heading}`}
        disabled={next === null}
        onClick={() => next !== null && onSelect(sites[next].id)}
        aria-label={translate("common.next")}
      >
        {translate("common.next")} ▶
      </button>
    </div>
  );
}
