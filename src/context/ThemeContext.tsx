import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "dark" | "light" | "system";

export type AccentColor =
  | "violet"
  | "blue"
  | "cyan"
  | "emerald"
  | "rose"
  | "orange"
  | "pink"
  | "indigo";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;

  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;

  isDark: boolean;
}

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

/* ---------------------------------------------------------
   ACCENT COLORS
--------------------------------------------------------- */

const accentColors: Record<AccentColor, string> = {
  violet: "#8b5cf6",
  blue: "#3b82f6",
  cyan: "#06b6d4",
  emerald: "#10b981",
  rose: "#f43f5e",
  orange: "#f97316",
  pink: "#ec4899",
  indigo: "#6366f1",
};

/* ---------------------------------------------------------
   THEME PROVIDER
--------------------------------------------------------- */

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {

  /* -------------------------------------------------------
     THEME
  ------------------------------------------------------- */

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const saved = localStorage.getItem(
      "erroren_x_theme"
    ) as Theme | null;

    if (
      saved === "dark" ||
      saved === "light" ||
      saved === "system"
    ) {
      return saved;
    }

    return "dark";
  });

  /* -------------------------------------------------------
     ACCENT COLOR
  ------------------------------------------------------- */

  const [accentColor, setAccentColorState] =
    useState<AccentColor>(() => {
      if (typeof window === "undefined") {
        return "violet";
      }

      const saved = localStorage.getItem(
        "erroren_x_accent"
      ) as AccentColor | null;

      if (saved && accentColors[saved]) {
        return saved;
      }

      return "violet";
    });

  /* -------------------------------------------------------
     DARK STATE
  ------------------------------------------------------- */

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const savedTheme = localStorage.getItem(
      "erroren_x_theme"
    ) as Theme | null;

    if (savedTheme === "light") {
      return false;
    }

    if (savedTheme === "dark") {
      return true;
    }

    return window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
  });

  /* -------------------------------------------------------
     APPLY THEME
  ------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;

    localStorage.setItem(
      "erroren_x_theme",
      theme
    );

    const applyTheme = (dark: boolean) => {
      setIsDark(dark);

      if (dark) {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
      }
    };

    /* SYSTEM MODE */

    if (theme === "system") {
      const media = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

      applyTheme(media.matches);

      const handleChange = (
        event: MediaQueryListEvent
      ) => {
        applyTheme(event.matches);
      };

      media.addEventListener(
        "change",
        handleChange
      );

      return () => {
        media.removeEventListener(
          "change",
          handleChange
        );
      };
    }

    /* DARK / LIGHT MODE */

    applyTheme(theme === "dark");
  }, [theme]);

  /* -------------------------------------------------------
     APPLY ACCENT COLOR
  ------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;

    const color =
      accentColors[accentColor] ||
      accentColors.violet;

    localStorage.setItem(
      "erroren_x_accent",
      accentColor
    );

    /* Main accent variables */

    root.style.setProperty(
      "--accent-color",
      color
    );

    root.style.setProperty(
      "--primary",
      color
    );

    root.style.setProperty(
      "--accent",
      color
    );

    root.style.setProperty(
      "--brand-color",
      color
    );

    root.style.setProperty(
      "--theme-accent",
      color
    );

    /* RGB version for opacity effects */

    const hex = color.replace("#", "");

    const r = parseInt(
      hex.substring(0, 2),
      16
    );

    const g = parseInt(
      hex.substring(2, 4),
      16
    );

    const b = parseInt(
      hex.substring(4, 6),
      16
    );

    root.style.setProperty(
      "--accent-rgb",
      `${r}, ${g}, ${b}`
    );

  }, [accentColor]);

  /* -------------------------------------------------------
     CHANGE THEME
  ------------------------------------------------------- */

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  /* -------------------------------------------------------
     CHANGE ACCENT COLOR
  ------------------------------------------------------- */

  const setAccentColor = (
    color: AccentColor
  ) => {
    if (!accentColors[color]) {
      return;
    }

    setAccentColorState(color);
  };

  /* -------------------------------------------------------
     CONTEXT
  ------------------------------------------------------- */

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,

        accentColor,
        setAccentColor,

        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/* ---------------------------------------------------------
   USE THEME HOOK
--------------------------------------------------------- */

export function useTheme() {
  const context = useContext(
    ThemeContext
  );

  if (!context) {
    throw new Error(
      "useTheme must be used within a ThemeProvider"
    );
  }

  return context;
}