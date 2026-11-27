import { describe, it, expect } from 'vitest';
import { selectTargets } from '../selection';
import { nmsTransform, annualisedVol } from '../score';
import { Book } from '../book';
import { BUY_RATE, SELL_RATE, DP_CHARGE_RUPEES, roundTripFraction } from '../charges';
import { computeTaxes, afterTaxCurve, fyOf } from '../tax';
import { computeMetrics } from '../metrics';
import { buildContext, mulberry32 } from '../context';
import { simulate } from '../simulate';
import { summarize } from '../report';
import { syntheticPanel, businessDays } from './fixtures';

describe('charges (Zerodha schedule)', () => {
    it('matches the published round-trip rate: 0.2225% + ₹15.34 per sell', () => {
        expect(BUY_RATE).toBeCloseTo(0.0011874, 7);
        expect(SELL_RATE).toBeCloseTo(0.0010374, 7);
        expect(roundTripFraction(25_000)).toBeCloseTo(0.00284, 5);
        expect(roundTripFraction(100_000)).toBeCloseTo(0.00238, 5);
    });
});

describe('selectTargets (NSE rank buffer)', () => {
    const ranked = Array.from({ length: 100 }, (_, i) => i); // symbol i has rank i+1
    const rankOf = (i: number) => i + 1;
    it('takes the top N from scratch', () => {
        expect(selectTargets(ranked, rankOf, [], 10).targets).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
    it('keeps holdings ranked within 1.5N and forces in the top N/2', () => {
        const held = [12, 14, 40];
        const { targets } = selectTargets(ranked, rankOf, held, 10);
        expect(targets).toContain(12);
        expect(targets).toContain(14);
        expect(targets).not.toContain(40);
        expect(targets.slice(0, 5)).toEqual([0, 1, 2, 3, 4]);
        expect(targets).toHaveLength(10);
    });
    it('drops the worst-ranked holdings beyond N/2 when too many qualify', () => {
        const held = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        const { targets } = selectTargets(ranked, rankOf, held, 10);
        expect(targets).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
});

describe('score helpers', () => {
    it('applies the NMS transform', () => {
        expect(nmsTransform(0.5)).toBe(1.5);
        expect(nmsTransform(-1)).toBe(0.5);
    });
    it('annualises daily log-return volatility', () => {
        const prices = new Float32Array(260);
        for (let t = 0; t < 260; t++) prices[t] = 100 * Math.exp((t % 2 ? 0.01 : -0.01));
        expect(annualisedVol(prices, 259)).toBeCloseTo(0.02 * Math.sqrt(252), 1);
    });
});

describe('Book', () => {
    it('charges both sides and books FIFO gains net of charges except STT', () => {
        const b = new Book(100_000);
        b.buy(0, 0, '2020-01-01', 100, 100, 0);
        b.buy(0, 5, '2020-06-01', 110, 100, 0);
        expect(b.cash).toBeCloseTo(100_000 - 21_000 * (1 + BUY_RATE), 6);
        b.sell(0, '2021-03-01', 120, 150, 0);
        expect(b.shares(0)).toBe(50);
        const [first, second] = b.realized;
        expect(first.longTerm).toBe(true);
        expect(second.longTerm).toBe(false);
        expect(first.gain).toBeGreaterThan(1900);
        expect(first.gain).toBeLessThan(2000);
        expect(b.chargesPaid).toBeCloseTo(21_000 * BUY_RATE + 18_000 * SELL_RATE + DP_CHARGE_RUPEES, 6);
    });
    it('keeps value continuous through a 1:1 bonus', () => {
        const b = new Book(0);
        b.cash = 20_000;
        b.buy(0, 0, '2020-01-01', 100, 100, 0);
        const before = b.shares(0) * 100;
        b.applyFactor(0, 0.5);
        expect(b.shares(0) * 50).toBeCloseTo(before, 9);
    });
});

describe('tax', () => {
    it('labels financial years by their April start', () => {
        expect(fyOf('2024-03-31')).toBe(2023);
        expect(fyOf('2024-04-01')).toBe(2024);
    });
    it('sets off and carries losses, then applies the LTCG exemption', () => {
        const t = computeTaxes([
            { date: '2020-05-01', gain: -50_000, longTerm: false },
            { date: '2021-05-01', gain: 80_000, longTerm: false },
            { date: '2021-06-01', gain: 200_000, longTerm: true },
        ]);
        expect(t[0].tax).toBe(0);
        expect(t[1].tax).toBeCloseTo(0.208 * 30_000 + 0.13 * 75_000, 6);
    });
    it('withdraws tax from the curve at the financial-year end', () => {
        const dates = ['2021-03-30', '2021-03-31', '2021-04-01'];
        const post = afterTaxCurve(dates, [100, 110, 110], [{ fy: 2020, shortTerm: 10, longTerm: 0, tax: 11 }]);
        expect(post).toEqual([100, 99, 99]);
    });
});

describe('metrics', () => {
    it('computes CAGR and max drawdown', () => {
        const dates = businessDays(262, '2020-01-01');
        const eq = dates.map((_, k) => (k < 100 ? 100 + k : 199 - (k - 100) * 0.5));
        const m = computeMetrics(dates, eq);
        expect(m.maxDrawdown).toBeCloseTo(eq[261] / 199 - 1, 6);
        expect(m.cagr).toBeCloseTo((eq[261] / 100) ** (1 / m.years) - 1, 9);
    });
});

describe('simulate (synthetic market)', () => {
    const drifts = { A: 0.4, B: 0.3, C: 0.2, D: 0.1, E: 0, F: -0.1 };
    const bonusDay = 600;
    const panel = syntheticPanel(drifts, 800, { A: [{ day: bonusDay, factor: 0.5, kind: 'bonus', source: 'bc' }] });
    const nifty = { dates: panel.dates, close: panel.dates.map((_, t) => 1000 * Math.exp(0.1 * t / 252)) };
    const ctx = buildContext(panel, nifty, new Map());

    it('holds the two strongest trends, survives a bonus, and pays costs', () => {
        const cfg = { K: 6, N: 2, R: 1 as const, filter: false, start: panel.dates[300], end: panel.dates[799], capital: 500_000 };
        const res = simulate(ctx, cfg);
        expect(res.lastTargets.sort()).toEqual(['A', 'B']);
        const k = res.dates.indexOf(panel.dates[bonusDay]);
        expect(Math.abs(res.equity[k] / res.equity[k - 1] - 1)).toBeLessThan(0.05);
        const s = summarize(ctx, cfg, res);
        expect(s.metrics.cagr).toBeGreaterThan(0.25);
        expect(s.metrics.cagr).toBeLessThan(0.45);
        expect(s.chargesPaid).toBeGreaterThan(0);
        expect(s.afterTaxEndValue).toBeLessThan(s.metrics.endValue);
    });

    it('never buys fund units/ETFs, even with the best trend', () => {
        const p = syntheticPanel({ ETF: 0.6, A: 0.4, B: 0.3, C: 0.2 }, 600);
        p.isCompanyShare[p.index.get('ETF')!] = false;
        const c = buildContext(p, { dates: p.dates, close: p.dates.map(() => 1000) }, new Map());
        const res = simulate(c, { K: 4, N: 2, R: 1, filter: false, start: p.dates[300], end: p.dates[599], capital: 500_000 });
        expect(res.lastTargets.sort()).toEqual(['A', 'B']);
    });

    it('random ranks are reproducible for a seed and differ from momentum', () => {
        const cfg = { K: 6, N: 2, R: 1 as const, filter: false, start: panel.dates[300], end: panel.dates[799], capital: 500_000 };
        const a = simulate(ctx, { ...cfg, randomSeed: 7 });
        const b = simulate(ctx, { ...cfg, randomSeed: 7 });
        expect(a.equity).toEqual(b.equity);
        expect(mulberry32(1)()).not.toBe(mulberry32(2)());
    });
});
