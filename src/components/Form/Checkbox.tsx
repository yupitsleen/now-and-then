import { cn } from "../../styles/theme";
import { useThemeClasses } from "../../hooks/useThemeClasses";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Optional label text to display next to checkbox
   */
  label?: string;
  /**
   * Size variant for compact layouts
   */
  size?: "default" | "small";
}

/**
 * Styled checkbox component with consistent theming
 * Supports optional label, small variant, and dark mode
 */
export function Checkbox({
  label,
  size = "default",
  className,
  id,
  ...props
}: CheckboxProps) {
  const t = useThemeClasses();

  const sizeClasses = size === "small" ? "h-3.5 w-3.5" : "h-4 w-4";

  const checkboxClasses = cn(
    "rounded border-2 text-brand focus:ring-2 focus:ring-brand focus:ring-offset-2",
    t.border.primary,
    t.input.base,
    sizeClasses,
    className
  );

  const labelClasses = cn(
    size === "small" ? "text-xs" : "text-sm",
    t.text.primary,
    "ml-2 select-none"
  );

  // Generate unique ID if not provided and label exists
  const checkboxId = id || (label ? `checkbox-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={checkboxId}
        className={checkboxClasses}
        {...props}
      />
      {label && (
        <label htmlFor={checkboxId} className={labelClasses}>
          {label}
        </label>
      )}
    </div>
  );
}
