/**
 * Momentum backtest CLI (spec: docs/momentum-system-implementation.md).
 *
 * Usage (from apps/api, after scripts/nseSync.ts):
 *   npx tsx scripts/momentumBacktest.ts data        # data-quality report
 *   npx tsx scripts/momentumBacktest.ts design      # 36-variant grid on the design period → chosen variant (frozen)
 *   npx tsx scripts/momentumBacktest.ts holdout     # chosen variant on the holdout, baselines, 500 random portfolios, verdict
 *   npx tsx scripts/momentumBacktest.ts posthoc     # whole grid on the holdout (information only)
 *   npx tsx scripts/momentumBacktest.ts sensitivity # chosen variant: 2× slippage, ₹1 lakh capital, post-2020 sub-period
 *   npx tsx scripts/momentumBacktest.ts validate    # V3: correlation with the official Nifty200 Momentum 30 index
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { loadMarket } from '../src/services/momentum/pipeline';
import { simulate, type SimConfig } from '../src/services/momentum/simulate';
import { summarize, baselines, type RunSummary } from '../src/services/momentum/report';
import { computeMetrics } from '../src/services/momentum/metrics';
import { alignSeries } from '../src/services/momentum/context';
import { loadIndex } from '../src/services/nse/indices';
import { fetchHistory } from '../src/services/data/yahooHistory';
import type { Context } from '../src/services/momentum/context';

const RESULTS = path.resolve(__dirname, '../../../docs/results');
const DESIGN_END = '2017-12-31';
const HOLDOUT_START = '2018-01-01';
const LIVE_ERA_START = '2020-09-01';
const CAPITAL = 500_000;
const RANDOM_RUNS = 500;
const GRID: Array<Pick<SimConfig, 'K' | 'N' | 'R' | 'filter'>> = [];
for (const K of [200, 500]) for (const N of [10, 20, 30]) for (const R of [1, 3, 6] as const) for (const filter of [false, true]) GRID.push({ K, N, R, filter });

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const lakh = (x: number) => `₹${(x / 1e5).toFixed(1)}L`;
const label = (c: Pick<SimConfig, 'K' | 'N' | 'R' | 'filter'>) => `K${c.K} N${c.N} R${c.R} ${c.filter ? 'trend' : 'always'}`;
const save = (name: string, data: unknown) => {
    mkdirSync(RESULTS, { recursive: true });
    writeFileSync(path.join(RESULTS, name), JSON.stringify(data, null, 2));
    console.log(`→ docs/results/${name}`);
};
const row = (s: RunSummary) => ({
    variant: label(s.config), cagr: pct(s.metrics.cagr), afterTax: pct(s.afterTaxCagr), sharpe: s.metrics.sharpe.toFixed(2),
    maxDD: pct(s.metrics.maxDrawdown), costs: `${s.costPctPerYear.toFixed(2)}%/yr`, turnover: `${s.turnoverPerYear.toFixed(1)}x`,
    end: lakh(s.metrics.endValue),
});

function runGrid(ctx: Context, start: string, end: string): RunSummary[] {
    return GRID.map(g => {
        const cfg: SimConfig = { ...g, start, end, capital: CAPITAL };
        return summarize(ctx, cfg, simulate(ctx, cfg));
    });
}

function chosenConfig(): SimConfig {
    const file = path.join(RESULTS, 'momentum-design.json');
    if (!existsSync(file)) throw new Error('Run the design step first');
    return JSON.parse(readFileSync(file, 'utf8')).chosen as SimConfig;
}

function randomTest(ctx: Context, cfg: SimConfig, strategyCagr: number) {
    const cagrs: number[] = [];
    for (let seed = 1; seed <= RANDOM_RUNS; seed++) {
        const res = simulate(ctx, { ...cfg, randomSeed: seed });
        cagrs.push(computeMetrics(res.dates, res.equity).cagr);
    }
    cagrs.sort((a, b) => a - b);
    const beatOrEqual = cagrs.filter(c => c >= strategyCagr).length;
    return {
        runs: RANDOM_RUNS,
        p: (1 + beatOrEqual) / (1 + RANDOM_RUNS),
        medianCagr: cagrs[RANDOM_RUNS >> 1],
        p5Cagr: cagrs[Math.floor(RANDOM_RUNS * 0.05)],
        p95Cagr: cagrs[Math.floor(RANDOM_RUNS * 0.95)],
    };
}

async function main() {
    const cmd = process.argv[2];
    const t0 = Date.now();
    if (cmd === 'data') {
        const { quality } = loadMarket();
        console.log(JSON.stringify(quality, null, 2));
        save('data-quality.json', quality);
    } else if (cmd === 'design') {
        const { ctx, quality } = loadMarket({ end: DESIGN_END });
        const full = JSON.parse(readFileSync(path.join(RESULTS, 'data-quality.json'), 'utf8'));
        const h = full.heuristicVsBc;
        const designStart = h.recall >= 0.95 && h.precision >= 0.95 ? '2006-01-01' : '2011-01-01';
        console.log(`Heuristic recall ${pct(h.recall)} precision ${pct(h.precision)} → design period ${designStart} → ${DESIGN_END} (data to ${quality.lastDate})`);
        const rows = runGrid(ctx, designStart, DESIGN_END);
        const ranked = [...rows].sort((a, b) => b.metrics.sharpe - a.metrics.sharpe || a.trades - b.trades);
        console.table(ranked.map(row));
        const chosen = { ...ranked[0].config };
        console.log(`Chosen (highest design Sharpe): ${label(chosen)}`);
        save('momentum-design.json', { frozenAt: new Date().toISOString(), designStart, designEnd: DESIGN_END, chosen, rows: ranked.map(row) });
    } else if (cmd === 'holdout') {
        const { ctx, quality } = loadMarket();
        const cfg: SimConfig = { ...chosenConfig(), start: HOLDOUT_START, end: quality.lastDate };
        const res = simulate(ctx, cfg);
        const s = summarize(ctx, cfg, res);
        const base = baselines(ctx, cfg, res);
        const random = randomTest(ctx, cfg, s.metrics.cagr);
        const idx = base[0];
        const pass = {
            P1_beatsNifty500: s.metrics.cagr > idx.cagr,
            P2_beatsRandom_p_lt_0_05: random.p < 0.05,
            P3_afterTaxBeatsNifty500: s.afterTaxCagr > (idx.afterTaxCagr ?? -Infinity),
        };
        const verdict = Object.values(pass).every(Boolean) ? 'PASS' : 'NOT PROVEN';
        console.table([row(s)]);
        console.table(base.map(b => ({ baseline: b.name, cagr: pct(b.cagr), afterTax: b.afterTaxCagr !== undefined ? pct(b.afterTaxCagr) : '-', sharpe: b.sharpe.toFixed(2), maxDD: pct(b.maxDrawdown), end: lakh(b.endValue) })));
        console.log('Random portfolios:', { ...random, medianCagr: pct(random.medianCagr), p5Cagr: pct(random.p5Cagr), p95Cagr: pct(random.p95Cagr) });
        console.log('Yearly:', Object.fromEntries(Object.entries(s.metrics.yearly).map(([y, r]) => [y, pct(r)])));
        console.log(pass, `→ ${verdict}`);
        save('momentum-holdout.json', { verdict, pass, summary: s, baselines: base, random, dataLastDate: quality.lastDate });
    } else if (cmd === 'posthoc') {
        const { ctx, quality } = loadMarket();
        const rows = runGrid(ctx, HOLDOUT_START, quality.lastDate).sort((a, b) => b.metrics.sharpe - a.metrics.sharpe);
        console.table(rows.map(row));
        save('momentum-posthoc.json', { note: 'Post-hoc view of every variant on the holdout. Not used to choose.', rows: rows.map(row) });
    } else if (cmd === 'sensitivity') {
        const { ctx, quality } = loadMarket();
        const base: SimConfig = { ...chosenConfig(), start: HOLDOUT_START, end: quality.lastDate };
        const cases: Array<[string, SimConfig]> = [
            ['holdout as chosen', base],
            ['2x slippage', { ...base, slippageMult: 2 }],
            ['Rs 1 lakh capital', { ...base, capital: 100_000 }],
            [`live NSE era (${LIVE_ERA_START} on)`, { ...base, start: LIVE_ERA_START }],
        ];
        const rows = cases.map(([name, cfg]) => {
            const res = simulate(ctx, cfg);
            const s = summarize(ctx, cfg, res);
            const b = baselines(ctx, cfg, res)[0];
            return { case: name, ...row(s), nifty500: pct(b.cagr), niftyAfterTax: pct(b.afterTaxCagr ?? 0) };
        });
        console.table(rows);
        save('momentum-sensitivity.json', rows);
    } else if (cmd === 'validate') {
        const { ctx, quality, panel } = loadMarket();
        // V1: our split-adjusted closes vs Yahoo's split-adjusted closes (10 years, 10 large caps)
        const v1 = [];
        for (const sym of ['RELIANCE', 'HDFCBANK', 'INFY', 'TCS', 'ITC', 'LT', 'SBIN', 'BHARTIARTL', 'HINDUNILVR', 'AXISBANK']) {
            const y = await fetchHistory(sym, '10y', '1d');
            const i = panel.index.get(sym);
            if (!y.length || i === undefined) { v1.push({ sym, error: 'missing' }); continue; }
            const first = y.find(b => panel.dates.includes(b.date))!, last = [...y].reverse().find(b => panel.dates.includes(b.date))!;
            const [d0, d1] = [panel.dates.indexOf(first.date), panel.dates.indexOf(last.date)];
            const years = (Date.parse(last.date) - Date.parse(first.date)) / (365.25 * 86_400_000);
            const ours = (panel.adj[i][d1] / panel.adj[i][d0]) ** (1 / years) - 1;
            const yahoo = (last.close / first.close) ** (1 / years) - 1;
            v1.push({ sym, from: first.date, to: last.date, ours: pct(ours), yahoo: pct(yahoo), gapPctPts: Number(((ours - yahoo) * 100).toFixed(2)) });
        }
        console.table(v1);
        // V3: correlation with the official Nifty200 Momentum 30 price index
        const cfg: SimConfig = { K: 200, N: 30, R: 6, filter: false, start: '2011-01-01', end: quality.lastDate, capital: 1e7 };
        const res = simulate(ctx, cfg);
        const official = alignSeries(res.dates, loadIndex('NIFTY200 MOMENTUM 30'));
        const ours = computeMetrics(res.dates, res.equity).monthly.map(x => x.ret);
        const theirs = computeMetrics(res.dates, Array.from(official)).monthly.map(x => x.ret);
        const corr = correlation(ours, theirs);
        const o = computeMetrics(res.dates, Array.from(official));
        const m = computeMetrics(res.dates, res.equity);
        const out = { v1, months: ours.length, monthlyCorrelation: Number(corr.toFixed(3)), oursCagr: pct(m.cagr), officialPriceIndexCagr: pct(o.cagr), oursMaxDD: pct(m.maxDrawdown), officialMaxDD: pct(o.maxDrawdown) };
        console.log(out);
        save('momentum-validate.json', out);
    } else {
        console.log('Commands: data | design | holdout | posthoc | sensitivity | validate');
        process.exitCode = 1;
    }
    console.log(`(${Math.round((Date.now() - t0) / 1000)}s)`);
}

function correlation(a: number[], b: number[]): number {
    const n = Math.min(a.length, b.length);
    const ma = a.slice(0, n).reduce((x, y) => x + y, 0) / n, mb = b.slice(0, n).reduce((x, y) => x + y, 0) / n;
    let sab = 0, saa = 0, sbb = 0;
    for (let k = 0; k < n; k++) { sab += (a[k] - ma) * (b[k] - mb); saa += (a[k] - ma) ** 2; sbb += (b[k] - mb) ** 2; }
    return sab / Math.sqrt(saa * sbb);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
