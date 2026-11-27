/**
 * CLI backtest runner — runs the walk-forward engine without the API server or MongoDB.
 * Prints net-of-cost results, the random-entry baseline, and a per-year split.
 *
 * Usage (from apps/api):
 *   npx tsx scripts/runBacktest.ts --strategy momentum [--start 2022-08-01] [--end 2026-06-30]
 *       [--symbols 100] [--exit trailing|target] [--hold 63] [--trail 3] [--costs on|off]
 *       [--runs 100] [--out /tmp/bt.json]
 */

import { NIFTY_100 } from '@stock-assist/shared';
import { runWalkForwardBacktestDetailed, type BacktestConfig, type BacktestStrategy } from '../src/services/backtest/walkForwardEngine';
import { generateReport } from '../src/services/backtest/backtestReporter';
import { runRandomBaseline } from '../src/services/backtest/randomBaseline';
import type { ExitMode } from '../src/services/backtest/tradeSimulator';
import { writeFileSync } from 'fs';

function arg(name: string): string | undefined {
    const i = process.argv.indexOf(`--${name}`);
    return i !== -1 ? process.argv[i + 1] : undefined;
}
const num = (name: string) => (arg(name) !== undefined ? Number(arg(name)) : undefined);

async function main() {
    const strategy = (arg('strategy') ?? 'momentum') as BacktestStrategy;
    const config: BacktestConfig = {
        startDate: arg('start') ?? '2022-08-01',
        endDate: arg('end') ?? '2026-06-30',
        symbols: NIFTY_100.slice(0, num('symbols') ?? NIFTY_100.length),
        minConfidence: 65,
        signalExpiry: 7,
        partialTargetR: 1.5,
        fullTargetR: 2.5,
        strategy,
        exitMode: arg('exit') as ExitMode | undefined,
        maxHoldDays: num('hold'),
        trailAtrMult: num('trail'),
        applyCosts: arg('costs') !== 'off',
    };

    const t0 = Date.now();
    const { signals, dailyHistories, exitConfig } = await runWalkForwardBacktestDetailed(config);
    const report = generateReport(signals);
    const baseline = runRandomBaseline(signals, dailyHistories, exitConfig, { runs: num('runs') ?? 100 });

    const byYear: Record<string, { trades: number; avgNetPnl: number }> = {};
    for (const s of signals) {
        const y = s.date.slice(0, 4);
        byYear[y] ??= { trades: 0, avgNetPnl: 0 };
        byYear[y].trades++;
        byYear[y].avgNetPnl += s.pnlPercent;
    }
    for (const y of Object.keys(byYear)) byYear[y].avgNetPnl = Number((byYear[y].avgNetPnl / byYear[y].trades).toFixed(2));

    const summary = {
        strategy,
        period: `${config.startDate} → ${config.endDate}`,
        symbols: config.symbols.length,
        exit: exitConfig,
        trades: report.totalSignals,
        profitableTradesPct: report.winRate,
        grossAvgPnlPercent: report.grossAvgPnlPercent,
        netAvgPnlPercent: report.avgPnlPercent,
        profitFactorNet: report.profitFactor,
        outcomes: report.outcomes,
        avgDaysHeld: report.avgDaysToOutcome,
        byYear,
        randomBaseline: baseline,
        seconds: Math.round((Date.now() - t0) / 1000),
    };
    console.log('\n===== BACKTEST SUMMARY =====');
    console.log(JSON.stringify(summary, null, 2));

    const out = arg('out');
    if (out) writeFileSync(out, JSON.stringify({ summary, report, signals }, null, 2));
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
