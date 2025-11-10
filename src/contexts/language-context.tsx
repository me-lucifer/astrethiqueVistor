
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getLocal, setLocal } from "@/lib/local";

type Language = "en" | "fr";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const storedLang = getLocal<Language>("lang");
    if (storedLang) {
      setLanguageState(storedLang);
    } else {
      // Default to browser language, fallback to 'en'
      const browserLang = navigator.language.split('-')[0];
      const defaultLang = browserLang === 'fr' ? 'fr' : 'en';
      setLanguageState(defaultLang);
      setLocal("lang", defaultLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setLocal("lang", lang);
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "fr" : "en";
    setLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
