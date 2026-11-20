// Pure Trip Budget Calculator engine. All money in whole paise.

export interface BudgetCategories {
  transportPaise: number;
  accommodationPaise: number;
  foodPaise: number;
  activitiesPaise: number;
  shoppingPaise: number;
  otherPaise: number;
}

export const BUDGET_CATEGORY_LABELS: Record<keyof BudgetCategories, string> = {
  transportPaise: "Transportation",
  accommodationPaise: "Accommodation",
  foodPaise: "Food",
  activitiesPaise: "Activities / Sightseeing",
  shoppingPaise: "Shopping / Misc",
  otherPaise: "Other",
};

export interface CategoryBreakdown {
  key: keyof BudgetCategories;
  label: string;
  amountPaise: number;
  percent: number; // 0-100
}

export interface BudgetSummary {
  totalPaise: number;
  perPersonPaise: number;
  breakdown: CategoryBreakdown[];
  remainingPaise: number | null; // null if no budget limit set
  overBudget: boolean;
}

export function computeBudgetSummary(
  categories: BudgetCategories,
  travellers: number,
  budgetLimitPaise?: number | null
): BudgetSummary {
  const keys = Object.keys(BUDGET_CATEGORY_LABELS) as (keyof BudgetCategories)[];
  const totalPaise = keys.reduce((sum, k) => sum + (categories[k] || 0), 0);
  const perPersonPaise = travellers > 0 ? Math.round(totalPaise / travellers) : totalPaise;

  const breakdown: CategoryBreakdown[] = keys.map((key) => ({
    key,
    label: BUDGET_CATEGORY_LABELS[key],
    amountPaise: categories[key] || 0,
    percent: totalPaise > 0 ? Math.round(((categories[key] || 0) / totalPaise) * 1000) / 10 : 0,
  }));

  const remainingPaise = budgetLimitPaise != null ? budgetLimitPaise - totalPaise : null;

  return {
    totalPaise,
    perPersonPaise,
    breakdown,
    remainingPaise,
    overBudget: remainingPaise != null && remainingPaise < 0,
  };
}

/** Compares the planned (estimated) budget against the group's actual logged expenses. */
export function compareEstimateVsActual(estimatedTotalPaise: number, actualTotalPaise: number) {
  const differencePaise = actualTotalPaise - estimatedTotalPaise;
  const percentOfEstimate = estimatedTotalPaise > 0 ? Math.round((actualTotalPaise / estimatedTotalPaise) * 1000) / 10 : 0;
  return { estimatedTotalPaise, actualTotalPaise, differencePaise, percentOfEstimate };
}
