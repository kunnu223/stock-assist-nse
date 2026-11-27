/**
 * Trade Simulator — one trade from signal to exit, including costs.
 *
 * Shared by the real strategy and the random-entry baseline so both are
 * simulated with exactly the same fill rule, exit rule, holding period and costs.
 *
 * Pure function — no DB, no side effects.
 * @module @stock-assist/api/services/backtest/tradeSimulator
 */

import type { OHLCData } from '@stock-assist/shared';
import { checkOutcome, type OutcomeResult } from './outcomeChecker';
import { checkTrailingOutcome } from './trailingExit';

export type ExitMode = 'target' | 'trailing';

export interface ExitConfig {
    /** 'target' = partial at 1.5R + full at 2.5R; 'trailing' = no target, trailing ATR stop */
    mode: ExitMode;
    /** Bars to wait for the limit entry to fill */
    fillWindowDays: number;
    /** Max bars to hold the trade after it fills */
    maxHoldDays: number;
    partialTargetR: number;
    fullTargetR: number;
    /** Trailing distance in ATRs (trailing mode only) */
    trailAtrMult: number;
    /** Round-trip cost in % of position value, subtracted from every trade */
    costPercent: number;
}

export interface TradeSetup {
    direction: 'BUY' | 'SELL';
    entryPrice: number;
    stopLoss: number;
    targetPrice: number;
    atr: number;
    /** Bars strictly AFTER the signal date */
    futureBars: OHLCData[];
}

export interface SimulatedTrade extends OutcomeResult {
    /** P&L before costs, % */
    grossPnlPercent: number;
    /** Round-trip cost charged, % */
    costPercent: number;
    fillDate: string;
    exitDate: string;
}

/**
 * Returns null if the limit entry never fills within the fill window
 * (in real trading that signal never becomes a trade).
 * `pnlPercent` on the result is NET of costs.
 */
export function simulateTrade(setup: TradeSetup, exit: ExitConfig): SimulatedTrade | null {
    const { direction, entryPrice, stopLoss, targetPrice, atr, futureBars } = setup;

    const fillIdx = futureBars
        .slice(0, exit.fillWindowDays)
        .findIndex(bar => bar.low <= entryPrice && bar.high >= entryPrice);
    if (fillIdx === -1) return null;

    const tradeCandles = futureBars.slice(fillIdx, fillIdx + exit.maxHoldDays);
    if (tradeCandles.length === 0) return null;

    const outcome = exit.mode === 'trailing'
        ? checkTrailingOutcome({
            direction, entryPrice, stopLoss, atr,
            trailAtrMult: exit.trailAtrMult,
            futureCandles: tradeCandles,
        })
        : checkOutcome({
            direction, entryPrice, targetPrice, stopLoss,
            futureCandles: tradeCandles,
            partialTargetR: exit.partialTargetR,
            fullTargetR: exit.fullTargetR,
        });

    const exitBar = tradeCandles[Math.max(0, outcome.daysToOutcome - 1)];

    return {
        ...outcome,
        grossPnlPercent: outcome.pnlPercent,
        costPercent: exit.costPercent,
        pnlPercent: Number((outcome.pnlPercent - exit.costPercent).toFixed(2)),
        fillDate: tradeCandles[0].date,
        exitDate: exitBar.date,
    };
}
