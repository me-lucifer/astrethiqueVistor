
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
  rentOrMortgage: number;
  utilities: number;
  groceries: number;
  transport: number;
  debts: number;
  savingsPct: number;
};

export function useBudgetCalculator(aboutYou: AboutYou, essentials: Essentials) {
  const { suggestedBudget, disposable } = useMemo(() => {
    if (!aboutYou || !essentials) return { suggestedBudget: SUGGEST_MIN_EUR, disposable: 0 };
    
    const totalIncome = aboutYou.income + (aboutYou.hasOther ? (aboutYou.otherIncome || 0) : 0);

    const essentialsTotal = essentials.rentOrMortgage + essentials.utilities + essentials.groceries + essentials.transport;
    const savingsAmount = totalIncome * (essentials.savingsPct / 100);
    const totalExpenses = essentialsTotal + essentials.debts + savingsAmount;

    const currentDisposable = Math.max(0, totalIncome - totalExpenses);
    if (currentDisposable <= 0) return { suggestedBudget: SUGGEST_MIN_EUR, disposable: 0 };

    let base = Math.round((0.15 * currentDisposable) / 5) * 5;
    
    const clamped = Math.max(SUGGEST_MIN_EUR, Math.min(base, SUGGEST_MAX_EUR));

    return { suggestedBudget: Math.round(clamped), disposable: Math.round(currentDisposable) };

  }, [aboutYou, essentials]);

  return { suggestedBudget, disposable };
}
