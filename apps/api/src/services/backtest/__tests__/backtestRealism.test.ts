import { describe, it, expect } from 'vitest';
import type { OHLCData } from '@stock-assist/shared';
import { roundTripCostPercent, NSE_DELIVERY_COSTS, ZERO_COSTS } from '../costs';
import { checkTrailingOutcome, stopExitPrice } from '../trailingExit';
import { checkOutcome } from '../outcomeChecker';
import { simulateTrade, type ExitConfig } from '../tradeSimulator';
import { runRandomBaseline } from '../randomBaseline';
import type { BacktestSignal } from '../walkForwardEngine';

const bar = (date: string, open: number, high: number, low: number, close: number): OHLCData =>
    ({ date, open, high, low, close, volume: 1000 });

const day = (i: number) => new Date(Date.UTC(2024, 0, 1 + i)).toISOString().split('T')[0];

describe('roundTripCostPercent', () => {
    it('charges roughly 0.34% round trip for NSE delivery (STT is 0.2% of it)', () => {
        const c = roundTripCostPercent(NSE_DELIVERY_COSTS);
        expect(c).toBeGreaterThan(0.33);
        expect(c).toBeLessThan(0.35);
    });

    it('is zero when all charges are zero', () => {
        expect(roundTripCostPercent(ZERO_COSTS)).toBe(0);
    });
});

describe('stopExitPrice', () => {
    it('uses the stop price on the fill bar, the open after an overnight gap', () => {
        const gapDown = bar(day(1), 90, 95, 85, 92);
        expect(stopExitPrice('BUY', 95, gapDown, 0)).toBe(95);
        expect(stopExitPrice('BUY', 95, gapDown, 1)).toBe(90);
        const gapUp = bar(day(1), 112, 115, 108, 110);
        expect(stopExitPrice('SELL', 105, gapUp, 1)).toBe(112);
    });
});

describe('checkOutcome (target exits)', () => {
    it('exits a gapped-through stop at the open, not the stop', () => {
        const res = checkOutcome({
            direction: 'BUY', entryPrice: 100, targetPrice: 125, stopLoss: 95,
            partialTargetR: 1.5, fullTargetR: 2.5,
            futureCandles: [bar(day(0), 100, 101, 99, 100), bar(day(1), 90, 91, 88, 89)],
        });
        expect(res.outcome).toBe('STOP_HIT');
        expect(res.exitPrice).toBe(90);
        expect(res.pnlPercent).toBe(-10);
    });
});

describe('checkTrailingOutcome', () => {
    it('stops out at the initial stop if the trade goes straight against it', () => {
        const res = checkTrailingOutcome({
            direction: 'BUY', entryPrice: 100, stopLoss: 96, atr: 2, trailAtrMult: 3,
            futureCandles: [bar(day(0), 100, 101, 99, 100), bar(day(1), 99, 99, 95, 96)],
        });
        expect(res.outcome).toBe('STOP_HIT');
        expect(res.exitReason).toBe('stop_initial');
        expect(res.exitPrice).toBe(96);
    });

    it('ratchets the stop up behind the best close and locks in profit', () => {
        // Closes 100 → 110 → 120, then a drop. Trail = 3 × 2 = 6 → stop 114 after the 120 close.
        const res = checkTrailingOutcome({
            direction: 'BUY', entryPrice: 100, stopLoss: 96, atr: 2, trailAtrMult: 3,
            futureCandles: [
                bar(day(0), 100, 101, 99, 100),
                bar(day(1), 101, 111, 100, 110),
                bar(day(2), 111, 121, 110, 120),
                bar(day(3), 119, 119, 112, 113),
            ],
        });
        expect(res.exitReason).toBe('stop_trailing');
        expect(res.exitPrice).toBe(114);
        expect(res.pnlPercent).toBe(14);
    });

    it('closes at the last bar when the holding window ends', () => {
        const res = checkTrailingOutcome({
            direction: 'BUY', entryPrice: 100, stopLoss: 90, atr: 2, trailAtrMult: 3,
            futureCandles: [bar(day(0), 100, 102, 99, 101), bar(day(1), 101, 104, 100, 103)],
        });
        expect(res.outcome).toBe('EXPIRED');
        expect(res.exitPrice).toBe(103);
        expect(res.daysToOutcome).toBe(2);
    });
});

describe('simulateTrade', () => {
    const exit: ExitConfig = {
        mode: 'trailing', fillWindowDays: 2, maxHoldDays: 2,
        partialTargetR: 1.5, fullTargetR: 2.5, trailAtrMult: 3, costPercent: 0.34,
    };

    it('returns null when the limit entry never fills inside the fill window', () => {
        const futureBars = [bar(day(1), 110, 112, 108, 111), bar(day(2), 111, 113, 109, 112), bar(day(3), 101, 102, 99, 100)];
        expect(simulateTrade({ direction: 'BUY', entryPrice: 100, stopLoss: 95, targetPrice: 110, atr: 2, futureBars }, exit)).toBeNull();
    });

    it('holds at most maxHoldDays from the fill bar and subtracts costs', () => {
        const futureBars = [
            bar(day(1), 101, 102, 99.5, 101),   // fills at 100
            bar(day(2), 101, 106, 100, 105),    // last bar in the 2-day window
            bar(day(3), 105, 130, 104, 129),    // outside the window — must be ignored
        ];
        const t = simulateTrade({ direction: 'BUY', entryPrice: 100, stopLoss: 95, targetPrice: 110, atr: 2, futureBars }, exit)!;
        expect(t.fillDate).toBe(day(1));
        expect(t.exitDate).toBe(day(2));
        expect(t.grossPnlPercent).toBe(5);
        expect(t.pnlPercent).toBe(4.66);
        expect(t.costPercent).toBe(0.34);
    });
});

describe('runRandomBaseline', () => {
    // Flat-ish random-walk histories for a small universe
    const makeHistory = (seed: number, n = 200): OHLCData[] => {
        let price = 100 + seed;
        let s = seed;
        const bars: OHLCData[] = [];
        for (let i = 0; i < n; i++) {
            s = (s * 9301 + 49297) % 233280;
            const move = (s / 233280 - 0.5) * 4;
            const open = price;
            price = Math.max(10, price + move);
            bars.push(bar(day(i), open, Math.max(open, price) + 1, Math.min(open, price) - 1, price));
        }
        return bars;
    };
    const histories = new Map<string, OHLCData[]>([1, 2, 3, 4, 5].map(k => [`S${k}`, makeHistory(k)]));
    const exit: ExitConfig = {
        mode: 'target', fillWindowDays: 3, maxHoldDays: 7,
        partialTargetR: 1.5, fullTargetR: 2.5, trailAtrMult: 3, costPercent: 0.34,
    };
    const signals = Array.from({ length: 40 }, (_, k) => {
        const i = 110 + k;
        const b = histories.get('S1')![i];
        return {
            date: b.date, symbol: 'S1', direction: 'BUY', atr: 2,
            entryPrice: b.close, stopLoss: b.close - 4, targetPrice: b.close + 10,
            pnlPercent: 1,
        } as unknown as BacktestSignal;
    });

    it('is reproducible with a fixed seed', () => {
        const a = runRandomBaseline(signals, histories, exit, { runs: 20, seed: 7 });
        const b = runRandomBaseline(signals, histories, exit, { runs: 20, seed: 7 });
        expect(a).toEqual(b);
    });

    it('replays one random trade per real trade and reports a p-value in (0, 1]', () => {
        const r = runRandomBaseline(signals, histories, exit, { runs: 20, seed: 7 });
        expect(r.strategyTrades).toBe(40);
        expect(r.randomAvgTradesPerRun).toBeGreaterThan(30);
        expect(r.pValue).toBeGreaterThan(0);
        expect(r.pValue).toBeLessThanOrEqual(1);
        expect(r.randomP5AvgPnlPercent).toBeLessThanOrEqual(r.randomP95AvgPnlPercent);
    });
});
