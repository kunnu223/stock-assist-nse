/**
 * Performance metrics from a daily equity curve.
 *
 * @module @stock-assist/api/services/momentum/metrics
 */

export interface Metrics {
    start: string;
    end: string;
    years: number;
    startValue: number;
    endValue: number;
    cagr: number;
    vol: number;
    /** Annualised mean daily excess return over cash ÷ annualised volatility */
    sharpe: number;
    maxDrawdown: number;
    maxDrawdownPeak: string;
    maxDrawdownTrough: string;
    worstMonth: number;
    worstYear: number;
    bestYear: number;
    /** Calendar-year returns (first/last years are partial) */
    yearly: Record<string, number>;
    /** Month-end to month-end returns */
    monthly: Array<{ month: string; ret: number }>;
}

export function computeMetrics(dates: string[], equity: number[], rfDaily?: ArrayLike<number>): Metrics {
    const n = equity.length;
    const years = (Date.parse(dates[n - 1]) - Date.parse(dates[0])) / (365.25 * 86_400_000);
    const cagr = years > 0 ? (equity[n - 1] / equity[0]) ** (1 / years) - 1 : 0;

    let sum = 0, sumSq = 0, ex = 0;
    for (let k = 1; k < n; k++) {
        const r = equity[k] / equity[k - 1] - 1;
        sum += r; sumSq += r * r;
        ex += r - (rfDaily ? rfDaily[k] : 0);
    }
    const m = n - 1;
    const sd = m > 1 ? Math.sqrt((sumSq - (sum * sum) / m) / (m - 1)) : 0;
    const vol = sd * Math.sqrt(252);
    const sharpe = sd > 0 ? (ex / m) * 252 / vol : 0;

    let peak = equity[0], peakDate = dates[0], maxDrawdown = 0, ddPeak = dates[0], ddTrough = dates[0];
    for (let k = 0; k < n; k++) {
        if (equity[k] > peak) { peak = equity[k]; peakDate = dates[k]; }
        const dd = equity[k] / peak - 1;
        if (dd < maxDrawdown) { maxDrawdown = dd; ddPeak = peakDate; ddTrough = dates[k]; }
    }

    const monthly: Metrics['monthly'] = [];
    const yearly: Record<string, number> = {};
    let monthBase = equity[0], yearBase = equity[0];
    for (let k = 0; k < n; k++) {
        const lastOfMonth = k === n - 1 || dates[k + 1].slice(0, 7) !== dates[k].slice(0, 7);
        const lastOfYear = k === n - 1 || dates[k + 1].slice(0, 4) !== dates[k].slice(0, 4);
        if (lastOfMonth && k > 0) { monthly.push({ month: dates[k].slice(0, 7), ret: equity[k] / monthBase - 1 }); monthBase = equity[k]; }
        if (lastOfYear && k > 0) { yearly[dates[k].slice(0, 4)] = equity[k] / yearBase - 1; yearBase = equity[k]; }
    }
    const yearVals = Object.values(yearly);
    return {
        start: dates[0], end: dates[n - 1], years,
        startValue: equity[0], endValue: equity[n - 1],
        cagr, vol, sharpe,
        maxDrawdown, maxDrawdownPeak: ddPeak, maxDrawdownTrough: ddTrough,
        worstMonth: Math.min(0, ...monthly.map(x => x.ret)),
        worstYear: yearVals.length ? Math.min(...yearVals) : 0,
        bestYear: yearVals.length ? Math.max(...yearVals) : 0,
        yearly, monthly,
    };
}
