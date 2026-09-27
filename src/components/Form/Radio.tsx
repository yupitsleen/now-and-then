import { cn } from "../../styles/theme";
import { useThemeClasses } from "../../hooks/useThemeClasses";

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Optional label text to display next to radio button
   */
  label?: string;
  /**
   * Size variant for compact layouts
   */
  size?: "default" | "small";
}

/**
 * Styled radio button component with consistent theming
 * Supports optional label, small variant, and dark mode
 */
export function Radio({
  label,
  size = "default",
  className,
  id,
  ...props
}: RadioProps) {
  const t = useThemeClasses();

  const sizeClasses = size === "small" ? "h-3.5 w-3.5" : "h-4 w-4";

  const radioClasses = cn(
    "border-2 text-brand focus:ring-2 focus:ring-brand focus:ring-offset-2",
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
  const radioId = id || (label ? `radio-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  return (
    <div className="flex items-center">
      <input
        type="radio"
        id={radioId}
        className={radioClasses}
        {...props}
      />
      {label && (
        <label htmlFor={radioId} className={labelClasses}>
          {label}
        </label>
      )}
    </div>
  );
}
