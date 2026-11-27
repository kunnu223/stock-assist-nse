import type { Panel } from '../../nse/panel';
import type { PriceEvent } from '../../nse/adjust';
import { computeAdjusted } from '../../nse/adjust';

/** Business days starting 2015-01-01 (weekends skipped). */
export function businessDays(n: number, start = '2015-01-01'): string[] {
    const out: string[] = [];
    for (let t = Date.parse(`${start}T00:00:00Z`); out.length < n; t += 86_400_000) {
        const d = new Date(t);
        if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) out.push(d.toISOString().slice(0, 10));
    }
    return out;
}

/**
 * Synthetic panel: symbol k follows exp(drift·t/252 + wiggle) with a little deterministic noise,
 * constant traded value (₹50 crore/day), EQ series every day.
 */
export function syntheticPanel(drifts: Record<string, number>, days: number, events: Record<string, PriceEvent[]> = {}): Panel {
    const dates = businessDays(days);
    const symbols = Object.keys(drifts);
    const D = dates.length;
    const panel: Panel = {
        dates, symbols, index: new Map(symbols.map((s, i) => [s, i])),
        open: [], close: [], adj: [], value: [], volume: [], series: [], locked: [], events: [],
        isCompanyShare: symbols.map(() => true),
    };
    symbols.forEach((s, i) => {
        const close = new Float32Array(D), open = new Float32Array(D);
        const evs = [...(events[s] ?? [])].sort((a, b) => a.day - b.day);
        for (let t = 0; t < D; t++) {
            const wiggle = 0.01 * Math.sin(t * (0.7 + i * 0.13));
            // Raw prices: divide by the product of factors of events on or before t (after an ex-date the raw price drops)
            const raw = evs.filter(e => e.day <= t).reduce((p, e) => p * e.factor, 1);
            close[t] = 100 * Math.exp((drifts[s] * t) / 252 + wiggle) * raw;
            open[t] = close[t];
        }
        panel.close.push(close);
        panel.open.push(open);
        panel.adj.push(new Float32Array(D));
        panel.value.push(new Float32Array(D).fill(5e8));
        panel.volume.push(new Float32Array(D).fill(1e6));
        panel.series.push(new Uint8Array(D).fill(1));
        panel.locked.push(new Uint8Array(D));
        panel.events.push(evs);
        computeAdjusted(panel, i);
    });
    return panel;
}
