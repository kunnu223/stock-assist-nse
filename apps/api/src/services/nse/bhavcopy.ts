/**
 * NSE cash-market bhavcopy parsing (old format and UDiFF format).
 *
 * Old (to 2024-07-05): SYMBOL,SERIES,OPEN,HIGH,LOW,CLOSE,LAST,PREVCLOSE,TOTTRDQTY,TOTTRDVAL,...
 * UDiFF (from 2024-07-08): TradDt,...,TckrSymb,SctySrs,...,OpnPric,HghPric,LwPric,ClsPric,...,TtlTradgVol,TtlTrfVal,...
 *
 * Prices are raw (not adjusted for splits/bonuses). Only series EQ, BE and BZ are kept.
 *
 * @module @stock-assist/api/services/nse/bhavcopy
 */

export type Series = 'EQ' | 'BE' | 'BZ';
export const KEPT_SERIES: readonly Series[] = ['EQ', 'BE', 'BZ'];

export interface BhavRow {
    symbol: string;
    series: Series;
    open: number;
    high: number;
    low: number;
    close: number;
    /** Shares traded */
    volume: number;
    /** Traded value in rupees */
    value: number;
    /** ISIN when the file has one (from ~2010). INE… = company shares, INF… = fund units (ETFs) */
    isin?: string;
}

const COLS = {
    old: { symbol: 'SYMBOL', series: 'SERIES', open: 'OPEN', high: 'HIGH', low: 'LOW', close: 'CLOSE', volume: 'TOTTRDQTY', value: 'TOTTRDVAL' },
    udiff: { symbol: 'TckrSymb', series: 'SctySrs', open: 'OpnPric', high: 'HghPric', low: 'LwPric', close: 'ClsPric', volume: 'TtlTradgVol', value: 'TtlTrfVal' },
} as const;

/** UDiFF column holding the free-text instrument name (the only field that could contain commas). */
const UDIFF_NAME_COL = 'FinInstrmNm';

export function parseBhavcopy(text: string): BhavRow[] {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length === 0) return [];
    const header = lines[0].split(',').map(h => h.trim());
    const cols = header.includes('TckrSymb') ? COLS.udiff : COLS.old;
    const idx = Object.fromEntries(Object.entries(cols).map(([k, name]) => [k, header.indexOf(name)])) as Record<keyof typeof cols, number>;
    if (Object.values(idx).some(i => i < 0)) throw new Error(`Unrecognised bhavcopy header: ${lines[0].slice(0, 120)}`);
    const nameCol = header.indexOf(UDIFF_NAME_COL);
    const isinCol = header.indexOf('ISIN');
    const width = header[header.length - 1] === '' ? header.length - 1 : header.length;

    const rows: BhavRow[] = [];
    for (let i = 1; i < lines.length; i++) {
        let f = lines[i].split(',');
        // Re-join a name that contained commas so later columns line up
        if (nameCol >= 0 && f.length > header.length) {
            const extra = f.length - header.length;
            f = [...f.slice(0, nameCol), f.slice(nameCol, nameCol + extra + 1).join(','), ...f.slice(nameCol + extra + 1)];
        }
        if (f.length < width) continue;
        const series = f[idx.series].trim() as Series;
        if (!KEPT_SERIES.includes(series)) continue;
        const row: BhavRow = {
            symbol: f[idx.symbol].trim(),
            series,
            open: Number(f[idx.open]),
            high: Number(f[idx.high]),
            low: Number(f[idx.low]),
            close: Number(f[idx.close]),
            volume: Number(f[idx.volume]),
            value: Number(f[idx.value]),
        };
        if (isinCol >= 0 && f[isinCol]?.trim()) row.isin = f[isinCol].trim();
        if (row.symbol && row.close > 0 && Number.isFinite(row.close)) rows.push(row);
    }
    return rows;
}

const COMPACT_HEADER = 'symbol,series,open,high,low,close,volume,value,isin';

export function toCompactCsv(rows: BhavRow[]): string {
    const body = rows.map(r => [r.symbol, r.series, r.open, r.high, r.low, r.close, r.volume, Math.round(r.value), r.isin ?? ''].join(','));
    return [COMPACT_HEADER, ...body].join('\n');
}

export function fromCompactCsv(text: string): BhavRow[] {
    const lines = text.split('\n');
    const rows: BhavRow[] = [];
    for (let i = 1; i < lines.length; i++) {
        const f = lines[i].split(',');
        if (f.length < 8) continue;
        const row: BhavRow = {
            symbol: f[0], series: f[1] as Series,
            open: +f[2], high: +f[3], low: +f[4], close: +f[5], volume: +f[6], value: +f[7],
        };
        if (f[8]) row.isin = f[8]; // files cached before ISIN was kept have 8 columns
        rows.push(row);
    }
    return rows;
}
