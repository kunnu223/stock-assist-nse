/**
 * Loads the cached NSE data into a ready-to-simulate market: raw panel → corporate-action adjustment
 * → context. Also measures data quality (heuristic split detector vs `Bc` records, unexplained jumps).
 *
 * @module @stock-assist/api/services/momentum/pipeline
 */

import { loadRawPanel, type Panel } from '../nse/panel';
import { applyCorporateActions, detectHeuristicSplits, firstOnOrAfter, prevCloseIdx, type AdjustReport } from '../nse/adjust';
import { buildActionIndex } from '../nse/actionIndex';
import { makeCanonicalizer, parseSymbolChanges } from '../nse/symbolChanges';
import { readCachedSymbolChanges } from '../nse/archive';
import { loadIndex, loadRiskFreeMonthly } from '../nse/indices';
import { buildContext, type Context } from './context';

export interface DataQuality {
    days: number;
    firstDate: string;
    lastDate: string;
    symbols: number;
    adjust: Omit<AdjustReport, 'unverified'> & { unverified: number; unverifiedSample: AdjustReport['unverified'] };
    /** Heuristic split detector vs verified Bc split/bonus events with factor < 0.72, 2010 onward */
    heuristicVsBc: { bcEvents: number; detected: number; matched: number; recall: number; precision: number };
    /** Daily moves beyond ±35% left after adjustment, for stocks in the top-500 universe */
    unexplainedMoves: { count: number; worst: Array<{ symbol: string; date: string; move: number }> };
}

export interface Market { panel: Panel; ctx: Context; quality: DataQuality }

const BC_ERA = '2010-01-01';

export function loadMarket(opts: { start?: string; end?: string } = {}): Market {
    const panel = loadRawPanel(opts);
    const canonical = makeCanonicalizer(parseSymbolChanges(readCachedSymbolChanges()));
    const detections = panel.symbols.map((_, i) => detectHeuristicSplits(panel, i));
    const adjust = applyCorporateActions(panel, buildActionIndex(canonical));
    const ctx = buildContext(panel, loadIndex('NIFTY 500'), loadRiskFreeMonthly());

    const eraStart = firstOnOrAfter(panel.dates, BC_ERA);
    let bcEvents = 0, matched = 0, detected = 0, detectedMatched = 0;
    panel.events.forEach((evs, i) => {
        const bc = evs.filter(e => e.source === 'bc' && e.kind !== 'gap' && e.factor < 0.72 && e.day >= eraStart);
        const h = detections[i].filter(x => x.day >= eraStart);
        bcEvents += bc.length;
        matched += bc.filter(e => h.some(x => Math.abs(x.day - e.day) <= 1)).length;
        detected += h.length;
        detectedMatched += h.filter(x => bc.some(e => Math.abs(x.day - e.day) <= 1)).length;
    });

    const worst: DataQuality['unexplainedMoves']['worst'] = [];
    ctx.monthEnds.forEach((C, m) => {
        const next = ctx.monthEnds[m + 1] ?? panel.dates.length - 1;
        for (const i of ctx.liq[m].ranked.slice(0, 500)) {
            const a = panel.adj[i];
            for (let d = C + 1; d <= next; d++) {
                const p = prevCloseIdx(a, d);
                if (p < 0 || Number.isNaN(a[d])) continue;
                const move = a[d] / a[p] - 1;
                if (Math.abs(move) > 0.35) worst.push({ symbol: panel.symbols[i], date: panel.dates[d], move: Number(move.toFixed(3)) });
            }
        }
    });
    worst.sort((x, y) => Math.abs(y.move) - Math.abs(x.move));

    const quality: DataQuality = {
        days: panel.dates.length,
        firstDate: panel.dates[0],
        lastDate: panel.dates[panel.dates.length - 1],
        symbols: panel.symbols.length,
        adjust: { ...adjust, unverified: adjust.unverified.length, unverifiedSample: adjust.unverified.slice(0, 15) },
        heuristicVsBc: {
            bcEvents, detected, matched,
            recall: bcEvents ? matched / bcEvents : 0,
            precision: detected ? detectedMatched / detected : 0,
        },
        unexplainedMoves: { count: worst.length, worst: worst.slice(0, 25) },
    };
    return { panel, ctx, quality };
}
