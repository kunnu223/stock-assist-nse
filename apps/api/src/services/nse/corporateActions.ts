/**
 * Corporate actions from NSE `Bc` files → price adjustment factors.
 *
 * A factor f multiplies every price BEFORE the ex-date so the series is continuous:
 * - split FV a → b:          f = b / a      (e.g. 10 → 2 gives 0.2)
 * - bonus x:y (x new per y): f = y / (x+y)  (1:1 gives 0.5)
 * - consolidation a → b:     f = b / a > 1
 * - demerger / rights / capital reduction / scheme: 'gap' — factor is taken from the ex-date overnight gap.
 * Dividends are ignored (all returns in this project are price returns).
 *
 * @module @stock-assist/api/services/nse/corporateActions
 */

export type ActionKind = 'split' | 'bonus' | 'consolidation' | 'gap';

export interface ParsedAction { kind: ActionKind; factor?: number }

export interface BcRow { series: string; symbol: string; exDate: string; purpose: string }

/** Accepts dd/mm/yyyy, yyyy-mm-dd, dd-mm-yyyy and dd-MMM-yyyy. Returns '' if blank/unparseable. */
export function parseBcDate(s: string): string {
    const t = s.trim();
    let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(t);
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(t);
    if (m) {
        const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(m[2].toUpperCase());
        if (mon >= 0) return `${m[3]}-${String(mon + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    return '';
}

const isDateOrBlank = (s: string | undefined) => s !== undefined && (s.trim() === '' || parseBcDate(s) !== '');

/**
 * SERIES,SYMBOL,SECURITY,RECORD_DT,BC_STRT_DT,BC_END_DT,EX_DT,ND_STRT_DT,ND_END_DT,PURPOSE
 * SECURITY and PURPOSE may contain commas, so the six date columns are located by shape.
 */
export function parseBcCsv(text: string): BcRow[] {
    const rows: BcRow[] = [];
    for (const line of text.split(/\r?\n/).slice(1)) {
        const f = line.split(',');
        if (f.length < 10) continue;
        let j = 3;
        while (j + 6 < f.length && !f.slice(j, j + 6).every(isDateOrBlank)) j++;
        if (j + 6 >= f.length) continue;
        const exDate = parseBcDate(f[j + 3] ?? '');
        const purpose = f.slice(j + 6).join(',').trim();
        if (exDate && purpose) rows.push({ series: f[0].trim(), symbol: f[1].trim(), exDate, purpose });
    }
    return rows;
}

const NUM = String.raw`(\d+(?:\.\d+)?)`;
const CURRENCY = String.raw`(?:RS|RE|INR)?\.?\s*`;
/** "RS 10/- PER SHARE TO RS 2/-", "RS.10 TO RS.2", "10 TO 1", "2503.61TO250.361" */
const FV_CHANGE = new RegExp(`${CURRENCY}${NUM}\\s*(?:\\/-)?\\s*(?:PER\\s*SHARE\\s*)?(?:EACH\\s*)?TO\\s*${CURRENCY}${NUM}`);
/** Bonus in something other than ordinary shares (debentures, preference shares, DVRs): value leaves the share price */
const NON_EQUITY_BONUS = /DEB|NCRPS|PREF|NCD|DVR|WARRANT/;
const GAP_WORDS = /DEMERG|ARRANGE|SCH(?:EME)?\s*(?:OF\s*)?(?:AGMT|ARR)|RIGHT|REDUCTION|REDN|SPIN\s*OFF|AMALG|RETURN\s*OF\s*CAPITAL/;

/**
 * Classify one PURPOSE string. Several actions can share one purpose (e.g. bonus + split).
 * A split/bonus whose ratio was cut off (older files truncate PURPOSE to ~25 chars) is returned
 * without a factor; the adjuster then snaps the observed ex-date gap to a standard ratio.
 */
export function classifyPurpose(purpose: string): ParsedAction[] {
    const p = purpose.toUpperCase().replace(/\s+/g, ' ').trim();
    const out: ParsedAction[] = [];

    if (/BON(?:US|S)?(?![A-Z])|BONS?\d/.test(p)) {
        if (NON_EQUITY_BONUS.test(p)) out.push({ kind: 'gap' });
        else {
            // "BONUS 1:1", "BONUS- 1:2", "BON 1:1", "BON1:1", "BONS1:1"
            const ratios = [...p.matchAll(/BON(?:US|S)?[^0-9A-Z]{0,8}(\d+)\s*:\s*(\d+)/g)];
            for (const m of ratios) {
                const x = Number(m[1]), y = Number(m[2]);
                if (x > 0 && y > 0) out.push({ kind: 'bonus', factor: y / (x + y) });
            }
            if (ratios.length === 0) out.push({ kind: 'bonus' });
        }
    }

    if (/SPLI?T|SPLT|SUB-?\s?DIVISION/.test(p)) {
        const m = FV_CHANGE.exec(p.slice(p.search(/SPLI?T|SPLT|SUB-?\s?DIVISION/)));
        const a = m ? Number(m[1]) : NaN, b = m ? Number(m[2]) : NaN;
        if (a > 0 && b > 0 && b < a) out.push({ kind: 'split', factor: b / a });
        else out.push({ kind: 'split' });
    } else if (/CONSOLIDATION/.test(p)) {
        const m = FV_CHANGE.exec(p);
        const a = m ? Number(m[1]) : NaN, b = m ? Number(m[2]) : NaN;
        out.push(a > 0 && b > a ? { kind: 'consolidation', factor: b / a } : { kind: 'gap' });
    }

    if (out.length === 0 && GAP_WORDS.test(p)) out.push({ kind: 'gap' });
    return out;
}

/** Common split/bonus price ratios, used by the gap heuristic when no `Bc` record exists. */
export const STANDARD_RATIOS = [1 / 2, 1 / 3, 2 / 3, 1 / 4, 3 / 4, 2 / 5, 1 / 5, 1 / 10];

/** The standard ratio within `tol` (log distance) of an observed price ratio, if any. */
export function nearestStandardRatio(observed: number, tol = Math.log(1.04)): number | null {
    let best: number | null = null;
    let bestDist = Infinity;
    for (const r of STANDARD_RATIOS) {
        const d = Math.abs(Math.log(observed / r));
        if (d < bestDist) { bestDist = d; best = r; }
    }
    return bestDist <= tol ? best : null;
}
