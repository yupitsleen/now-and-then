import { cn } from "../../styles/theme";
import { useThemeClasses } from "../../hooks/useThemeClasses";
import { useTranslation } from "../../contexts/LocaleContext";
import { Z_INDEX } from "../../constants/layout";

interface AppFooterProps {
  isMobile: boolean;
}

/**
 * Application footer with attribution
 */
export function AppFooter({ isMobile }: AppFooterProps) {
  const t = useThemeClasses();
  const translate = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 text-[#fefefe] shadow-lg transition-colors duration-200 ${t.flag.greenBg}`}
      style={{ zIndex: Z_INDEX.STICKY }}
    >
      {/* Desktop footer - ultra compact */}
      {!isMobile && (
        <div className="py-1.5">
          <div className={cn("container mx-auto px-4")}>
            <p className="text-[10px] text-center">
              {translate("footer.copyright").replace("{year}", currentYear.toString())} •{" "}
              <a
                href="https://github.com/yupitsleen/HeritageTracker"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#fefefe]/80 transition-colors"
                aria-label={translate("aria.viewGithub")}
              >
                {translate("footer.github")}
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Mobile footer - compact */}
      {isMobile && (
        <div className="py-1.5">
          <div className={cn("container mx-auto px-4")}>
            <p className="text-[10px] text-center font-semibold">
              {translate("footer.title")} •{" "}
              <a
                href="https://github.com/yupitsleen/HeritageTracker"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#fefefe]/80 transition-colors"
                aria-label={translate("aria.viewGithub")}
              >
                {translate("footer.github")}
              </a>
            </p>
            <p className="text-[9px] text-center mt-1 opacity-80">
              {translate("footer.copyright").replace("{year}", currentYear.toString())}
            </p>
          </div>
        </div>
      )}
    </footer>
  );
}
