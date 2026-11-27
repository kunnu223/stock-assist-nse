/**
 * Random-Entry Baseline — "is this strategy better than luck?"
 *
 * For every real trade, pick a RANDOM stock from the universe on the SAME date
 * and take the same trade on it: same direction, same entry offset / stop /
 * target measured in that stock's own ATR, same fill rule, exit rule, holding
 * period and costs. Repeat many times with a fixed seed.
 *
 * If the strategy's average net P&L per trade is not clearly above the random
 * runs, its stock selection adds nothing — any profit comes from the dates it
 * traded on (e.g. a bull market) or from the exit rules, which the random runs
 * get for free too.
 *
 * Pure function — no DB, no network.
 * @module @stock-assist/api/services/backtest/randomBaseline
 */

import type { OHLCData } from '@stock-assist/shared';
import { calcATR } from '../indicators';
import { simulateTrade, type ExitConfig } from './tradeSimulator';
import type { BacktestSignal } from './walkForwardEngine';

export interface RandomBaselineResult {
    runs: number;
    seed: number;
    strategyTrades: number;
    strategyAvgPnlPercent: number;
    strategyWinRate: number;
    /** t-statistic of the strategy's mean net P&L vs zero (|t| < 2 ≈ could be noise) */
    strategyTStat: number;
    randomAvgTradesPerRun: number;
    randomMeanAvgPnlPercent: number;
    randomP5AvgPnlPercent: number;
    randomP95AvgPnlPercent: number;
    randomMeanWinRate: number;
    /** Share of random runs that did at least as well as the strategy (lower = better) */
    pValue: number;
    verdict: string;
}

/** Small deterministic PRNG so results are reproducible */
function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const round = (x: number, d = 2) => Number(x.toFixed(d));

function percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))));
    return sorted[idx];
}

const MAX_PICK_ATTEMPTS = 5;

export function runRandomBaseline(
    signals: BacktestSignal[],
    histories: Map<string, OHLCData[]>,
    exit: ExitConfig,
    options: { runs?: number; seed?: number } = {},
): RandomBaselineResult {
    const runs = options.runs ?? 100;
    const seed = options.seed ?? 42;
    const rand = mulberry32(seed);

    // date → bar index, per symbol
    const indexBySymbol = new Map<string, Map<string, number>>();
    for (const [symbol, bars] of histories) {
        const m = new Map<string, number>();
        bars.forEach((b, i) => m.set(b.date, i));
        indexBySymbol.set(symbol, m);
    }

    // Symbols that traded on a given date with enough history before it
    const eligibleCache = new Map<string, string[]>();
    const eligibleOn = (date: string): string[] => {
        let list = eligibleCache.get(date);
        if (!list) {
            list = [];
            for (const [symbol, idx] of indexBySymbol) {
                const i = idx.get(date);
                if (i !== undefined && i >= 100 && i < histories.get(symbol)!.length - 1) list.push(symbol);
            }
            eligibleCache.set(date, list);
        }
        return list;
    };

    const atrCache = new Map<string, number>();
    const atrAt = (symbol: string, i: number): number => {
        const key = `${symbol}|${i}`;
        let v = atrCache.get(key);
        if (v === undefined) {
            v = calcATR(histories.get(symbol)!.slice(Math.max(0, i - 15), i + 1));
            atrCache.set(key, v);
        }
        return v;
    };

    // Describe each real trade in ATR units so it can be replayed on another stock
    const templates = signals.flatMap(s => {
        const i = indexBySymbol.get(s.symbol)?.get(s.date);
        if (i === undefined || !(s.atr > 0)) return [];
        const close = histories.get(s.symbol)![i].close;
        return [{
            date: s.date,
            direction: s.direction,
            entryOffsetAtr: (s.entryPrice - close) / s.atr,
            stopAtr: Math.abs(s.entryPrice - s.stopLoss) / s.atr,
            targetAtr: Math.abs(s.targetPrice - s.entryPrice) / s.atr,
        }];
    });

    const runAvgs: number[] = [];
    const runWinRates: number[] = [];
    const runCounts: number[] = [];

    for (let r = 0; r < runs; r++) {
        const pnls: number[] = [];
        for (const t of templates) {
            const pool = eligibleOn(t.date);
            if (pool.length === 0) continue;
            for (let attempt = 0; attempt < MAX_PICK_ATTEMPTS; attempt++) {
                const symbol = pool[Math.floor(rand() * pool.length)];
                const bars = histories.get(symbol)!;
                const i = indexBySymbol.get(symbol)!.get(t.date)!;
                const atr = atrAt(symbol, i);
                if (!(atr > 0)) continue;

                const sign = t.direction === 'BUY' ? 1 : -1;
                const entryPrice = bars[i].close + t.entryOffsetAtr * atr;
                const trade = simulateTrade({
                    direction: t.direction,
                    entryPrice,
                    stopLoss: entryPrice - sign * t.stopAtr * atr,
                    targetPrice: entryPrice + sign * t.targetAtr * atr,
                    atr,
                    futureBars: bars.slice(i + 1),
                }, exit);
                if (trade) {
                    pnls.push(trade.pnlPercent);
                    break;
                }
            }
        }
        runAvgs.push(mean(pnls));
        runWinRates.push(pnls.length ? (pnls.filter(p => p > 0).length / pnls.length) * 100 : 0);
        runCounts.push(pnls.length);
    }

    const strategyPnls = signals.map(s => s.pnlPercent);
    const strategyAvg = mean(strategyPnls);
    const n = strategyPnls.length;
    const sd = n > 1 ? Math.sqrt(strategyPnls.reduce((a, p) => a + (p - strategyAvg) ** 2, 0) / (n - 1)) : 0;
    const tStat = sd > 0 ? strategyAvg / (sd / Math.sqrt(n)) : 0;

    const sorted = [...runAvgs].sort((a, b) => a - b);
    const atLeastAsGood = runAvgs.filter(a => a >= strategyAvg).length;
    const pValue = (atLeastAsGood + 1) / (runs + 1);

    let verdict: string;
    if (n < 30) {
        verdict = `Too few trades (${n}) to judge.`;
    } else if (strategyAvg <= 0) {
        verdict = `Loses money after costs (${round(strategyAvg)}% per trade).`;
    } else if (pValue < 0.05) {
        verdict = `Beats random entries (p=${round(pValue, 3)}). Now confirm on a period it was not designed on.`;
    } else {
        verdict = `Not distinguishable from random entries on the same dates (p=${round(pValue, 3)}) — any profit likely comes from the market, not the stock picks.`;
    }

    return {
        runs,
        seed,
        strategyTrades: n,
        strategyAvgPnlPercent: round(strategyAvg, 3),
        strategyWinRate: round(n ? (strategyPnls.filter(p => p > 0).length / n) * 100 : 0, 1),
        strategyTStat: round(tStat),
        randomAvgTradesPerRun: round(mean(runCounts), 1),
        randomMeanAvgPnlPercent: round(mean(runAvgs), 3),
        randomP5AvgPnlPercent: round(percentile(sorted, 5), 3),
        randomP95AvgPnlPercent: round(percentile(sorted, 95), 3),
        randomMeanWinRate: round(mean(runWinRates), 1),
        pValue: round(pValue, 3),
        verdict,
    };
}
