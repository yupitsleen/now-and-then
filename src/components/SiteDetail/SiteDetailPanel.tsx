import { useState } from "react";
import type { Site } from "../../types";
import { StatusBadge } from "../StatusBadge";
import { formatLabel, translateSiteType, translateStatus } from "../../utils/format";
import { cn } from "../../styles/theme";
import { SiteImage, SiteImagePlaceholder } from "./SiteImage";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useTranslation } from "../../contexts/LocaleContext";
import { InfoIcon } from "../Icons";

const VERIFIED_TOOLTIP =
  "Information about this site was initially gathered by AI. This indicates whether a human has since reviewed and verified the site and all its associated information.";

interface SiteDetailPanelProps {
  site: Site;
  onViewOnMap?: (siteId: string) => void;
}

/**
 * Comprehensive detail panel for heritage sites
 * Displays full information, images, and sources
 */
export function SiteDetailPanel({ site, onViewOnMap }: SiteDetailPanelProps) {
  const t = useThemeClasses();
  const translate = useTranslation();
  const [showVerifiedTooltip, setShowVerifiedTooltip] = useState(false);

  // Translate site type and status
  const siteTypeLabel = translateSiteType(translate, site.type);
  const siteStatusLabel = translateStatus(translate, site.status);

  // For display: show actual destruction date or "Unknown"
  const displayDestructionDate = site.dateDestroyed || null;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-3">
        <StatusBadge status={site.status} className="inline-block" />

        {/* ponytail: read-only indicator, glyph instead of an icon component */}
        <p className={`relative flex w-fit items-center gap-2 text-sm italic ${t.text.muted}`}>
          <span
            aria-hidden="true"
            className={site.verified ? "text-green-600" : "text-red-600"}
          >
            {site.verified ? "✓" : "✗"}
          </span>
          {site.verified ? "Verified" : "Unverified"}
          <button
            type="button"
            onClick={() => setShowVerifiedTooltip((shown) => !shown)}
            aria-expanded={showVerifiedTooltip}
            aria-label={VERIFIED_TOOLTIP}
          >
            <InfoIcon className="w-4 h-4" title={VERIFIED_TOOLTIP} />
          </button>
          {showVerifiedTooltip && (
            <span
              role="tooltip"
              className={`absolute top-full left-0 z-10 mt-1 w-64 rounded-lg p-2 text-xs not-italic shadow-lg ${t.bg.primary} ${t.text.body} border ${t.border.default}`}
            >
              {VERIFIED_TOOLTIP}
            </span>
          )}
        </p>

        {/* Site Names */}
        <div className="text-center">
          <h3 className={`text-2xl sm:text-3xl font-bold ${t.text.heading}`}>{site.name}</h3>
          {site.nameArabic && (
            <p className={`text-lg sm:text-xl mt-2 ${t.text.muted}`}>
              {site.nameArabic}
            </p>
          )}
        </div>
      </div>

      {/* See on Map */}
      {onViewOnMap && (
        <div className="flex justify-center">
          <button
            onClick={() => onViewOnMap(site.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-brand text-white hover:bg-brand-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            See on Map
          </button>
        </div>
      )}

      {/* Key Information Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg p-4 ${t.bg.tertiary}`}>
        <InfoItem label={translate("siteDetail.siteType")} value={siteTypeLabel} t={t} />
        <div>
          <span className={`text-sm font-semibold ${t.text.body}`}>{translate("siteDetail.yearBuilt")}:</span>
          <p className={`mt-1 ${t.text.heading}`}>{site.yearBuilt}</p>
          {site.yearBuiltIslamic && (
            <p className={`text-sm mt-1 ${t.text.muted}`}>{site.yearBuiltIslamic}</p>
          )}
        </div>
        <InfoItem label={translate("siteDetail.status")} value={siteStatusLabel} t={t} />
        <div>
          <span className={`text-sm font-semibold ${t.text.body}`}>{translate("siteDetail.dateDestroyed")}:</span>
          <p className={`mt-1 ${t.text.heading}`}>
            {displayDestructionDate || translate("common.unknown")}
          </p>
          {site.dateDestroyedIslamic && displayDestructionDate && (
            <p className={`text-sm mt-1 ${t.text.muted}`}>{site.dateDestroyedIslamic}</p>
          )}
        </div>
        {site.sourceAssessmentDate && (
          <InfoItem label={translate("siteDetail.surveyDate")} value={site.sourceAssessmentDate} t={t} />
        )}
        <InfoItem label={translate("siteDetail.lastUpdated")} value={site.lastUpdated} t={t} />
      </div>

      {/* Description */}
      <section>
        <h4 className={`text-lg font-semibold mb-2 ${t.text.heading}`}>{translate("siteDetail.description")}</h4>
        <p className={`leading-relaxed ${t.text.body}`}>{site.description}</p>
      </section>

      {/* Historical Significance */}
      {site.historicalSignificance && (
        <section>
          <h4 className={`text-lg font-semibold mb-2 ${t.text.heading}`}>
            {translate("siteDetail.historicalSignificance")}
          </h4>
          <p className={`leading-relaxed ${t.text.body}`}>{site.historicalSignificance}</p>
        </section>
      )}

      {/* Cultural Value / What Was Lost */}
      {site.culturalValue && (
        <section>
          <h4 className={`text-lg font-semibold mb-2 ${t.text.heading}`}>{translate("siteDetail.whatWasLost")}</h4>
          <p className={`leading-relaxed ${t.text.body}`}>{site.culturalValue}</p>
        </section>
      )}

      {/* Images Section - only show if at least one before/after image exists */}
      {(site.images?.before || site.images?.after) && (
        <section>
          <h4 className={`text-lg font-semibold mb-3 ${t.text.heading}`}>{translate("siteDetail.images")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before image */}
            {site.images?.before ? (
              <SiteImage
                image={site.images.before}
                alt={`${site.name} - ${translate("siteDetail.beforeDestruction")}`}
                label={translate("siteDetail.beforeDestruction")}
              />
            ) : (
              <SiteImagePlaceholder label={translate("siteDetail.beforeDestruction")} />
            )}

            {/* After image */}
            {site.images?.after ? (
              <SiteImage
                image={site.images.after}
                alt={`${site.name} - ${translate("siteDetail.afterDestruction")}`}
                label={translate("siteDetail.afterDestruction")}
              />
            ) : (
              <SiteImagePlaceholder label={translate("siteDetail.afterDestruction")} />
            )}

            {/* Satellite image (optional, only show if provided) */}
            {site.images?.satellite && (
              <SiteImage
                image={site.images.satellite}
                alt={`${site.name} - Satellite imagery`}
                label="Satellite imagery"
              />
            )}
          </div>
        </section>
      )}

      {/* Sources Section */}
      {site.sources?.length > 0 && (
        <section>
          <h4 className={`text-lg font-semibold mb-3 ${t.text.heading}`}>{translate("siteDetail.sources")}</h4>
          <div className="space-y-3">
            {site.sources?.map((source, index) => (
              <div
                key={index}
                className={`border-l-4 border-blue-500 pl-4 py-2 rounded-r ${t.bg.tertiary}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`font-medium ${t.text.heading}`}>{source.title}</p>
                    <p className={`text-sm mt-1 ${t.text.muted}`}>{source.organization}</p>
                    {source.date && (
                      <p className={`text-sm mt-1 ${t.text.subtle}`}>{source.date}</p>
                    )}
                  </div>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "ml-4 px-3 py-1 text-sm font-medium",
                        "bg-blue-600 text-white rounded hover:bg-blue-700",
                        "transition-colors whitespace-nowrap"
                      )}
                    >
                      {translate("table.viewDetails")}
                    </a>
                  )}
                </div>
                <span
                  className={cn(
                    "inline-block mt-2 px-2 py-1 text-xs font-medium rounded",
                    t.bg.secondary,
                    t.text.body
                  )}
                >
                  {formatLabel(source.type)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Coordinates (for reference) */}
      <section className={`text-sm border-t pt-4 ${t.text.subtle} ${t.border.default}`}>
        <p>
          <span className="font-medium">{translate("siteDetail.coordinates")}:</span> {site.coordinates[0]},{" "}
          {site.coordinates[1]}
          {site.coordinatesApproximate && <> ({translate("siteDetail.coordinatesApproximate")})</>}
        </p>
      </section>
    </div>
  );
}

/**
 * Helper component for displaying key-value information
 */
function InfoItem({ label, value, t }: { label: string; value: string; t: ReturnType<typeof useThemeClasses> }) {
  return (
    <div>
      <span className={`text-sm font-semibold ${t.text.body}`}>{label}:</span>
      <p className={`mt-1 ${t.text.heading}`}>{value}</p>
    </div>
  );
}
