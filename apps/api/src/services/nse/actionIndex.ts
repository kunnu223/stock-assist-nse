/**
 * Loads every cached `Bc` file into one de-duplicated index:
 * canonical symbol → ex-date → { actions, purposes }.
 * The same event appears in many daily files (rolling window) and under EQ and BE series.
 *
 * @module @stock-assist/api/services/nse/actionIndex
 */

import { cachedCorporateActionDays, readCachedCorporateActions } from './archive';
import { classifyPurpose, parseBcCsv, type ParsedAction } from './corporateActions';

export type CorporateActionIndex = Map<string, Map<string, { actions: ParsedAction[]; purposes: string[] }>>;

const SERIES = new Set(['EQ', 'BE', 'BZ']);

export function buildActionIndex(canonical: (symbol: string, date: string) => string): CorporateActionIndex {
    const index: CorporateActionIndex = new Map();
    for (const day of cachedCorporateActionDays()) {
        for (const row of parseBcCsv(readCachedCorporateActions(day))) {
            if (!SERIES.has(row.series)) continue;
            const actions = classifyPurpose(row.purpose);
            if (actions.length === 0) continue;
            const symbol = canonical(row.symbol, row.exDate);
            let byDate = index.get(symbol);
            if (!byDate) { byDate = new Map(); index.set(symbol, byDate); }
            const entry = byDate.get(row.exDate) ?? { actions: [], purposes: [] };
            const purpose = row.purpose.toUpperCase().replace(/\s+/g, ' ').trim();
            if (!entry.purposes.includes(purpose)) {
                entry.purposes.push(purpose);
                for (const a of actions) {
                    const dup = entry.actions.some(b => b.kind === a.kind && Math.abs((b.factor ?? 0) - (a.factor ?? 0)) < 1e-9);
                    if (!dup) entry.actions.push(a);
                }
            }
            byDate.set(row.exDate, entry);
        }
    }
    return index;
}
