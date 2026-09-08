import type { ReactNode } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "../../contexts/LocaleContext";
import { useNavigate } from "react-router-dom";
import { Z_INDEX } from "../../constants/layout";
import { TOOLTIPS } from "../../config/tooltips";
import logo from "../../assets/HeritageTrackerLogo.png";

/**
 * Application header: a single left-aligned lockup — logo, place, then the
 * framing. Black background with Palestinian flag colors.
 */
export function AppHeader({
  leading,
  titleLeft,
}: {
  leading?: ReactNode;
  /**
   * Where the lockup starts (px). Pass the map's left edge *as if the panel
   * were open* — it stays there whether the panel is open or railed.
   */
  titleLeft?: number;
}) {
  const { isDark } = useTheme();
  const t = useTranslation();
  const navigate = useNavigate();

  // ponytail: split on "&" — every locale keeps the latin "Then & Now".
  const [then, now] = t("header.title").split("&");

  return (
    <div
      className={`sticky top-0 transition-colors duration-200 ${
        isDark ? "bg-gray-900" : "bg-[#121212]"
      }`}
      style={{ zIndex: Z_INDEX.STICKY }}
      dir="ltr"
    >
      <header className="relative h-10 bg-[#121212] text-[#fefefe] shadow-lg">
        {/* Top-left square slot — absolute so it never shifts the lockup. */}
        {leading && <div className="absolute inset-y-0 left-0">{leading}</div>}

        {/* The lockup shrink-wraps and parks past the leading square, so it
            never covers the toggle button or eats its clicks. */}
        <button
          onClick={() => navigate("/")}
          className="absolute inset-y-0 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#fefefe]"
          style={{ left: titleLeft ?? 48 }}
          aria-label="Go to home page"
          title={TOOLTIPS.HEADER.HOME}
        >
          <img src={logo} alt="" className="h-7 w-auto" />
          {/* The wordmark is split across spans for colour, which leaves screen
              readers to run the words together — name the heading explicitly. */}
          <h1
            className="flex items-center gap-3 leading-none"
            aria-label={`${t("header.location")} ${t("header.title")}`}
          >
            <span className="text-xl font-bold uppercase tracking-[-0.01em]">
              {t("header.location")}
            </span>
            <span className="h-4 w-px bg-[#fefefe]/25" aria-hidden="true" />
            <span className="text-[15px] font-medium tracking-wide">
              <span className="text-[#009639]">{then.trim()}</span>
              <span className="text-[#fefefe]/60"> &amp; </span>
              <span className="text-[#ed3039]">{now?.trim()}</span>
            </span>
          </h1>
        </button>
      </header>
    </div>
  );
}
