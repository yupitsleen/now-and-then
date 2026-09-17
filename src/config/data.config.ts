/**
 * Data Configuration
 *
 * Consolidated registry for heritage site data schemas:
 * - Site statuses (damage levels)
 * - Site types (mosque, church, archaeological, etc.)
 */

import type { StatusConfig } from '../types/siteStatus';
import type { SiteTypeConfig } from '../types/siteTypes';

// ============================================================================
// SITE STATUS REGISTRY
// ============================================================================

/**
 * Site status registry - stores all registered statuses
 */
export const STATUS_REGISTRY: Record<string, StatusConfig> = {
  "destroyed": {
    id: "destroyed",
    severity: 100,
    markerColor: "red",
    description: "Completely destroyed, no structural integrity remaining"
  },
  "heavily-damaged": {
    id: "heavily-damaged",
    severity: 75,
    markerColor: "orange",
    description: "Major structural damage, may not be repairable"
  },
  "looted": {
    id: "looted",
    severity: 60,
    markerColor: "purple",
    description: "Artifacts or valuables stolen or removed"
  },
  "damaged": {
    id: "damaged",
    severity: 50,
    markerColor: "yellow",
    description: "Partial damage, repairable with restoration work"
  },
  "abandoned": {
    id: "abandoned",
    severity: 25,
    markerColor: "gray",
    description: "No longer in use or maintained, but structurally intact"
  },
  "unknown": {
    id: "unknown",
    severity: 10,
    markerColor: "lightgray",
    description: "Status cannot be verified or is uncertain"
  },
  "unharmed": {
    id: "unharmed",
    severity: 0,
    markerColor: "green",
    description: "No damage, fully intact and preserved"
  },
};

/**
 * Get all registered statuses, sorted by severity (highest first)
 */
export function getStatuses(): StatusConfig[] {
  return Object.values(STATUS_REGISTRY)
    .sort((a, b) => b.severity - a.severity);
}

/**
 * Get status configuration by ID
 *
 * Returns a default configuration if status is not registered,
 * ensuring graceful degradation.
 */
export function getStatusConfig(statusId: string): StatusConfig {
  return STATUS_REGISTRY[statusId] || {
    id: statusId,
    severity: 0,
    markerColor: "grey",
    description: "Unknown status"
  };
}

/**
 * Get marker color for a status
 */
export function getMarkerColor(statusId: string): string {
  return getStatusConfig(statusId).markerColor;
}

// ============================================================================
// SITE TYPE REGISTRY
// ============================================================================

/**
 * Site type registry - stores all registered site types
 */
export const SITE_TYPE_REGISTRY: Record<string, SiteTypeConfig> = {
  "mosque": {
    id: "mosque",
    label: "Mosque",
    labelArabic: "مسجد",
    icon: "heroicon:MoonIcon",
    description: "Islamic place of worship"
  },
  "church": {
    id: "church",
    label: "Church",
    labelArabic: "كنيسة",
    icon: "heroicon:PlusIcon",
    description: "Christian place of worship"
  },
  "archaeological": {
    id: "archaeological",
    label: "Archaeological Site",
    labelArabic: "موقع أثري",
    icon: "heroicon:MagnifyingGlassIcon",
    description: "Ancient ruins and historical excavation sites"
  },
  "museum": {
    id: "museum",
    label: "Museum",
    labelArabic: "متحف",
    icon: "heroicon:BuildingLibraryIcon",
    description: "Cultural institution housing artifacts"
  },
  "historic-building": {
    id: "historic-building",
    label: "Historic Building",
    labelArabic: "مبنى تاريخي",
    icon: "heroicon:HomeModernIcon",
    description: "Architecturally or historically significant structure"
  },
  "cemetery": {
    id: "cemetery",
    label: "Cemetery",
    labelArabic: "مقبرة",
    icon: "heroicon:HeartIcon",
    description: "Burial ground and memorial site"
  },
  "monument": {
    id: "monument",
    label: "Monument",
    labelArabic: "نصب تذكاري",
    icon: "heroicon:FlagIcon",
    description: "Memorial or commemorative structure"
  },
  "archive": {
    id: "archive",
    label: "Archive",
    labelArabic: "أرشيف",
    icon: "heroicon:ArchiveBoxIcon",
    description: "Repository for historical documents and records"
  },
  "hospital": {
    id: "hospital",
    label: "Hospital",
    labelArabic: "مستشفى",
    icon: "heroicon:BuildingOffice2Icon",
    description: "Medical facility providing healthcare services"
  },
  "school": {
    id: "school",
    label: "School / University",
    labelArabic: "مدرسة / جامعة",
    icon: "heroicon:AcademicCapIcon",
    description: "Educational institution"
  },
};

/**
 * Get all registered site types
 */
export function getSiteTypes(): SiteTypeConfig[] {
  return Object.values(SITE_TYPE_REGISTRY);
}

/**
 * Get site type configuration by ID
 *
 * Returns a default configuration if type is not registered,
 * ensuring graceful degradation.
 */
export function getSiteTypeConfig(typeId: string): SiteTypeConfig {
  return SITE_TYPE_REGISTRY[typeId] || {
    id: typeId,
    label: typeId,
    icon: "📍",
    description: "Unknown site type"
  };
}

/**
 * Get site type label by ID and locale
 */
export function getSiteTypeLabel(typeId: string, locale: string = 'en'): string {
  const config = getSiteTypeConfig(typeId);

  if (locale === 'ar' && config.labelArabic) {
    return config.labelArabic;
  }

  return config.label;
}

