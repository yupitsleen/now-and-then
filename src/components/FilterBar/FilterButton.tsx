import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ChevronIcon } from "../Dropdown/BaseDropdown";
import { CountBadge } from "../Badge/CountBadge";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { Z_INDEX } from "../../constants/layout";
import { cn } from "../../styles/theme";

interface FilterButtonProps {
  /** Button label */
  label: string;
  /** Number of active selections */
  count: number;
  /** Dropdown content */
  children: React.ReactNode;
  /** Optional icon to show before label */
  icon?: React.ReactNode;
  /** Width of the dropdown panel (default: w-64) */
  panelWidth?: string;
  /** Optional tooltip text */
  tooltip?: string;
}

/**
 * FilterButton - A compact filter button with popover dropdown
 *
 * Uses Headless UI Popover for accessible, unstyled dropdown functionality.
 * Displays count badge when filters are active.
 *
 * @example
 * ```tsx
 * <FilterButton label="Type" count={2}>
 *   <FilterCheckboxList options={types} ... />
 * </FilterButton>
 * ```
 */
export function FilterButton({ label, count, children, icon, panelWidth = "w-64", tooltip }: FilterButtonProps) {
  const t = useThemeClasses();

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <PopoverButton
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border",
              "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand",
              t.bg.primary,
              t.border.subtle,
              t.bg.hover,
              t.text.body,
              open && "ring-2 ring-brand border-brand"
            )}
            title={tooltip}
          >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{label}</span>
            {count > 0 && <CountBadge count={count} variant="primary" />}
            <ChevronIcon isOpen={open} className={cn("w-4 h-4", t.icon.muted)} />
          </PopoverButton>

          <PopoverPanel
            className={cn(
              "absolute left-0 mt-1.5 rounded-md shadow-lg border",
              "focus:outline-none whitespace-nowrap",
              panelWidth,
              t.bg.primary,
              t.border.subtle
            )}
            style={{ zIndex: Z_INDEX.DROPDOWN }}
          >
            <div className="p-2.5 w-max">{children}</div>
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}
