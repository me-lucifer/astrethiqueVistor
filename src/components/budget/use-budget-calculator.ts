
"use client";

import { useMemo } from 'react';
import { z } from 'zod';
import { SUGGEST_MIN_EUR, SUGGEST_MAX_EUR } from '@/lib/local';

export type AboutYou = {
  home: "own" | "rent";
  income: number;
  household: number;
  hasOther: boolean;
  otherIncome?: number;
};

export type Essentials = {
  rent: number;
  utilities: number;
  groceries: number;
  transport: number;
  debts: number;
  savingsPct: number;
};

export function useBudgetCalculator(aboutYou: AboutYou, essentials: Essentials) {
  const suggestedBudget = useMemo(() => {
    if (!aboutYou || !essentials) return SUGGEST_MIN_EUR;
    
    const totalIncome = aboutYou.income + (aboutYou.hasOther ? (aboutYou.otherIncome || 0) : 0);

    const essentialsTotal = essentials.rent + essentials.utilities + essentials.groceries + essentials.transport;
    const savingsAmount = totalIncome * (essentials.savingsPct / 100);
    const totalExpenses = essentialsTotal + essentials.debts + savingsAmount;

    const discretionary = totalIncome - totalExpenses;
    if (discretionary <= 0) return SUGGEST_MIN_EUR;

    let base = Math.round((0.35 * discretionary) / 5) * 5;
    
    const clamped = Math.max(SUGGEST_MIN_EUR, Math.min(base, SUGGEST_MAX_EUR));

    return Math.round(clamped);

  }, [aboutYou, essentials]);

  return { suggestedBudget };
}


    