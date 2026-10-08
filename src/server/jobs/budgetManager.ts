export interface JobBudgetLimits {
  maxSearches: number;
  maxFetches: number;
  timeoutMs: number;
}

export const DISCOVERY_BUDGET: JobBudgetLimits = {
  maxSearches: 20,
  maxFetches: 15,
  timeoutMs: 120_000,
};

export const DEEP_RESEARCH_BUDGET: JobBudgetLimits = {
  maxSearches: 30,
  maxFetches: 25,
  timeoutMs: 300_000,
};

export class BudgetManager {
  private dailySearchCap: number;
  private currentDay: string;
  private dailySearchesUsed = 0;

  constructor() {
    this.dailySearchCap = parseInt(process.env.DAILY_SEARCH_CAP || '300', 10);
    this.currentDay = new Date().toISOString().split('T')[0];
  }

  private checkDayReset() {
    const today = new Date().toISOString().split('T')[0];
    if (today !== this.currentDay) {
      this.currentDay = today;
      this.dailySearchesUsed = 0;
    }
  }

  getDailyCap(): number {
    return this.dailySearchCap;
  }

  getDailySearchesUsed(): number {
    this.checkDayReset();
    return this.dailySearchesUsed;
  }

  getRemainingDailySearches(): number {
    this.checkDayReset();
    return Math.max(0, this.dailySearchCap - this.dailySearchesUsed);
  }

  canSpendSearches(count: number): boolean {
    this.checkDayReset();
    return this.dailySearchesUsed + count <= this.dailySearchCap;
  }

  recordSearches(count: number): void {
    this.checkDayReset();
    this.dailySearchesUsed += count;
  }

  resetDailyForTesting(): void {
    this.dailySearchesUsed = 0;
  }
}

export const budgetManager = new BudgetManager();
