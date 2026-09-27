import { cn } from "../../styles/theme";
import { useThemeClasses } from "../../hooks/useThemeClasses";

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: "default" | "small";
}

/**
 * Styled select component with consistent theming
 * Supports small variant for compact layouts
 * Supports dark mode
 */
export function Select({ size = "default", className, children, ...props }: SelectProps) {
  const t = useThemeClasses();

  const sizeClasses = size === "small" ? "px-2 py-2 text-sm" : "px-4 py-2";

  const baseClasses = cn(
    "w-full rounded-md focus:ring-2 focus:ring-brand focus:border-brand",
    t.border.primary,
    t.input.base,
    sizeClasses,
    className
  );

  return (
    <select className={baseClasses} {...props}>
      {children}
    </select>
  );
}
