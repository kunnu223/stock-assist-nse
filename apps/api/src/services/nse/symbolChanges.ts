/**
 * NSE symbol renames (symbolchange.csv) → one continuous identity per company.
 *
 * Rows look like `COMPANY NAME,OLD,NEW,30-OCT-2019` (the name may contain commas, so fields are
 * read from the right). A row for OLD dated before the change belongs to the company now called NEW.
 * Symbols can be reused later by a different company, so mapping is date-aware.
 *
 * @module @stock-assist/api/services/nse/symbolChanges
 */

import { parseBcDate } from './corporateActions';

export interface Rename { oldSymbol: string; newSymbol: string; date: string }

export function parseSymbolChanges(text: string): Rename[] {
    const out: Rename[] = [];
    for (const line of text.split(/\r?\n/)) {
        const f = line.split(',').map(s => s.trim());
        if (f.length < 3) continue;
        const date = parseBcDate(f[f.length - 1]);
        const newSymbol = f[f.length - 2];
        const oldSymbol = f[f.length - 3];
        if (date && oldSymbol && newSymbol && oldSymbol !== newSymbol) out.push({ oldSymbol, newSymbol, date });
    }
    return out;
}

/** Returns `canonical(symbol, date)`: the latest symbol of the company that traded as `symbol` on `date`. */
export function makeCanonicalizer(renames: Rename[]): (symbol: string, date: string) => string {
    const byOld = new Map<string, Rename[]>();
    for (const r of renames) {
        const list = byOld.get(r.oldSymbol) ?? [];
        list.push(r);
        byOld.set(r.oldSymbol, list);
    }
    for (const list of byOld.values()) list.sort((a, b) => a.date.localeCompare(b.date));

    const memo = new Map<string, string>();
    return (symbol: string, date: string) => {
        const list = byOld.get(symbol);
        if (!list) return symbol;
        const key = `${symbol}|${date}`;
        const hit = memo.get(key);
        if (hit) return hit;
        let cur = symbol;
        let at = date;
        let strict = true; // the row itself must predate the first change; later hops may share its date
        for (let hop = 0; hop < 20; hop++) {
            const next = byOld.get(cur)?.find(r => (strict ? r.date > at : r.date >= at));
            if (!next) break;
            cur = next.newSymbol;
            at = next.date;
            strict = false;
        }
        memo.set(key, cur);
        return cur;
    };
}
