/**
 * Trailing-stop exit for trend/momentum trades.
 *
 * No fixed profit target: the trade rides the trend until price closes far
 * enough against it. Stop starts at the initial stop-loss and then trails the
 * best close since entry by `trailAtrMult × ATR` (a "chandelier" exit). It only
 * ever moves in the trade's favour. If the holding window runs out, the trade
 * is closed at the last bar's close.
 *
 * Pure function — no DB, no side effects.
 * @module @stock-assist/api/services/backtest/trailingExit
 */

import type { OHLCData } from '@stock-assist/shared';
import type { OutcomeResult } from './outcomeChecker';

export interface TrailingExitInput {
    direction: 'BUY' | 'SELL';
    entryPrice: number;
    stopLoss: number;
    atr: number;
    trailAtrMult: number;
    /** Bars from the fill bar (index 0) up to the end of the holding window */
    futureCandles: OHLCData[];
}

/**
 * Price actually received when a stop is triggered. On the fill bar we assume
 * the stop price (the fill happened intra-bar). On later bars, if the bar
 * OPENED beyond the stop (overnight gap), the exit is at the open — worse
 * than the stop.
 */
export function stopExitPrice(direction: 'BUY' | 'SELL', stop: number, bar: OHLCData, barIndex: number): number {
    if (barIndex === 0) return stop;
    return direction === 'BUY' ? Math.min(stop, bar.open) : Math.max(stop, bar.open);
}

const pnlPct = (direction: 'BUY' | 'SELL', entry: number, exit: number) =>
    direction === 'BUY' ? ((exit - entry) / entry) * 100 : ((entry - exit) / entry) * 100;

export function checkTrailingOutcome(input: TrailingExitInput): OutcomeResult {
    const { direction, entryPrice, stopLoss, atr, trailAtrMult, futureCandles } = input;

    if (futureCandles.length === 0) {
        return { outcome: 'EXPIRED', exitPrice: entryPrice, pnlPercent: 0, daysToOutcome: 0, mfe: 0, mae: 0, exitReason: 'no_future_data' };
    }

    const trailDistance = atr * trailAtrMult;
    let stop = stopLoss;
    let bestClose = entryPrice;
    let mfe = 0;
    let mae = 0;

    for (let i = 0; i < futureCandles.length; i++) {
        const bar = futureCandles[i];

        if (direction === 'BUY') {
            mfe = Math.max(mfe, ((bar.high - entryPrice) / entryPrice) * 100);
            mae = Math.max(mae, ((entryPrice - bar.low) / entryPrice) * 100);
        } else {
            mfe = Math.max(mfe, ((entryPrice - bar.low) / entryPrice) * 100);
            mae = Math.max(mae, ((bar.high - entryPrice) / entryPrice) * 100);
        }

        const stopTriggered = direction === 'BUY' ? bar.low <= stop : bar.high >= stop;
        if (stopTriggered) {
            const exitPrice = stopExitPrice(direction, stop, bar, i);
            return {
                outcome: 'STOP_HIT',
                exitPrice: Number(exitPrice.toFixed(2)),
                pnlPercent: Number(pnlPct(direction, entryPrice, exitPrice).toFixed(2)),
                daysToOutcome: i + 1,
                mfe: Number(mfe.toFixed(2)),
                mae: Number(mae.toFixed(2)),
                exitReason: stop === stopLoss ? 'stop_initial' : 'stop_trailing',
            };
        }

        // Ratchet the stop using this bar's close (applies from the next bar on)
        if (direction === 'BUY') {
            bestClose = Math.max(bestClose, bar.close);
            stop = Math.max(stop, bestClose - trailDistance);
        } else {
            bestClose = Math.min(bestClose, bar.close);
            stop = Math.min(stop, bestClose + trailDistance);
        }
    }

    const lastBar = futureCandles[futureCandles.length - 1];
    return {
        outcome: 'EXPIRED',
        exitPrice: lastBar.close,
        pnlPercent: Number(pnlPct(direction, entryPrice, lastBar.close).toFixed(2)),
        daysToOutcome: futureCandles.length,
        mfe: Number(mfe.toFixed(2)),
        mae: Number(mae.toFixed(2)),
        exitReason: 'time_expiry',
    };
}
