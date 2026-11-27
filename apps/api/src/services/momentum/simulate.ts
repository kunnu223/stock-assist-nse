/**
 * Monthly momentum portfolio simulation (see docs/momentum-system-implementation.md §4–5).
 *
 * Signal on the close of a month-end C; orders execute at the next day's open: sells, trims, then
 * buys in rank order (falling back to the next-ranked name when a stock is unaffordable or locked).
 *
 * @module @stock-assist/api/services/momentum/simulate
 */

import { Book } from './book';
import { BUY_RATE, slippageFor } from './charges';
import { scoresFor, randomSnapshot, mulberry32, type Context } from './context';
import { rankAgainst, type ScoreSnapshot } from './score';
import { selectTargets } from './selection';

export interface SimConfig {
    K: number;
    N: number;
    /** Rebalance every R months: 1 = monthly, 3 = Feb/May/Aug/Nov, 6 = May/Nov */
    R: 1 | 3 | 6;
    /** Nifty 500 10-month-SMA trend filter */
    filter: boolean;
    start: string;
    end: string;
    capital: number;
    slippageMult?: number;
    /** When set, ranks are random (baseline) using this seed */
    randomSeed?: number;
}

export interface SimResult {
    dates: string[];
    equity: number[];
    rfDaily: number[];
    book: Book;
    rebalances: number;
    riskOffMonths: number;
    skippedBuys: number;
    disappeared: Array<{ symbol: string; date: string; value: number }>;
    lastTargets: string[];
}

const REBALANCE_MONTHS: Record<number, number[]> = { 1: [], 3: [2, 5, 8, 11], 6: [5, 11] };
const isRebalanceMonth = (iso: string, R: number) => R === 1 || REBALANCE_MONTHS[R].includes(Number(iso.slice(5, 7)));
const MISSING_LIMIT = 5;

export function simulate(ctx: Context, cfg: SimConfig): SimResult {
    const { panel, monthEnds } = ctx;
    const scores = scoresFor(ctx, cfg.K);
    const rand = cfg.randomSeed !== undefined ? mulberry32(cfg.randomSeed) : null;
    const m0 = monthEnds.findIndex(d => panel.dates[d] >= cfg.start) - 1;
    if (m0 < 12) throw new Error(`Not enough history before ${cfg.start}`);
    let last = panel.dates.length - 1;
    while (panel.dates[last] > cfg.end) last--;

    const book = new Book(cfg.capital);
    const lastClose = new Map<number, number>();
    const missing = new Map<number, number>();
    const pendingSells = new Set<number>();
    const res: SimResult = { dates: [], equity: [], rfDaily: [], book, rebalances: 0, riskOffMonths: 0, skippedBuys: 0, disappeared: [], lastTargets: [] };
    let plan: { targets: number[]; fallback: number[]; m: number } | null = null;
    let wasOff = false;
    let curM = m0;

    const slip = (i: number, m: number) => slippageFor(ctx.liq[m].medianValue.get(i) ?? 0, cfg.slippageMult ?? 1);
    const tradable = (i: number, d: number) => panel.open[i][d] > 0 && panel.locked[i][d] === 0;
    const mark = (i: number, d: number) => (panel.open[i][d] > 0 ? panel.open[i][d] : lastClose.get(i) ?? 0);

    for (let d = monthEnds[m0]; d <= last; d++) {
        const date = panel.dates[d];
        for (const ev of ctx.eventsByDay.get(d) ?? []) {
            if (!book.lots.has(ev.i)) continue;
            book.applyFactor(ev.i, ev.factor);
            if (lastClose.has(ev.i)) lastClose.set(ev.i, lastClose.get(ev.i)! * ev.factor);
        }
        if (d > monthEnds[m0] && book.cash > 0) book.cash *= 1 + ctx.rfDaily[d];

        if (plan) {
            execute(plan, d);
            plan = null;
        } else {
            for (const i of [...pendingSells]) {
                if (!book.lots.has(i)) pendingSells.delete(i);
                else if (tradable(i, d)) { book.sell(i, date, panel.open[i][d], book.shares(i), slip(i, curM)); pendingSells.delete(i); }
            }
        }

        for (const i of book.held()) {
            const c = panel.close[i][d];
            if (!Number.isNaN(c)) { lastClose.set(i, c); missing.set(i, 0); continue; }
            const miss = (missing.get(i) ?? 0) + 1;
            missing.set(i, miss);
            if (miss >= MISSING_LIMIT) {
                const value = book.shares(i) * (lastClose.get(i) ?? 0);
                book.sell(i, date, lastClose.get(i) ?? 0, book.shares(i), 0);
                pendingSells.delete(i);
                res.disappeared.push({ symbol: panel.symbols[i], date, value: Math.round(value) });
            }
        }
        res.dates.push(date);
        res.equity.push(book.value(i => lastClose.get(i) ?? 0));
        res.rfDaily.push(d > monthEnds[m0] ? ctx.rfDaily[d] : 0);

        const m = ctx.monthOf.get(d);
        if (m === undefined || d === last) continue;
        curM = m;
        const on = !cfg.filter || ctx.riskOn[m];
        if (!on) {
            res.riskOffMonths++;
            wasOff = true;
            if (book.held().length > 0) plan = { targets: [], fallback: [], m };
        } else if (isRebalanceMonth(date, cfg.R) || wasOff || book.held().length === 0) {
            const base = scores[m];
            if (!base) continue;
            const snap: ScoreSnapshot = rand ? randomSnapshot(base, rand) : base;
            const sel = selectTargets(snap.ranked, i => rankAgainst(snap, i), book.held(), cfg.N);
            plan = { ...sel, m };
            wasOff = false;
            res.rebalances++;
            res.lastTargets = sel.targets.map(i => panel.symbols[i]);
        }
    }
    return res;

    function execute(p: { targets: number[]; fallback: number[]; m: number }, d: number) {
        const date = panel.dates[d];
        const targetSet = new Set(p.targets);
        const tv = book.value(i => mark(i, d)) / cfg.N;
        for (const i of book.held()) {
            if (targetSet.has(i)) continue;
            if (tradable(i, d)) book.sell(i, date, panel.open[i][d], book.shares(i), slip(i, p.m));
            else pendingSells.add(i);
        }
        for (const i of p.targets) {
            if (!book.lots.has(i) || !tradable(i, d)) continue;
            const px = panel.open[i][d];
            const excess = book.shares(i) - Math.floor(tv / px);
            if (book.shares(i) * px > 1.5 * tv && excess > 0) book.sell(i, date, px, excess, slip(i, p.m));
        }
        let slots = cfg.N - p.targets.filter(i => book.lots.has(i)).length;
        for (const i of [...p.targets, ...p.fallback]) {
            if (slots <= 0) break;
            if (book.lots.has(i)) continue;
            const px = panel.open[i][d] * (1 + slip(i, p.m)) * (1 + BUY_RATE);
            if (!tradable(i, d) || px > tv) { if (targetSet.has(i)) res.skippedBuys++; continue; }
            const shares = Math.floor(Math.min(tv, book.cash / slots) / px);
            if (shares < 1) { res.skippedBuys++; continue; }
            book.buy(i, d, date, panel.open[i][d], shares, slip(i, p.m));
            slots--;
        }
        for (const i of p.targets) {
            if (!book.lots.has(i) || !tradable(i, d)) continue;
            const px = panel.open[i][d] * (1 + slip(i, p.m)) * (1 + BUY_RATE);
            const have = book.shares(i) * panel.open[i][d];
            const add = Math.floor(Math.min(tv - have, book.cash) / px);
            if (have < 0.5 * tv && add > 0) book.buy(i, d, date, panel.open[i][d], add, slip(i, p.m));
        }
    }
}
