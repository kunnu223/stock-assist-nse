/**
 * Cash + whole-share positions with FIFO tax lots and full retail charges.
 *
 * Tax basis includes all charges except STT (STT is not deductible for capital gains).
 *
 * @module @stock-assist/api/services/momentum/book
 */

import { BUY_RATE, SELL_RATE, STT, DP_CHARGE_RUPEES } from './charges';

export interface Lot { day: number; date: string; shares: number; costPerShare: number }
export interface Realized {
    date: string;
    gain: number;
    longTerm: boolean;
    /** For trade statistics: symbol index, buy date of the lot, and its cost basis */
    i?: number;
    buyDate?: string;
    cost?: number;
}

const DAY_MS = 86_400_000;
const isLongTerm = (buy: string, sell: string) => (Date.parse(sell) - Date.parse(buy)) / DAY_MS > 365;

export class Book {
    cash: number;
    readonly lots = new Map<number, Lot[]>();
    readonly realized: Realized[] = [];
    chargesPaid = 0;
    slippagePaid = 0;
    tradedValue = 0;
    trades = 0;

    constructor(capital: number) { this.cash = capital; }

    shares(i: number): number {
        return (this.lots.get(i) ?? []).reduce((s, l) => s + l.shares, 0);
    }

    held(): number[] { return [...this.lots.keys()]; }

    /** Buy `shares` at quote × (1 + slip). Returns rupees spent. */
    buy(i: number, day: number, date: string, quote: number, shares: number, slip: number): number {
        if (shares <= 0) return 0;
        const px = quote * (1 + slip);
        const gross = shares * px;
        const charges = gross * BUY_RATE;
        this.cash -= gross + charges;
        this.chargesPaid += charges;
        this.slippagePaid += shares * quote * slip;
        this.tradedValue += gross;
        this.trades++;
        const costPerShare = px * (1 + BUY_RATE - STT);
        const lots = this.lots.get(i) ?? [];
        lots.push({ day, date, shares, costPerShare });
        this.lots.set(i, lots);
        return gross + charges;
    }

    /** Sell `shares` (FIFO) at quote × (1 − slip). Returns net proceeds. */
    sell(i: number, date: string, quote: number, shares: number, slip: number): number {
        const lots = this.lots.get(i);
        if (!lots || shares <= 0) return 0;
        const px = quote * (1 - slip);
        const gross = shares * px;
        const charges = gross * SELL_RATE + DP_CHARGE_RUPEES;
        this.cash += gross - charges;
        this.chargesPaid += charges;
        this.slippagePaid += shares * quote * slip;
        this.tradedValue += gross;
        this.trades++;
        const netPerShare = (gross - charges + gross * STT) / shares;

        let left = shares;
        while (left > 1e-9 && lots.length > 0) {
            const lot = lots[0];
            const take = Math.min(left, lot.shares);
            this.realized.push({ date, gain: take * (netPerShare - lot.costPerShare), longTerm: isLongTerm(lot.date, date), i, buyDate: lot.date, cost: take * lot.costPerShare });
            lot.shares -= take;
            left -= take;
            if (lot.shares <= 1e-9) lots.shift();
        }
        if (lots.length === 0) this.lots.delete(i);
        return gross - charges;
    }

    /** Split/bonus/gap action with price factor f: holders get 1/f shares per share; basis per share × f. */
    applyFactor(i: number, f: number): void {
        for (const lot of this.lots.get(i) ?? []) {
            lot.shares /= f;
            lot.costPerShare *= f;
        }
    }

    value(price: (i: number) => number): number {
        let v = this.cash;
        for (const i of this.lots.keys()) v += this.shares(i) * price(i);
        return v;
    }
}
