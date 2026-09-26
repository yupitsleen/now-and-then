import { useState } from "react";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { BaseDropdown, ChevronIcon } from "../Dropdown/BaseDropdown";

interface MultiSelectDropdownProps<T extends string> {
  label: string;
  options: readonly T[];
  selectedValues: T[];
  onChange: (values: T[]) => void;
  formatLabel?: (value: string) => string;
  /** Override z-index for dropdown menu (e.g., when inside a modal) */
  zIndex?: number;
}

/**
 * Custom multi-select dropdown with checkboxes
 * Shows count badge when items are selected
 */
export function MultiSelectDropdown<T extends string>({
  label,
  options,
  selectedValues,
  onChange,
  formatLabel = (v) => v,
  zIndex,
}: MultiSelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (value: T) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const t = useThemeClasses();

  const trigger = (
    <button
      type="button"
      className={`flex items-center justify-between gap-2 px-3 h-9 border rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-transparent focus:outline-none transition-all duration-200 ${t.bg.primary} ${t.border.subtle} ${t.bg.hover}`}
      aria-haspopup="listbox"
    >
      <span className={`font-medium ${t.text.body}`}>
        {label}
        {/* Always reserve space for count to prevent layout shift */}
        <span className={`ml-1 font-semibold inline-block min-w-[24px] ${selectedValues.length > 0 ? 'text-brand' : 'opacity-0'}`}>
          ({selectedValues.length > 0 ? selectedValues.length : '99'})
        </span>
      </span>
      <ChevronIcon isOpen={isOpen} className={t.icon.muted} />
    </button>
  );

  return (
    <BaseDropdown
      trigger={trigger}
      isOpen={isOpen}
      onToggle={setIsOpen}
      zIndex={zIndex}
      menuClassName={`w-44 border rounded-md shadow-lg max-h-48 overflow-y-auto ${t.bg.primary} ${t.border.subtle}`}
    >
      <ul className="py-1" role="listbox">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <li
              key={option}
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 ${t.bg.hover}`}
              onClick={() => toggleOption(option)}
              role="option"
              aria-selected={isSelected}
            >
              {/* Checkbox */}
              <div
                className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 ${
                  isSelected
                    ? "bg-brand border-brand"
                    : `${t.border.subtle} ${t.bg.primary}`
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${t.text.body}`}>{formatLabel(option)}</span>
            </li>
          );
        })}
      </ul>
    </BaseDropdown>
  );
}
