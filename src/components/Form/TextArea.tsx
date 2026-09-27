import { cn } from "../../styles/theme";
import { useThemeClasses } from "../../hooks/useThemeClasses";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Size variant for compact layouts
   */
  size?: "default" | "small";
  /**
   * Whether to show character count
   */
  showCharCount?: boolean;
}

/**
 * Styled textarea component with consistent theming
 * Supports small variant, character count, and dark mode
 */
export function TextArea({
  size = "default",
  showCharCount = false,
  className,
  maxLength,
  value,
  ...props
}: TextAreaProps) {
  const t = useThemeClasses();

  const sizeClasses = size === "small" ? "px-2 py-2 text-sm" : "px-4 py-2";

  const textareaClasses = cn(
    "w-full rounded-md focus:ring-2 focus:ring-brand focus:border-brand resize-y",
    t.border.primary,
    t.input.base,
    sizeClasses,
    className
  );

  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className="relative w-full">
      <textarea className={textareaClasses} maxLength={maxLength} value={value} {...props} />
      {showCharCount && maxLength && (
        <div
          className={cn(
            "absolute bottom-2 right-2 text-xs",
            currentLength > maxLength * 0.9 ? "text-red-500" : t.text.muted
          )}
        >
          {currentLength}/{maxLength}
        </div>
      )}
    </div>
  );
}
