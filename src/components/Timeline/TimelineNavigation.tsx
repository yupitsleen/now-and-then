import { useTranslation } from "../../contexts/LocaleContext";
import { Button } from "../Button";

interface TimelineNavigationProps {
  direction: "previous" | "next";
  disabled: boolean;
  onClick: () => void;
}

/**
 * Single timeline event navigation button (Advanced Timeline mode)
 *
 * Rendered twice by TimelineScrubber, side by side at the end of the transport
 * group. Symbol only.
 */
export function TimelineNavigation({ direction, disabled, onClick }: TimelineNavigationProps) {
  const translate = useTranslation();

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="secondary"
      size="xs"
      aria-label={translate(`timeline.${direction}AriaLabel`)}
      title={translate(`timeline.${direction}Title`)}
    >
      {direction === "previous" ? "⏮" : "⏭"}
    </Button>
  );
}
