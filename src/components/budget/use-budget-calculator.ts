
"use client";

import { useMemo } from 'react';
import { z } from 'zod';
import { SUGGEST_MIN_EUR, SUGGEST_MAX_EUR } from '@/lib/local';

const budgetFormDataSchema = z.object({
  whereYouLive: z.enum(["own", "rent"]),
  monthlyNetIncome: z.number(),
  householdSize: z.number(),
  otherHouseholdIncome: z.boolean(),
  otherHouseholdIncomeAmount: z.number().optional(),
  essentialsRent: z.number(),
  essentialsUtilities: z.number(),
  essentialsGroceries: z.number(),
  essentialsTransport: z.number(),
  debts: z.number(),
  savingsGoalPercent: z.number(),
  finalBudget: z.number().optional(),
  enableBudgetLock: z.boolean().optional(),
});

export type BudgetWizardFormData = z.infer<typeof budgetFormDataSchema>;

export function useBudgetCalculator(data: BudgetWizardFormData) {
  const suggestedBudget = useMemo(() => {
    // Step 1: Calculate total income
    const totalIncome = data.monthlyNetIncome + (data.otherHouseholdIncome ? (data.otherHouseholdIncomeAmount || 0) : 0);

    // Step 2: Calculate total expenses
    const essentialsTotal = data.essentialsRent + data.essentialsUtilities + data.essentialsGroceries + data.essentialsTransport;
    const savingsAmount = totalIncome * (data.savingsGoalPercent / 100);
    const totalExpenses = essentialsTotal + data.debts + savingsAmount;

    // Step 3: Calculate discretionary income
    const discretionary = totalIncome - totalExpenses;
    if (discretionary <= 0) return SUGGEST_MIN_EUR;

    // Step 4: Calculate base budget (35% of discretionary, rounded to nearest 5)
    let base = Math.round((0.35 * discretionary) / 5) * 5;
    
    // Step 5: Clamp to min/max
    const clamped = Math.max(SUGGEST_MIN_EUR, Math.min(base, SUGGEST_MAX_EUR));

    return Math.round(clamped);

  }, [data]);

  return { suggestedBudget };
}
