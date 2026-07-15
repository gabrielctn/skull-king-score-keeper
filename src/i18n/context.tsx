import React, { createContext, useContext, useEffect, useState } from "react";
import { Lang, Strings } from "./types";
import { en } from "./en";
import { fr } from "./fr";
import { de } from "./de";
import { ar } from "./ar";
import { zh } from "./zh";
import { saveLang } from "../storage";
import { resolvePreferredLang } from "./detection";

export const SUPPORTED_LANGS: readonly Lang[] = ["fr", "en", "de", "ar", "zh"];

const dictionaries: Record<Lang, Strings> = { en, fr, de, ar, zh };

const browserLanguageMap: Record<Lang, string> = {
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
  ar: "ar",
  zh: "zh-CN",
};

export function browserLocale(lang: Lang): string {
  return browserLanguageMap[lang];
}

export function languageLabel(lang: Lang): string {
  return dictionaries[lang].langLabel;
}

/** Best-effort first-launch language guess (web only); defaults to English. */
export function detectLang(): Lang {
  if (typeof navigator !== "undefined") {
    const requested = navigator.languages?.length
      ? navigator.languages
      : navigator.language
        ? [navigator.language]
        : [];
    return resolvePreferredLang(requested);
  }
  return "en";
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
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}
