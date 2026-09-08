import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LocaleProvider, useLocale, useTranslation } from "./LocaleContext";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Test component that uses locale context
function TestComponent() {
  const { locale, localeConfig, setLocale, t, getLabel } = useLocale();

  return (
    <div>
      <div data-testid="locale">{locale}</div>
      <div data-testid="direction">{localeConfig.direction}</div>
      <div data-testid="translation">{t("common.loading")}</div>
      <div data-testid="label">{getLabel("Test", "اختبار")}</div>
      <button onClick={() => setLocale("ar")}>Switch to Arabic</button>
      <button onClick={() => setLocale("en")}>Switch to English</button>
    </div>
  );
}

// Test component for useTranslation hook
function TranslationTestComponent() {
  const t = useTranslation();

  return (
    <div>
      <div data-testid="title">{t("header.title")}</div>
      <div data-testid="loading">{t("common.loading")}</div>
    </div>
  );
}

describe("LocaleContext", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    // Reset HTML attributes
    document.documentElement.lang = "en-US";
    document.documentElement.dir = "ltr";
  });

  it("provides default English locale", () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    expect(screen.getByTestId("locale").textContent).toBe("en");
    expect(screen.getByTestId("direction").textContent).toBe("ltr");
  });

  it("translates strings correctly", () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    expect(screen.getByTestId("translation").textContent).toBe("Loading...");
  });

  it("switches to Arabic locale", () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    const switchButton = screen.getByText("Switch to Arabic");
    act(() => {
      switchButton.click();
    });

    expect(screen.getByTestId("locale").textContent).toBe("ar");
    expect(screen.getByTestId("direction").textContent).toBe("rtl");
    expect(screen.getByTestId("translation").textContent).toBe("جار التحميل...");
  });

  it("switches back to English locale", () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    const switchToArabic = screen.getByText("Switch to Arabic");
    act(() => {
      switchToArabic.click();
    });

    const switchToEnglish = screen.getByText("Switch to English");
    act(() => {
      switchToEnglish.click();
    });

    expect(screen.getByTestId("locale").textContent).toBe("en");
    expect(screen.getByTestId("direction").textContent).toBe("ltr");
  });

  it("persists locale to localStorage", () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    const switchButton = screen.getByText("Switch to Arabic");
    act(() => {
      switchButton.click();
    });

    expect(localStorageMock.getItem("heritage-tracker-locale")).toBe("ar");
  });

  it("loads locale from localStorage", () => {
    localStorageMock.setItem("heritage-tracker-locale", "ar");

    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    expect(screen.getByTestId("locale").textContent).toBe("ar");
  });

  it("updates HTML lang attribute", () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    expect(document.documentElement.lang).toBe("en-US");

    const switchButton = screen.getByText("Switch to Arabic");
    act(() => {
      switchButton.click();
    });

    expect(document.documentElement.lang).toBe("ar-EG");
  });

  it("updates HTML dir attribute", () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    expect(document.documentElement.dir).toBe("ltr");

    const switchButton = screen.getByText("Switch to Arabic");
    act(() => {
      switchButton.click();
    });

    expect(document.documentElement.dir).toBe("rtl");
  });

  it("getLabel returns English by default", () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    expect(screen.getByTestId("label").textContent).toBe("Test");
  });

  it("getLabel returns Arabic when locale is Arabic", () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    const switchButton = screen.getByText("Switch to Arabic");
    act(() => {
      switchButton.click();
    });

    expect(screen.getByTestId("label").textContent).toBe("اختبار");
  });
});

describe("useTranslation", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("provides translation function", () => {
    render(
      <LocaleProvider>
        <TranslationTestComponent />
      </LocaleProvider>
    );

    expect(screen.getByTestId("title").textContent).toBe("Then & Now");
    expect(screen.getByTestId("loading").textContent).toBe("Loading...");
  });
});

describe("useLocale error handling", () => {
  it("throws error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useLocale must be used within LocaleProvider");

    consoleSpy.mockRestore();
  });
});

describe("Browser language detection", () => {
  it("detects Arabic from browser language", () => {
    const originalNavigator = window.navigator;
    Object.defineProperty(window, "navigator", {
      value: { language: "ar-SA" },
      writable: true,
      configurable: true,
    });

    localStorageMock.clear();

    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    expect(screen.getByTestId("locale").textContent).toBe("ar");

    // Restore
    Object.defineProperty(window, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it("defaults to English for non-Arabic browser language", () => {
    const originalNavigator = window.navigator;
    Object.defineProperty(window, "navigator", {
      value: { language: "fr-FR" },
      writable: true,
      configurable: true,
    });

    localStorageMock.clear();

    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    expect(screen.getByTestId("locale").textContent).toBe("en");

    // Restore
    Object.defineProperty(window, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });
});
