"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSession, setSession } from "@/lib/session";

export type Language = "en" | "fr";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en'); // Default to 'en' to avoid SSR/client mismatch before effect runs
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedLang = getSession<Language>("lang");
    if (storedLang) {
      setLanguageState(storedLang);
    } else {
      const browserLang = navigator.language.startsWith("fr") ? "fr" : "en";
      setLanguageState(browserLang);
      setSession("lang", browserLang);
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setSession("lang", lang);
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "fr" : "en";
    setLanguage(newLang);
  };

  // Render children only after language has been initialized to prevent hydration mismatches
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
      {isInitialized ? children : null}
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
