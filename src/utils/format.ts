/**
 * Formatting utility functions
 */

import type { TranslationKey } from "../types/i18n";
import type { Site } from "../types";

/**
 * Formats kebab-case or snake_case strings to Title Case
 * @example formatLabel("heavily-damaged") => "Heavily Damaged"
 * @example formatLabel("all") => "All"
 */
export const formatLabel = (value: string): string => {
  return value
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Month-precision ISO strings ("2023-12"): sources support the month only,
 * so formatters must not render an invented day.
 */
const isMonthPrecision = (dateString: string): boolean =>
  /^\d{4}-\d{2}$/.test(dateString);

/** Formats a YYYY-MM string as month + year (mid-month noon UTC avoids timezone rollover). */
const formatMonthPrecision = (
  dateString: string,
  locale: string,
  options: Pick<Intl.DateTimeFormatOptions, "month" | "year">
): string =>
  new Date(`${dateString}-15T12:00:00Z`).toLocaleDateString(locale, options);

/**
 * Formats a date string to compact format (short month, day, 2-digit year)
 * @param dateString - ISO date string ("YYYY-MM-DD" or month-precision "YYYY-MM") or null/undefined
 * @param locale - BCP 47 language tag (e.g., 'en-US', 'ar-EG'). Defaults to 'en-US'
 * @example formatDateCompact("2023-12-07") => "Dec 7, 23"
 * @example formatDateCompact("2023-12") => "Dec 23"
 * @example formatDateCompact("2023-12-07", "ar-EG") => "٧ ديسمبر ٢٣"
 * @example formatDateCompact(null) => "N/A"
 */
export const formatDateCompact = (
  dateString: string | null | undefined,
  locale: string = "en-US"
): string => {
  if (!dateString) return "N/A";
  if (isMonthPrecision(dateString)) {
    return formatMonthPrecision(dateString, locale, { month: "short", year: "2-digit" });
  }
  return new Date(dateString).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
};

/**
 * Formats a date string to standard format (short month, day, full year)
 * @param dateString - ISO date string or null/undefined
 * @param locale - BCP 47 language tag (e.g., 'en-US', 'ar-EG'). Defaults to 'en-US'
 * @example formatDateStandard("2023-12-07") => "Dec 7, 2023"
 * @example formatDateStandard("2023-12") => "Dec 2023"
 * @example formatDateStandard("2023-12-07", "ar-EG") => "٧ ديسمبر ٢٠٢٣"
 * @example formatDateStandard(null) => "N/A"
 */
export const formatDateStandard = (
  dateString: string | null | undefined,
  locale: string = "en-US"
): string => {
  if (!dateString) return "N/A";
  if (isMonthPrecision(dateString)) {
    return formatMonthPrecision(dateString, locale, { month: "short", year: "numeric" });
  }
  return new Date(dateString).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Formats a date string to long format (full month name, day, full year)
 * @param dateString - ISO date string or null/undefined
 * @param locale - BCP 47 language tag (e.g., 'en-US', 'ar-EG'). Defaults to 'en-US'
 * @example formatDateLong("2023-12-07") => "December 7, 2023"
 * @example formatDateLong("2023-12") => "December 2023"
 * @example formatDateLong("2023-12-07", "ar-EG") => "٧ ديسمبر ٢٠٢٣"
 * @example formatDateLong(null) => "N/A"
 */
export const formatDateLong = (
  dateString: string | null | undefined,
  locale: string = "en-US"
): string => {
  if (!dateString) return "N/A";
  if (isMonthPrecision(dateString)) {
    return formatMonthPrecision(dateString, locale, { month: "long", year: "numeric" });
  }
  return new Date(dateString).toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Converts kebab-case strings to camelCase for i18n translation keys.
 * Used to map data values (site.status, site.type) to translation key format.
 *
 * @param value - Kebab-case string from data
 * @returns CamelCase string for translation key lookup
 *
 * @example
 * toTranslationKey("heavily-damaged") // => "heavilyDamaged"
 * toTranslationKey("archaeological-site") // => "archaeologicalSite"
 * toTranslationKey("mosque") // => "mosque" (unchanged if no hyphens)
 */
export const toTranslationKey = (value: string): string => {
  return value.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Translates a site status value to its localized string.
 * Handles kebab-case to camelCase conversion and type casting.
 *
 * @param translate - Translation function from useTranslation hook
 * @param status - Site status value (e.g., "heavily-damaged", "destroyed")
 * @returns Translated status string
 *
 * @example
 * translateStatus(translate, "heavily-damaged") // => "Heavily Damaged" (en) or "تضرر بشدة" (ar)
 * translateStatus(translate, "destroyed") // => "Destroyed" (en) or "مدمر" (ar)
 */
export const translateStatus = (
  translate: (key: TranslationKey) => string,
  status: string
): string => {
  return translate(`siteStatus.${toTranslationKey(status)}` as TranslationKey);
};

/**
 * Translates a site type value to its localized string.
 * Handles kebab-case to camelCase conversion and type casting.
 *
 * @param translate - Translation function from useTranslation hook
 * @param type - Site type value (e.g., "archaeological-site", "mosque")
 * @returns Translated type string
 *
 * @example
 * translateSiteType(translate, "archaeological-site") // => "Archaeological Site" (en) or "موقع أثري" (ar)
 * translateSiteType(translate, "mosque") // => "Mosque" (en) or "مسجد" (ar)
 */
export const translateSiteType = (
  translate: (key: TranslationKey) => string,
  type: string
): string => {
  return translate(`siteTypes.${toTranslationKey(type)}` as TranslationKey);
};

/**
 * Gets display names for a site based on current text direction.
 * Handles RTL/LTR language switching for bilingual site name display.
 *
 * @param site - Site object with name and optional nameArabic
 * @param isRTL - Whether current locale uses RTL direction
 * @returns Object with primary and secondary names, plus direction attributes
 *
 * @example
 * // For English (LTR):
 * getSiteDisplayNames({ name: "Great Mosque", nameArabic: "الجامع الكبير" }, false)
 * // => { primary: "Great Mosque", secondary: "الجامع الكبير", primaryDir: "ltr", secondaryDir: "rtl" }
 *
 * // For Arabic (RTL):
 * getSiteDisplayNames({ name: "Great Mosque", nameArabic: "الجامع الكبير" }, true)
 * // => { primary: "الجامع الكبير", secondary: "Great Mosque", primaryDir: "rtl", secondaryDir: "ltr" }
 */
export const getSiteDisplayNames = (
  site: { name: string; nameArabic?: string },
  isRTL: boolean
): {
  primary: string;
  secondary: string | undefined;
  primaryDir: "ltr" | "rtl";
  secondaryDir: "ltr" | "rtl";
} => {
  const primary = isRTL && site.nameArabic ? site.nameArabic : site.name;
  const secondary = isRTL && site.nameArabic ? site.name : site.nameArabic;
  const primaryDir = isRTL ? "rtl" : "ltr";
  const secondaryDir = isRTL ? "ltr" : "rtl";

  return { primary, secondary, primaryDir, secondaryDir };
};

/**
 * Formats a date range for filter pill display
 *
 * @param start - Start date or null
 * @param end - End date or null
 * @param locale - BCP 47 language tag (e.g., 'en-US', 'ar-EG'). Defaults to 'en-US'
 * @returns Formatted date range string or null if both dates are null
 *
 * @example
 * formatDateRange(new Date('2023-01-01'), new Date('2023-12-31'), 'en-US')
 * // => "Jan 2023 - Dec 2023"
 *
 * formatDateRange(new Date('2023-01-01'), null, 'en-US')
 * // => "Jan 2023 - End"
 *
 * formatDateRange(null, null, 'en-US')
 * // => null
 */
export const formatDateRange = (
  start: Date | null,
  end: Date | null,
  locale: string = "en-US"
): string | null => {
  if (!start && !end) return null;

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
  };

  const formatDate = (d: Date | null) =>
    d?.toLocaleDateString(locale, options);

  return `${formatDate(start) || "Start"} - ${formatDate(end) || "End"}`;
};

/**
 * Formats a year range for filter pill display
 *
 * @param start - Start year or null
 * @param end - End year or null
 * @returns Formatted year range string or null if both years are null
 *
 * @example
 * formatYearRange(800, 1200)
 * // => "800 - 1200"
 *
 * formatYearRange(800, null)
 * // => "800 - End"
 *
 * formatYearRange(null, null)
 * // => null
 */
export const formatYearRange = (
  start: number | null,
  end: number | null
): string | null => {
  if (!start && !end) return null;
  return `${start || "Start"} - ${end || "End"}`;
};

/**
 * Gets the effective destruction date for a site with fallback logic.
 *
 * **Terminology Note:**
 * - `dateDestroyed`: Exact date when site was destroyed (preferred)
 * - `sourceAssessmentDate`: Survey date when damage was documented (fallback)
 * - Display term in UI: "Survey Date" (not "Source Assessment Date")
 *
 * See `Site.sourceAssessmentDate` JSDoc in types/index.ts for full documentation.
 *
 * @param site - Site object with optional dateDestroyed and sourceAssessmentDate
 * @returns The effective destruction date (dateDestroyed or sourceAssessmentDate), or undefined if neither exists
 *
 * @example
 * // Prefers actual destruction date
 * getEffectiveDestructionDate({ dateDestroyed: "2023-10-15", sourceAssessmentDate: "2025-10-06" })
 * // => "2023-10-15"
 *
 * // Falls back to survey date when destruction date unknown
 * getEffectiveDestructionDate({ sourceAssessmentDate: "2025-10-06" })
 * // => "2025-10-06"
 *
 * // Returns undefined when no dates available
 * getEffectiveDestructionDate({})
 * // => undefined
 */
export const getEffectiveDestructionDate = (
  site: Pick<Site, "dateDestroyed" | "sourceAssessmentDate">
): string | undefined => {
  return site.dateDestroyed || site.sourceAssessmentDate;
};

/**
 * Sorts sites by effective destruction date (ascending, nulls last) — mirrors
 * the sites table's default sort so Prev/Next steppers walk the same order
 * as the visible rows instead of jumping.
 */
export const sortByEffectiveDestructionDate = <
  T extends Pick<Site, "dateDestroyed" | "sourceAssessmentDate">,
>(
  sites: T[]
): T[] => {
  return [...sites].sort((a, b) => {
    const av = getEffectiveDestructionDate(a);
    const bv = getEffectiveDestructionDate(b);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const as = av.toLowerCase();
    const bs = bv.toLowerCase();
    if (as < bs) return -1;
    if (as > bs) return 1;
    return 0;
  });
};

/**
 * Checks if a site has an unknown destruction date.
 * A site has an unknown destruction date if it only has a sourceAssessmentDate
 * but no actual dateDestroyed.
 *
 * @param site - Site object with optional dateDestroyed and sourceAssessmentDate
 * @returns true if the site has only a survey date (unknown exact destruction date)
 *
 * @example
 * // Site with exact destruction date - NOT unknown
 * hasUnknownDestructionDate({ dateDestroyed: "2023-10-15", sourceAssessmentDate: "2025-10-06" })
 * // => false
 *
 * // Site with only survey date - IS unknown
 * hasUnknownDestructionDate({ sourceAssessmentDate: "2025-10-06" })
 * // => true
 *
 * // Site with no dates at all - NOT unknown (excluded from timeline entirely)
 * hasUnknownDestructionDate({})
 * // => false
 */
export const hasUnknownDestructionDate = (
  site: Pick<Site, "dateDestroyed" | "sourceAssessmentDate">
): boolean => {
  return !site.dateDestroyed && !!site.sourceAssessmentDate;
};
