import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { useTranslation, useLocale } from "../../contexts/LocaleContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getAllLocales } from "../../config/locales";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { IntervalSelector } from "./IntervalSelector";
import { ReleaseDatePicker } from "./ReleaseDatePicker";
import type { ComparisonInterval } from "../../types/waybackTimelineTypes";
import type { LocaleCode } from "../../types/i18n";
import type { WaybackRelease } from "../../services/waybackService";

interface WaybackSettingsProps {
  comparisonMode: boolean;
  onComparisonModeToggle: () => void;
  comparisonInterval: ComparisonInterval;
  onIntervalChange: (interval: ComparisonInterval) => void;
  syncMapVersion: boolean;
  onSyncMapVersionToggle: () => void;
  /** Wayback slider positions - editable only in manual (non-synced) mode */
  releases?: WaybackRelease[];
  beforeIndex?: number;
  onBeforeIndexChange?: (index: number) => void;
  afterIndex?: number;
  onAfterIndexChange?: (index: number) => void;
  /** Advanced: reveal the Wayback imagery slider (hidden by default) */
  showImagerySlider?: boolean;
  onShowImagerySliderToggle?: () => void;
  /** View option: stack the imagery slider and site timeline instead of tabbing between them */
  separateTimelines?: boolean;
  onSeparateTimelinesToggle?: () => void;
  /** Opens the page's help modal. Without it the modal has no trigger at all. */
  onOpenHelp?: () => void;
}

/**
 * WaybackSettings - Comparison-mode controls for the Wayback imagery timeline.
 *
 * Lives in the filter sidebar's Settings tab so the slider header keeps only
 * temporal navigation.
 */
export function WaybackSettings({
  comparisonMode,
  onComparisonModeToggle,
  comparisonInterval,
  onIntervalChange,
  syncMapVersion,
  onSyncMapVersionToggle,
  releases = [],
  beforeIndex,
  onBeforeIndexChange,
  afterIndex,
  onAfterIndexChange,
  showImagerySlider = false,
  onShowImagerySliderToggle,
  separateTimelines = false,
  onSeparateTimelinesToggle,
  onOpenHelp,
}: WaybackSettingsProps) {
  const translate = useTranslation();
  const t = useThemeClasses();
  const { locale, setLocale } = useLocale();
  const { isDark, toggleTheme } = useTheme();

  // Same shape as the sidebar's "Show unknown dates" checkbox so settings read as filters.
  const checkbox = (
    label: string,
    checked: boolean,
    onChange: () => void,
    title: string
  ) => (
    <label className="flex items-center gap-3 cursor-pointer" title={title}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 rounded border-gray-300 text-[#009639] focus:ring-[#009639] cursor-pointer"
      />
      <span className={`text-sm ${t.text.body}`}>{label}</span>
    </label>
  );

  // Sync vs. manual is one exclusive choice, so it's a radio group, not two
  // checkboxes — the markup itself guarantees they can never both be on.
  const mapVersionRadio = (
    label: string,
    checked: boolean,
    title: string
  ) => (
    <label className="flex items-center gap-3 cursor-pointer" title={title}>
      <input
        type="radio"
        name="wayback-map-version-mode"
        checked={checked}
        onChange={() => {
          if (!checked) onSyncMapVersionToggle();
        }}
        className="w-5 h-5 border-gray-300 text-[#009639] focus:ring-[#009639] cursor-pointer"
      />
      <span className={`text-sm ${t.text.body}`}>{label}</span>
    </label>
  );

  return (
    <div className="flex flex-col items-stretch gap-3">
      {checkbox(
        translate("timeline.comparisonMode"),
        comparisonMode,
        onComparisonModeToggle,
        translate("timeline.comparisonMode")
      )}

      {mapVersionRadio(
        translate("timeline.syncMapVersion"),
        syncMapVersion,
        translate("timeline.syncMapVersionTooltip")
      )}

      {/* Belongs to Sync Map Version — sits directly under it. */}
      <IntervalSelector
        value={comparisonInterval}
        onChange={onIntervalChange}
        comparisonModeEnabled={comparisonMode}
        syncMapVersion={syncMapVersion}
      />

      {/* The other half of the map-version radio group. */}
      {mapVersionRadio(
        translate("timeline.manualMapVersion"),
        !syncMapVersion,
        translate("timeline.manualMapVersionTooltip")
      )}

      {/* Slider positions - belong to Manual mode, so disabled while syncing */}
      {afterIndex !== undefined && onAfterIndexChange && (
        <ReleaseDatePicker
          releases={releases}
          beforeIndex={comparisonMode ? beforeIndex : undefined}
          onBeforeChange={comparisonMode ? onBeforeIndexChange : undefined}
          afterIndex={afterIndex}
          onAfterChange={onAfterIndexChange}
          disabled={syncMapVersion}
        />
      )}

      {/* ponytail: native <details> — collapsed by default, no state, no lib. */}
      <details className="mt-1">
        <summary
          className={`text-sm font-semibold cursor-pointer ${t.text.heading}`}
        >
          {translate("timeline.advancedSettings")}
        </summary>
        <div className="flex flex-col items-stretch gap-3 mt-3">
          {onShowImagerySliderToggle &&
            checkbox(
              translate("timeline.showImagerySlider"),
              showImagerySlider,
              onShowImagerySliderToggle,
              translate("timeline.showImagerySliderTooltip")
            )}

          {/* Stacked-vs-tabbed only means anything once the slider exists. */}
          {showImagerySlider &&
            onSeparateTimelinesToggle &&
            checkbox(
              translate("timeline.separateTimelines"),
              separateTimelines,
              onSeparateTimelinesToggle,
              translate("timeline.separateTimelinesTooltip")
            )}

          {checkbox(
            translate("timeline.darkMode"),
            isDark,
            toggleTheme,
            translate("timeline.darkMode")
          )}

          {/* Same shape as IntervalSelector so the settings tab reads as one list. */}
          <div className="flex items-center gap-2 min-w-0">
            <label htmlFor="language-selector" className={`text-xs flex-shrink-0 ${t.text.primary}`}>
              {translate("timeline.language")}:
            </label>
            <select
              id="language-selector"
              value={locale}
              onChange={(e) => setLocale(e.target.value as LocaleCode)}
              className={`text-xs px-2 py-1 rounded border cursor-pointer transition-all duration-200 min-w-0 flex-1 ${t.border.primary} ${t.bg.primary} ${t.text.primary}`}
            >
              {getAllLocales().map((loc) => (
                <option key={loc.code} value={loc.code}>
                  {loc.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* The header no longer has a help button, so this is the only way in. */}
          {onOpenHelp && (
            <button
              type="button"
              onClick={onOpenHelp}
              className={`flex items-center gap-2 text-sm text-left rounded focus:ring-2 focus:ring-[#009639] focus:outline-none ${t.text.body}`}
            >
              <QuestionMarkCircleIcon className="w-5 h-5 flex-none" aria-hidden="true" />
              {translate("common.help")}
            </button>
          )}
        </div>
      </details>
    </div>
  );
}
