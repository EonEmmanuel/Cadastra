"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  isEn: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
  isEn: true,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedLang = localStorage.getItem("cadastra_lang") as Language | null;
      if (savedLang === "en" || savedLang === "fr") {
        setLanguageState(savedLang);
      }
    } catch {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("cadastra_lang", lang);
    } catch {}
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isEn: language === "en",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
