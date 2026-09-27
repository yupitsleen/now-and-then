import type { Site } from "../../types";
import { getSiteTypeConfig } from "../../config/data.config";
import { getHeroIcon } from "../../config/iconRegistry";
import { COLORS } from "../../config/colorThemes";

interface SiteTypeIconProps {
  type: Site["type"];
  className?: string;
}

/**
 * Unicode icon wrapper component for text-based symbols
 */
function UnicodeIcon({
  symbol,
  className,
  ...props
}: {
  symbol: string;
  className?: string;
  "aria-label"?: string;
  role?: string;
}) {
  return (
    <span
      className={className}
      style={{
        fontSize: '20px',
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: COLORS.FLAG_RED,
      }}
      {...props}
    >
      {symbol}
    </span>
  );
}

/**
 * Icon component for site types with distinct symbols
 *
 * Now uses SITE_TYPE_REGISTRY for extensibility.
 * Supports unicode symbols (default) and heroicon identifiers.
 */
export function SiteTypeIcon({
  type,
  className = "w-5 h-5",
}: SiteTypeIconProps) {
  const typeConfig = getSiteTypeConfig(type);

  // Support heroicon identifiers
  // Format: "heroicon:BuildingLibraryIcon"
  if (typeConfig.icon.startsWith('heroicon:')) {
    const iconName = typeConfig.icon.replace('heroicon:', '');

    // Dynamically get icon from registry (no manual mapping needed!)
    const IconComponent = getHeroIcon(iconName, "solid");

    if (IconComponent) {
      return (
        <IconComponent
          className={`${className} !text-flag-red`}
          aria-label={typeConfig.label}
          role="img"
        />
      );
    }

    // Fallback if icon not found
    if (import.meta.env.DEV) {
      console.warn(
        `Site type "${type}" references unknown Hero Icon "${iconName}". ` +
          `Falling back to Unicode icon.`
      );
    }
  }

  // Default: Unicode symbol
  return (
    <UnicodeIcon
      symbol={typeConfig.icon}
      className={className}
      aria-label={typeConfig.label}
      role="img"
    />
  );
};

/**
 * Get label text for site type
 *
 * Now uses SITE_TYPE_REGISTRY for extensibility.
 * Supports localization via locale parameter.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const getSiteTypeLabel = (type: string, locale: string = 'en'): string => {
  const typeConfig = getSiteTypeConfig(type);

  if (locale === 'ar' && typeConfig.labelArabic) {
    return typeConfig.labelArabic;
  }

  return typeConfig.label;
};