import { describe, it, expect } from 'vitest';
import { parseBhavcopy, toCompactCsv, fromCompactCsv } from '../bhavcopy';
import { classifyPurpose, parseBcCsv, parseBcDate, nearestStandardRatio } from '../corporateActions';
import { parseSymbolChanges, makeCanonicalizer } from '../symbolChanges';

const OLD = [
    'SYMBOL,SERIES,OPEN,HIGH,LOW,CLOSE,LAST,PREVCLOSE,TOTTRDQTY,TOTTRDVAL,TIMESTAMP,TOTALTRADES,ISIN,',
    'HDFCBANK,EQ,1099.9,1107.05,1084,1101.05,1100.05,2187.75,5311655,5809819672.1,19-SEP-2019,172428,INE040A01026,',
    'HDFCBANK,BL,1100,1100,1100,1100,1100,2187.75,10,11000,19-SEP-2019,1,INE040A01026,',
    'XYZ,BE,10,10,10,10,10,9.5,100,1000,19-SEP-2019,3,INE000000000,',
].join('\n');

const UDIFF = [
    'TradDt,BizDt,Sgmt,Src,FinInstrmTp,FinInstrmId,ISIN,TckrSymb,SctySrs,XpryDt,FininstrmActlXpryDt,StrkPric,OptnTp,FinInstrmNm,OpnPric,HghPric,LwPric,ClsPric,LastPric,PrvsClsgPric,UndrlygPric,SttlmPric,OpnIntrst,ChngInOpnIntrst,TtlTradgVol,TtlTrfVal,TtlNbOfTxsExctd,SsnId,NewBrdLotQty,Rmks,Rsvd1,Rsvd2,Rsvd3,Rsvd4',
    '2026-09-25,2026-09-25,CM,NSE,STK,2885,INE002A01018,RELIANCE,EQ,,,,,RELIANCE INDUSTRIES LTD,1400.00,1410.50,1390.10,1405.20,1405.00,1398.00,,1405.20,,,1000000,1405200000.00,50000,F1,1,,,,,',
    '2026-09-25,2026-09-25,CM,NSE,STK,1,INE000A01000,ACME,EQ,,,,,ACME, INC LTD,50.00,51.00,49.00,50.50,50.50,50.00,,50.50,,,2000,101000.00,20,F1,1,,,,,',
].join('\n');

describe('parseBhavcopy', () => {
    it('reads the old format and keeps only EQ/BE/BZ series', () => {
        const rows = parseBhavcopy(OLD);
        expect(rows).toHaveLength(2);
        expect(rows[0]).toMatchObject({ symbol: 'HDFCBANK', series: 'EQ', open: 1099.9, close: 1101.05, volume: 5311655 });
        expect(rows[1].series).toBe('BE');
    });

    it('reads UDiFF, re-joining a name that contains a comma', () => {
        const rows = parseBhavcopy(UDIFF);
        expect(rows).toHaveLength(2);
        expect(rows[0]).toMatchObject({ symbol: 'RELIANCE', series: 'EQ', high: 1410.5, close: 1405.2, value: 1405200000 });
        expect(rows[1]).toMatchObject({ symbol: 'ACME', open: 50, close: 50.5, volume: 2000 });
    });

    it('round-trips through the compact cache format', () => {
        const rows = parseBhavcopy(UDIFF);
        expect(fromCompactCsv(toCompactCsv(rows))).toEqual(rows.map(r => ({ ...r, value: Math.round(r.value) })));
    });
});

describe('classifyPurpose (real NSE strings)', () => {
    const f = (p: string) => classifyPurpose(p);
    it('parses face-value splits in their many spellings', () => {
        expect(f('FV SPLT FRM RS 5 TO RE 1')).toEqual([{ kind: 'split', factor: 0.2 }]);
        expect(f('FVSPLT FRM RS 10 TO RS 5')).toEqual([{ kind: 'split', factor: 0.5 }]);
        expect(f('FV SPLIT RS.10 TO RS.2   ')).toEqual([{ kind: 'split', factor: 0.2 }]);
        expect(f('FACE VALUE SPLIT (SUB-DIVISION) - FROM RS 10/- PER SHARE TO RS 2/- PER SHARE')).toEqual([{ kind: 'split', factor: 0.2 }]);
    });
    it('parses bonuses as y/(x+y)', () => {
        expect(f('BONUS 1:1')).toEqual([{ kind: 'bonus', factor: 0.5 }]);
        expect(f('BONUS 3:2')[0].factor).toBeCloseTo(0.4);
        expect(f('BONUS 1:2')[0].factor).toBeCloseTo(2 / 3);
    });
    it('combines a bonus and a split in one purpose', () => {
        const a = f('BONUS 1:1 AND FV SPLIT FROM RS 10 TO RS 5');
        expect(a.map(x => x.kind)).toEqual(['bonus', 'split']);
        expect(a.reduce((x, y) => x * y.factor!, 1)).toBeCloseTo(0.25);
    });
    it('treats consolidation as a factor above 1', () => {
        expect(f('CONSOLIDATION OF SHARES FROM RS 1 TO RS 10')).toEqual([{ kind: 'consolidation', factor: 10 }]);
        expect(f('CAP REDN/CONSOLIDATION')).toEqual([{ kind: 'gap' }]);
    });
    it('handles spellings seen in the 2010–2026 Bc files', () => {
        expect(f('FV SPLT FRM RS 10 TO 2')).toEqual([{ kind: 'split', factor: 0.2 }]);
        expect(f('AGM/FV SPLT FRM 10 TO 1')).toEqual([{ kind: 'split', factor: 0.1 }]);
        expect(f('FVSPLTFRM100TO1')).toEqual([{ kind: 'split', factor: 0.01 }]);
        expect(f('FV SPLT2503.61TO250.361')[0].factor).toBeCloseTo(0.1);
        expect(f('BONUS- 1:2')[0].factor).toBeCloseTo(2 / 3);
        expect(f('BONUS: 1:4')[0].factor).toBeCloseTo(0.8);
        expect(f('BONUS - 3:1')[0].factor).toBeCloseTo(0.25);
        expect(f('BONUS @ 1:1')).toEqual([{ kind: 'bonus', factor: 0.5 }]);
        expect(f('SPLINTDIV-RS10')).toEqual([]);
        const titan = f('BON1:1/FV SPLT RS10TO RE1');
        expect(titan.map(a => a.kind)).toEqual(['bonus', 'split']);
        expect(titan.reduce((x, a) => x * a.factor!, 1)).toBeCloseTo(0.05);
        expect(f('BON 1:1/SPLIT RS10 TO RE1').reduce((x, a) => x * a.factor!, 1)).toBeCloseTo(0.05);
        expect(f('BONS1:1/FV SPLT RS5TO RE1').reduce((x, a) => x * a.factor!, 1)).toBeCloseTo(0.1);
        expect(f('INTEREST ON BONDS')).toEqual([]);
    });
    it('returns truncated splits/bonuses without a factor', () => {
        expect(f('FV SPLIT FROM RS10 TO RS')).toEqual([{ kind: 'split' }]);
        expect(f('FV SPLT FRM RS 216.75 TO')).toEqual([{ kind: 'split' }]);
        expect(f('AGM/DIV-RS 29.50/BONUS')).toEqual([{ kind: 'bonus' }]);
    });
    it('treats non-equity bonuses, rights, schemes and capital reductions as gap actions', () => {
        for (const p of ['SCH AGMT-BONUS NCRPS 4:1', 'SCH OF AGMT- BONUS DEB1:1', 'BONUS 1 DVR : 10 EQ SHARE',
            'DIV-RE 0.70/RIGHT 26:151', 'SCHEME OF AMALGATION', 'REDUCTION - SHARE CAPITAL', 'RIGHT1:5 @PRM RS 27.50/-']) {
            expect(f(p)).toEqual([{ kind: 'gap' }]);
        }
    });
    it('marks demergers, rights and bonus debentures as gap actions; ignores dividends and meetings', () => {
        expect(f('DEMERGER')).toEqual([{ kind: 'gap' }]);
        expect(f('RIGHTS 1:5 @ PREMIUM RS 40/-')).toEqual([{ kind: 'gap' }]);
        expect(f('BONUS DEBENTURES 1:1')).toEqual([{ kind: 'gap' }]);
        expect(f('AGM/DIV-RS 1 PER SH')).toEqual([]);
        expect(f('INTERIM DIVIDEND - RS 5 PER SHARE')).toEqual([]);
        expect(f('ANNUAL GENERAL MEETING')).toEqual([]);
    });
});

describe('parseBcCsv', () => {
    it('handles both date formats and commas in the security name', () => {
        const text = [
            'SERIES,SYMBOL,SECURITY,RECORD_DT,BC_STRT_DT,BC_END_DT,EX_DT,ND_STRT_DT,ND_END_DT,PURPOSE',
            'EQ,HDFCBANK,HDFC Bank Ltd.,20/09/2019, , ,19/09/2019, , ,FV SPLT FRM RS 2 TO RS 1 ',
            'EQ,AASTHA,Aastha Spintex, Limited,2026-09-28,,,2026-09-28,,,BONUS 1:1',
        ].join('\n');
        expect(parseBcCsv(text)).toEqual([
            { series: 'EQ', symbol: 'HDFCBANK', exDate: '2019-09-19', purpose: 'FV SPLT FRM RS 2 TO RS 1' },
            { series: 'EQ', symbol: 'AASTHA', exDate: '2026-09-28', purpose: 'BONUS 1:1' },
        ]);
    });
    it('parses dd-MMM-yyyy dates', () => {
        expect(parseBcDate('30-OCT-2019')).toBe('2019-10-30');
        expect(parseBcDate(' ')).toBe('');
    });
});

describe('nearestStandardRatio', () => {
    it('snaps to a split ratio within 4%, else null', () => {
        expect(nearestStandardRatio(0.51)).toBe(0.5);
        expect(nearestStandardRatio(0.205)).toBe(0.2);
        expect(nearestStandardRatio(0.58)).toBeNull();
    });
});

describe('symbol renames', () => {
    const renames = parseSymbolChanges([
        'Some Co, Ltd,OLDCO,MIDCO,01-JAN-2015',
        'Some Co Ltd,MIDCO,NEWCO,01-JAN-2020',
        'Other Ltd,OLDCO2,OLDCO,01-JAN-2021',
    ].join('\n'));
    const canon = makeCanonicalizer(renames);
    it('chains renames forward from the row date', () => {
        expect(canon('OLDCO', '2014-06-01')).toBe('NEWCO');
        expect(canon('MIDCO', '2016-06-01')).toBe('NEWCO');
        expect(canon('NEWCO', '2021-06-01')).toBe('NEWCO');
    });
    it('does not map a reused symbol that appears after the change', () => {
        expect(canon('OLDCO', '2021-06-01')).toBe('OLDCO');
        expect(canon('OLDCO2', '2020-06-01')).toBe('OLDCO');
    });
});
