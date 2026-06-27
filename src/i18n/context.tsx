import React, { createContext, useContext, useState } from "react";
import { Lang, Strings } from "./types";
import { en } from "./en";
import { fr } from "./fr";
import { saveLang } from "../storage";

const dictionaries: Record<Lang, Strings> = { en, fr };

/** Best-effort first-launch language guess (web only); defaults to English. */
export function detectLang(): Lang {
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
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
