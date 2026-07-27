import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { LANGS, Lang, Strings } from "./types";
import { en } from "./en";
import { fr } from "./fr";
import { es } from "./es";
import { de } from "./de";
import { ar } from "./ar";
import { zh } from "./zh";
import { saveLang } from "../storage";
import { detectPreferredLang } from "./detection";

export const SUPPORTED_LANGS: readonly Lang[] = LANGS;

const dictionaries: Record<Lang, Strings> = { en, fr, es, de, ar, zh };

const browserLanguageMap: Record<Lang, string> = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  ar: "ar",
  zh: "zh-CN",
};

export function browserLocale(lang: Lang): string {
  return browserLanguageMap[lang];
}

/**
 * Each language named in itself, so every reader can find their own entry in
 * the settings list. Deliberately not translated per locale.
 */
const nativeLanguageNames: Record<Lang, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
  de: "Deutsch",
  ar: "العربية",
  zh: "中文（简体）",
};

export function languageNativeName(lang: Lang): string {
  return nativeLanguageNames[lang];
}

/** Best-effort first-launch language guess; defaults to English. */
export function detectLang(): Lang {
  return detectPreferredLang();
}

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Resolved strings for the current language. */
  t: Strings;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = browserLocale(lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (next: Lang) => {
    setLangState(next);
    void saveLang(next);
  };
  return (
    <I18nContext.Provider value={{ lang, setLang, t: dictionaries[lang] }}>
      {Platform.OS === "web" ? (
        children
      ) : (
        <View
          style={{
            flex: 1,
            direction: lang === "ar" ? "rtl" : "ltr",
          }}
        >
          {children}
        </View>
      )}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}
