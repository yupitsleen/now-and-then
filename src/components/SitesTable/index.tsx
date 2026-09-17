import type { Site } from "../../types";
import { SitesTableMobile } from "./SitesTableMobile";
import { SitesTableDesktop } from "./SitesTableDesktop";

interface SitesTableProps {
  sites: Site[];
  onSiteClick?: (site: Site) => void;
  onSiteTypeClick?: (site: Site) => void; // Opens detail from the type icon only
  onSiteHighlight?: (siteId: string | null) => void;
  highlightedSiteId?: string | null;
  onExpandTable?: () => void;
  onCloseExpanded?: () => void; // Expanded variant: green X to leave the full-screen table
  variant?: "compact" | "expanded" | "mobile";
  visibleColumns?: string[]; // For resizable table - which columns to show
  tooltipText?: string; // Optional custom tooltip text for the info icon
  clickableRow?: boolean; // If true, entire row opens site detail (for Data page)
  nameClickOnlyWhenHighlighted?: boolean; // Timeline: two-step (click row highlights, then name opens detail)
  embedded?: boolean; // Drop the panel chrome (border/background/title) - host provides it
}

/**
 * Table view of heritage sites with click-to-view-details and sorting
 * Supports compact, expanded, and mobile accordion variants
 *
 * @variant compact - Desktop sidebar table (Name, Status, Destruction Date, Actions)
 * @variant expanded - Full modal table with all fields (Type, Islamic dates, Built dates)
 * @variant mobile - Accordion list for screens < 768px (Name/Type/Date collapsed, tap to expand for full details)
 *
 * Mobile features: Status shown via name color, sortable columns, sticky headers, inline detail expansion
 */
export function SitesTable({
  sites,
  onSiteClick,
  onSiteTypeClick,
  onSiteHighlight,
  highlightedSiteId,
  onExpandTable,
  onCloseExpanded,
  variant = "compact",
  visibleColumns,
  tooltipText,
  clickableRow = false,
  nameClickOnlyWhenHighlighted = false,
  embedded = false,
}: SitesTableProps) {
  // Route to appropriate variant component
  if (variant === "mobile") {
    return <SitesTableMobile sites={sites} />;
  }

  return (
    <SitesTableDesktop
      sites={sites}
      onSiteClick={onSiteClick}
      onSiteTypeClick={onSiteTypeClick}
      onSiteHighlight={onSiteHighlight}
      highlightedSiteId={highlightedSiteId}
      onExpandTable={onExpandTable}
      onCloseExpanded={onCloseExpanded}
      variant={variant}
      visibleColumns={visibleColumns}
      tooltipText={tooltipText}
      clickableRow={clickableRow}
      nameClickOnlyWhenHighlighted={nameClickOnlyWhenHighlighted}
      embedded={embedded}
    />
  );
}
