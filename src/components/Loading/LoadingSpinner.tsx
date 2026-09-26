/**
 * LoadingSpinner Component - Centered loading indicator
 *
 * Displays a spinning loader with Palestinian flag green accent
 * Used for full-page or section loading states
 */

import { useTranslation } from "../../contexts/LocaleContext";

interface LoadingSpinnerProps {
  /**
   * Size of the spinner (default: 'md')
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Optional message to display below spinner
   */
  message?: string;
  /**
   * Full screen overlay (default: false)
   */
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 border-2',
  md: 'w-12 h-12 border-3',
  lg: 'w-16 h-16 border-4',
};

const messageSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

/**
 * LoadingSpinner component
 *
 * @example
 * ```tsx
 * <LoadingSpinner />
 * <LoadingSpinner size="lg" message="Loading heritage sites..." />
 * <LoadingSpinner fullScreen message="Initializing application..." />
 * ```
 */
export function LoadingSpinner({
  size = 'md',
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const translate = useTranslation();
  const displayMessage = message || translate("loading.message");

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-90 z-50 flex flex-col items-center justify-center'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      {/* Spinning loader with Palestinian flag green */}
      <div
        className={`
          ${sizeClasses[size]}
          border-gray-200
          border-t-brand
          rounded-full
          animate-spin
        `}
        aria-hidden="true"
      />

      {/* Loading message */}
      {displayMessage && (
        <p className={`mt-4 text-gray-600 ${messageSizeClasses[size]}`}>
          {displayMessage}
        </p>
      )}

      {/* Screen reader only text */}
      <span className="sr-only">{translate("loading.pleaseWait")}</span>
    </div>
  );
}
