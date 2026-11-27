/**
 * Live monthly orders for the momentum system — the "blind trading" step.
 *
 * Run after ~7 pm on the last trading day of the month (bhavcopy is published in the evening):
 *   npx tsx scripts/momentumPicks.ts --holdings ~/holdings.json [--cash 500000] [--sync]
 *
 * holdings.json: { "cash": 12345, "positions": { "RELIANCE": 10, "TCS": 4 } }
 * (a missing file means an empty portfolio; --cash overrides the file's cash)
 * Prints the trend state, the target list and exact SELL/BUY quantities to place as AMO orders
 * for the next morning's open. Uses the variant frozen in docs/results/momentum-design.json.
 */

import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { loadMarket } from '../src/services/momentum/pipeline';
import { scoresFor } from '../src/services/momentum/context';
import { rankAgainst } from '../src/services/momentum/score';
import { selectTargets } from '../src/services/momentum/selection';
import { BUY_RATE, slippageFor } from '../src/services/momentum/charges';
import { getBhavcopy, getCorporateActionsFile } from '../src/services/nse/archive';
import type { SimConfig } from '../src/services/momentum/simulate';

const arg = (name: string) => {
    const i = process.argv.indexOf(`--${name}`);
    return i !== -1 ? process.argv[i + 1] : undefined;
};

async function topUp(days = 45) {
    for (let t = Date.now() - days * 86_400_000; t <= Date.now(); t += 86_400_000) {
        const iso = new Date(t).toISOString().slice(0, 10);
        if ([0, 6].includes(new Date(t).getUTCDay())) continue;
        if (await getBhavcopy(iso)) await getCorporateActionsFile(iso);
    }
}

async function main() {
    const design = path.resolve(__dirname, '../../../docs/results/momentum-design.json');
    const cfg = JSON.parse(readFileSync(design, 'utf8')).chosen as SimConfig;
    const holdingsFile = arg('holdings');
    const holdings = holdingsFile && existsSync(holdingsFile)
        ? JSON.parse(readFileSync(holdingsFile, 'utf8')) as { cash?: number; positions?: Record<string, number> }
        : {};
    const cash = Number(arg('cash') ?? holdings.cash ?? 0);
    const positions = holdings.positions ?? {};
    if (process.argv.includes('--sync')) await topUp();

    const { panel, ctx } = loadMarket();
    const m = ctx.monthEnds.length - 1;
    const C = ctx.monthEnds[m];
    const asOf = panel.dates[C];
    let next = Date.parse(`${asOf}T00:00:00Z`) + 86_400_000;
    while ([0, 6].includes(new Date(next).getUTCDay())) next += 86_400_000;
    const monthEnd = new Date(next).toISOString().slice(5, 7) !== asOf.slice(5, 7);

    const price = (i: number) => panel.close[i][C];
    const held = new Map<number, number>();
    for (const [sym, qty] of Object.entries(positions)) {
        const i = panel.index.get(sym);
        if (i === undefined) console.warn(`! ${sym} not found in NSE data — check the symbol`);
        else held.set(i, qty);
    }
    const equity = cash + [...held].reduce((v, [i, q]) => v + q * (price(i) || 0), 0);
    const riskOn = !cfg.filter || ctx.riskOn[m];
    const month = Number(asOf.slice(5, 7));
    const scheduled = cfg.R === 1 || (cfg.R === 3 ? [2, 5, 8, 11] : [5, 11]).includes(month);

    console.log(`Variant ${JSON.stringify({ K: cfg.K, N: cfg.N, R: cfg.R, filter: cfg.filter })} | data as of ${asOf}${monthEnd ? '' : '  ⚠ NOT the month-end yet: indicative only'}`);
    console.log(`Portfolio value ₹${Math.round(equity).toLocaleString('en-IN')} | trend filter: ${cfg.filter ? (riskOn ? 'RISK-ON' : 'RISK-OFF → hold cash') : 'off'}`);
    if (riskOn && !scheduled && held.size > 0) {
        console.log('Not a rebalance month for this variant: no trades. Hold current positions.');
        return;
    }

    const snap = scoresFor(ctx, cfg.K)[m];
    if (!snap) throw new Error('Not enough history for scores');
    const sel = riskOn ? selectTargets(snap.ranked, i => rankAgainst(snap, i), held.keys(), cfg.N) : { targets: [], fallback: [] };
    const tv = equity / cfg.N;
    const slip = (i: number) => slippageFor(ctx.liq[m].medianValue.get(i) ?? 0);
    const orders: Array<{ action: string; symbol: string; qty: number; approxPrice: number; approxValue: number }> = [];
    const targetSet = new Set(sel.targets);

    let freeCash = cash;
    const add = (action: string, i: number, qty: number) =>
        orders.push({ action, symbol: panel.symbols[i], qty, approxPrice: price(i), approxValue: qty * price(i) });
    const buyPx = (i: number) => price(i) * (1 + slip(i)) * (1 + BUY_RATE);

    // Same order as the backtest: sells, trims, new buys, top-ups.
    // Kept holdings are resized only outside 0.5–1.5× the target weight.
    for (const [i, q] of held) {
        if (targetSet.has(i)) continue;
        add('SELL', i, q);
        freeCash += q * price(i);
    }
    for (const i of sel.targets) {
        const q = held.get(i);
        if (!q || q * price(i) <= 1.5 * tv) continue;
        const qty = q - Math.floor(tv / price(i));
        add('SELL (trim)', i, qty);
        freeCash += qty * price(i);
    }
    let slots = cfg.N - sel.targets.filter(i => held.has(i)).length;
    for (const i of [...sel.targets, ...sel.fallback]) {
        if (slots <= 0) break;
        if (held.has(i)) continue;
        const qty = Math.floor(Math.min(tv, freeCash / slots) / buyPx(i));
        if (!(qty >= 1) || buyPx(i) > tv) continue;
        add('BUY', i, qty);
        freeCash -= qty * buyPx(i);
        slots--;
    }
    for (const i of sel.targets) {
        const q = held.get(i);
        if (!q || q * price(i) >= 0.5 * tv) continue;
        const qty = Math.floor(Math.min(tv - q * price(i), freeCash) / buyPx(i));
        if (qty < 1) continue;
        add('BUY (top-up)', i, qty);
        freeCash -= qty * buyPx(i);
    }
    console.log(`\nTarget (${sel.targets.length}): ${sel.targets.map(i => `${panel.symbols[i]}#${rankAgainst(snap, i)}`).join(', ')}`);
    console.log('\nOrders for the next open (AMO, market or limit near last close):');
    console.table(orders.map(o => ({ ...o, approxPrice: o.approxPrice.toFixed(2), approxValue: Math.round(o.approxValue) })));
    console.log(`Cash left after orders ≈ ₹${Math.round(freeCash).toLocaleString('en-IN')}. Update holdings.json with the actual fills.`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
