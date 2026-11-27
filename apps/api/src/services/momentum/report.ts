/**
 * Summaries of a simulation: pre-tax metrics, after-tax result (including tax on liquidating at the end),
 * costs and turnover, plus the three baselines.
 *
 * @module @stock-assist/api/services/momentum/report
 */

import type { Context } from './context';
import { computeMetrics, type Metrics } from './metrics';
import { afterTaxCurve, computeTaxes } from './tax';
import { SELL_RATE, STT } from './charges';
import type { Realized } from './book';
import type { SimConfig, SimResult } from './simulate';
import { buyAndHoldAfterTax, equalWeightUniverseCurve, indexCurve } from './benchmarks';

export interface RunSummary {
    config: SimConfig;
    metrics: Omit<Metrics, 'monthly'>;
    afterTaxEndValue: number;
    afterTaxCagr: number;
    taxPaid: number;
    chargesPaid: number;
    slippagePaid: number;
    /** (charges + slippage) per year as % of average equity */
    costPctPerYear: number;
    /** One-way traded value per year ÷ average equity */
    turnoverPerYear: number;
    trades: number;
    rebalances: number;
    riskOffMonths: number;
    skippedBuys: number;
    disappeared: SimResult['disappeared'];
    lastTargets: string[];
}

const cagrOf = (start: string, end: string, v0: number, v1: number) =>
    (v1 / v0) ** (365.25 * 86_400_000 / (Date.parse(end) - Date.parse(start))) - 1;

export function summarize(ctx: Context, cfg: SimConfig, res: SimResult): RunSummary {
    const { book, dates, equity } = res;
    const endDate = dates[dates.length - 1];
    const lastDay = ctx.panel.dates.indexOf(endDate);
    const liquidation: Realized[] = [];
    for (const [i, lots] of book.lots) {
        const closes = ctx.panel.close[i];
        let k = lastDay;
        while (k > 0 && Number.isNaN(closes[k])) k--;
        const px = Number.isNaN(closes[k]) ? 0 : closes[k];
        for (const lot of lots) {
            const longTerm = Date.parse(endDate) - Date.parse(lot.date) > 365 * 86_400_000;
            liquidation.push({ date: endDate, gain: lot.shares * (px * (1 - SELL_RATE + STT) - lot.costPerShare), longTerm });
        }
    }
    const taxes = computeTaxes([...book.realized, ...liquidation]);
    const post = afterTaxCurve(dates, equity, taxes);
    const metrics = computeMetrics(dates, equity, res.rfDaily);
    const avgEquity = equity.reduce((a, b) => a + b, 0) / equity.length;
    const { monthly: _monthly, ...rest } = metrics;
    return {
        config: cfg,
        metrics: rest,
        afterTaxEndValue: post[post.length - 1],
        afterTaxCagr: cagrOf(dates[0], endDate, equity[0], post[post.length - 1]),
        taxPaid: taxes.reduce((a, t) => a + t.tax, 0),
        chargesPaid: book.chargesPaid,
        slippagePaid: book.slippagePaid,
        costPctPerYear: ((book.chargesPaid + book.slippagePaid) / avgEquity / metrics.years) * 100,
        turnoverPerYear: book.tradedValue / 2 / avgEquity / metrics.years,
        trades: book.trades,
        rebalances: res.rebalances,
        riskOffMonths: res.riskOffMonths,
        skippedBuys: res.skippedBuys,
        disappeared: res.disappeared,
        lastTargets: res.lastTargets,
    };
}

export interface BaselineSummary { name: string; cagr: number; maxDrawdown: number; sharpe: number; endValue: number; afterTaxCagr?: number }

export function baselines(ctx: Context, cfg: SimConfig, res: SimResult): BaselineSummary[] {
    const { dates, rfDaily } = res;
    const idx = indexCurve(ctx, dates, cfg.capital);
    const ew = equalWeightUniverseCurve(ctx, cfg.K, dates, cfg.capital);
    const mi = computeMetrics(dates, idx, rfDaily);
    const me = computeMetrics(dates, ew, rfDaily);
    const idxAfterTax = buyAndHoldAfterTax(dates[0], mi.end, cfg.capital, mi.endValue);
    return [
        { name: 'Nifty 500 (price index, buy & hold)', cagr: mi.cagr, maxDrawdown: mi.maxDrawdown, sharpe: mi.sharpe, endValue: mi.endValue,
          afterTaxCagr: cagrOf(dates[0], mi.end, cfg.capital, idxAfterTax) },
        { name: `Equal-weight top-${cfg.K} universe (gross)`, cagr: me.cagr, maxDrawdown: me.maxDrawdown, sharpe: me.sharpe, endValue: me.endValue },
    ];
}
