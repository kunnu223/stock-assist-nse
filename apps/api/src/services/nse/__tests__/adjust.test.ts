import { describe, it, expect } from 'vitest';
import { applyCorporateActions } from '../adjust';
import type { CorporateActionIndex } from '../actionIndex';
import type { ParsedAction } from '../corporateActions';
import { syntheticPanel } from '../../momentum/__tests__/fixtures';

describe('applyCorporateActions', () => {
    // Raw prices include the drops; events start empty so the adjuster has to find them
    const panel = syntheticPanel({ BONUS: 0.1, SPLIT: 0.1, CRASH: 0.1, DEMERGE: 0.1 }, 700, {
        BONUS: [{ day: 300, factor: 0.5, kind: 'bonus', source: 'bc' }],
        SPLIT: [{ day: 500, factor: 0.2, kind: 'split', source: 'bc' }],
        CRASH: [{ day: 400, factor: 0.6, kind: 'gap', source: 'bc' }],
        DEMERGE: [{ day: 350, factor: 0.9, kind: 'gap', source: 'bc' }],
    });
    panel.events.forEach(e => e.splice(0));
    const i = (s: string) => panel.index.get(s)!;
    for (let d = 500; d < 700; d++) panel.volume[i('SPLIT')][d] = 5e6; // share volume ×5 after the split
    for (let d = 400; d < 420; d++) panel.volume[i('CRASH')][d] = 2e6;

    // The stated ex-date is one day off for the bonus; the adjuster must find the real gap
    type Entry = { actions: ParsedAction[]; purposes: string[] };
    const actions: CorporateActionIndex = new Map([
        ['BONUS', new Map<string, Entry>([[panel.dates[299], { actions: [{ kind: 'bonus', factor: 0.5 }], purposes: ['BONUS 1:1'] }]])],
        ['DEMERGE', new Map<string, Entry>([[panel.dates[350], { actions: [{ kind: 'gap' }], purposes: ['DEMERGER'] }]])],
    ]);
    const report = applyCorporateActions(panel, actions);
    const jump = (s: string, d: number) => panel.adj[i(s)][d] / panel.adj[i(s)][d - 1];

    it('applies a Bc bonus on the day the price actually gapped', () => {
        expect(panel.events[i('BONUS')]).toEqual([{ day: 300, factor: 0.5, kind: 'bonus', source: 'bc' }]);
        expect(Math.abs(jump('BONUS', 300) - 1)).toBeLessThan(0.05);
    });
    it('uses the overnight gap for a demerger', () => {
        expect(panel.events[i('DEMERGE')][0].kind).toBe('gap');
        expect(Math.abs(jump('DEMERGE', 350) - 1)).toBeLessThan(0.001);
    });
    it('detects an unrecorded split from price ratio and volume', () => {
        expect(panel.events[i('SPLIT')]).toEqual([{ day: 500, factor: 0.2, kind: 'split', source: 'heuristic' }]);
        expect(report.heuristicApplied).toBe(1);
    });
    it('leaves a genuine crash alone', () => {
        expect(panel.events[i('CRASH')]).toEqual([]);
        expect(jump('CRASH', 400)).toBeLessThan(0.65);
    });
});
