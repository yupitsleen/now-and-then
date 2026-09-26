import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { COLORS, PALESTINIAN_FLAG, SUBDUED_COLORS } from "../../config/colorThemes";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

/**
 * Get active state classes for toggle buttons
 */
function getActiveClasses(isDark: boolean): string {
  return isDark
    ? `bg-[${SUBDUED_COLORS.GREEN_DARK}] text-white border-[${SUBDUED_COLORS.GREEN_DARK}]`
    : `bg-[${SUBDUED_COLORS.GREEN_LIGHT}] text-white border-[${SUBDUED_COLORS.GREEN_LIGHT}]`;
}

/**
 * Get active state hover classes
 */
function getActiveHoverClasses(isDark: boolean): string {
  return isDark
    ? `hover:bg-[${SUBDUED_COLORS.GREEN_DARK_HOVER}] hover:shadow-lg`
    : `hover:bg-[${SUBDUED_COLORS.GREEN_LIGHT_HOVER}] hover:shadow-lg`;
}

/**
 * Get text color based on theme and context
 */
function getTextColor(isDark: boolean, lightText: boolean): string {
  return isDark ? "text-gray-300" : lightText ? "text-white" : "text-gray-800";
}

/**
 * Get variant-specific classes for inactive state
 */
function getVariantClasses(variant: ButtonVariant, isDark: boolean, textColor: string): string {
  const variants: Record<ButtonVariant, string> = {
    primary: isDark
      ? `bg-transparent text-gray-300 border-gray-600 hover:bg-brand hover:text-white hover:border-brand hover:shadow-lg active:opacity-80`
      : `bg-transparent ${textColor} border-gray-400 hover:bg-[${COLORS.FLAG_GREEN_HOVER}] hover:text-black hover:border-brand hover:shadow-lg active:opacity-80`,

    secondary: isDark
      ? "bg-transparent text-gray-300 border-gray-600 hover:bg-gray-600 hover:text-white hover:border-gray-500 hover:shadow-lg active:opacity-80"
      : `bg-transparent ${textColor} border-gray-800 hover:bg-gray-700 hover:text-white hover:border-gray-700 hover:shadow-lg active:opacity-80`,

    danger: isDark
      ? `bg-[${PALESTINIAN_FLAG.RED}] text-white border-[${PALESTINIAN_FLAG.RED}] hover:bg-red-700 hover:border-red-700 hover:shadow-lg active:opacity-80`
      : `bg-[${PALESTINIAN_FLAG.RED}] text-white border-[${PALESTINIAN_FLAG.RED}] hover:bg-red-700 hover:border-red-700 hover:shadow-lg active:opacity-80`,

    ghost: isDark
      ? "bg-transparent hover:bg-gray-700 text-gray-300 border-gray-600 hover:opacity-90"
      : `bg-transparent hover:bg-gray-100 ${textColor} hover:text-black border-gray-300 hover:opacity-90`,
  };

  return variants[variant];
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Button content */
  children: ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon to show before text (optional) */
  icon?: ReactNode;
  /** Active/toggled state - shows subdued green background for toggles */
  active?: boolean;
  /** Use light (white) text in light mode - for dark backgrounds like header */
  lightText?: boolean;
}

/**
 * Reusable Button component with theme-aware styling
 *
 * Centralizes all button styling logic to maintain consistency
 * and eliminate duplication across the application.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Apply Filters
 * </Button>
 *
 * <Button variant="danger" disabled={isDisabled} icon={<TrashIcon />}>
 *   Delete
 * </Button>
 * ```
 */
export function Button({
  variant = "primary",
  size = "md",
  children,
  disabled = false,
  fullWidth = false,
  icon,
  active = false,
  lightText = false,
  className = "",
  ...props
}: ButtonProps) {
  const { isDark } = useTheme();

  // Size classes - increased padding for more substantial feel
  const sizeClasses = {
    xs: "px-4 py-1.5 text-xs uppercase tracking-wide",
    sm: "px-5 py-2 text-xs uppercase tracking-wide",
    md: "px-6 py-2.5 text-sm uppercase tracking-wide",
    lg: "px-8 py-3 text-base uppercase tracking-wide",
  }[size];

  // Base classes (always applied) - sharp corners, subtle default, vibrant hover
  const baseClasses = `
    rounded-sm font-semibold border
    transition-all duration-200
    inline-flex items-center justify-center gap-2
    ${fullWidth ? "w-full" : ""}
    ${sizeClasses}
  `
    .trim()
    .replace(/\s+/g, " ");

  // Disabled state (overrides all variants)
  if (disabled) {
    return (
      <button
        disabled
        className={`${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed shadow-none ${className}`}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }

  // Calculate classes using helper functions
  const textColor = getTextColor(isDark, lightText);
  const activeClasses = active ? getActiveClasses(isDark) : "";
  const variantClasses = active
    ? getActiveHoverClasses(isDark)
    : getVariantClasses(variant, isDark, textColor);

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} ${activeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
