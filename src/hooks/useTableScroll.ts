import { useRef, useEffect } from "react";

/**
 * Hook for auto-scrolling to highlighted table row
 * Manages refs and scroll behavior
 *
 * @param highlightedSiteId - ID of the highlighted site
 * @returns Refs for container and highlighted row
 *
 * @example
 * ```tsx
 * const { tableContainerRef, highlightedRowRef } = useTableScroll(highlightedSiteId);
 *
 * <div ref={tableContainerRef}>
 *   <tr ref={highlightedSiteId === site.id ? highlightedRowRef : null}>
 * ```
 */
export function useTableScroll(
  highlightedSiteId: string | null | undefined,
  enabled: boolean = true
) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const highlightedRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    // Portrait phones opt out: scrollIntoView(block:"center") scrolls the window,
    // which would yank the view off the maps down to the table on every step.
    if (!enabled) return;
    if (!highlightedSiteId || !highlightedRowRef.current || !tableContainerRef.current) return;

    highlightedRowRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [highlightedSiteId, enabled]);

  return {
    tableContainerRef,
    highlightedRowRef,
  };
}
