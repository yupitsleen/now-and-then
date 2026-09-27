/**
 * ErrorMessage Component - Display API errors with retry functionality
 *
 * Shows user-friendly error messages with retry button
 * Styled with Palestinian flag red accent (#EE2A35)
 */

import { useTranslation } from "../../contexts/LocaleContext";
import { useThemeClasses } from "../../hooks/useThemeClasses";

interface ErrorMessageProps {
  /**
   * Error object to display
   */
  error: Error;
  /**
   * Retry callback function
   */
  onRetry?: () => void;
  /**
   * Full screen overlay (default: false)
   */
  fullScreen?: boolean;
  /**
   * Custom error title (defaults to translated "errors.somethingWrong")
   */
  title?: string;
}

/**
 * ErrorMessage component with retry functionality
 *
 * @example
 * ```tsx
 * const { sites, error, refetch } = useSites();
 * if (error) return <ErrorMessage error={error} onRetry={refetch} />;
 * ```
 */
export function ErrorMessage({
  error,
  onRetry,
  fullScreen = false,
  title,
}: ErrorMessageProps) {
  const translate = useTranslation();
  const t = useThemeClasses();
  const displayTitle = title || translate("errors.somethingWrong");

  const containerClasses = fullScreen
    ? `fixed inset-0 ${t.containerBg.opaque} z-50 flex items-center justify-center p-4`
    : 'flex items-center justify-center py-12 px-4';

  return (
    <div className={containerClasses} role="alert" aria-live="assertive">
      <div className={`max-w-md w-full ${t.bg.primary} border-2 border-red-200 rounded-xl p-6 shadow-lg`}>
        {/* Error icon */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-[#EE2A35]"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Error title */}
        <h2 className={`text-xl font-semibold ${t.text.heading} text-center mb-2`}>
          {displayTitle}
        </h2>

        {/* Error message */}
        <p className={`${t.text.muted} text-center mb-6`}>
          {error.message || translate("errors.unexpectedError")}
        </p>

        {/* Retry button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="
              w-full
              px-4 py-2
              bg-brand
              hover:bg-[#007A2E]
              text-white
              font-medium
              rounded-lg
              transition-colors
              focus:outline-none
              focus:ring-2
              focus:ring-brand
              focus:ring-offset-2
            "
            type="button"
          >
            {translate("errors.tryAgain")}
          </button>
        )}

        {/* Additional help text */}
        <p className={`text-sm ${t.text.subtle} text-center mt-4`}>
          {translate("errors.persistsContact")}
        </p>
      </div>
    </div>
  );
}
