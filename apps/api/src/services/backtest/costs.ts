/**
 * Transaction cost model for NSE cash-equity DELIVERY trades.
 *
 * Every backtest trade is charged a round-trip cost (buy + sell) that is
 * subtracted from its gross P&L. Rates are approximate statutory charges for
 * delivery trades at a zero-brokerage discount broker, plus an assumed
 * slippage. Check your broker's contract note and adjust if yours differ.
 *
 * @module @stock-assist/api/services/backtest/costs
 */

export interface CostModel {
    /** Securities Transaction Tax, % of turnover, charged on buy AND sell (delivery) */
    sttPercentPerSide: number;
    /** Stamp duty, % of turnover, buy side only */
    stampPercentBuy: number;
    /** NSE exchange transaction charge, % of turnover, each side */
    exchangePercentPerSide: number;
    /** SEBI turnover fee (₹10 per crore), % of turnover, each side */
    sebiPercentPerSide: number;
    /** Brokerage, % of turnover, each side (0 at most discount brokers for delivery) */
    brokeragePercentPerSide: number;
    /** GST rate applied to brokerage + exchange + SEBI fees */
    gstPercent: number;
    /** Depository (DP) charge per sell transaction, ₹ flat */
    dpChargeRupees: number;
    /** Position size used to convert the flat DP charge into a percentage */
    positionSizeRupees: number;
    /** Assumed slippage vs the modelled fill price, % each side */
    slippagePercentPerSide: number;
}

export const NSE_DELIVERY_COSTS: CostModel = {
    sttPercentPerSide: 0.1,
    stampPercentBuy: 0.015,
    exchangePercentPerSide: 0.00297,
    sebiPercentPerSide: 0.0001,
    brokeragePercentPerSide: 0,
    gstPercent: 18,
    dpChargeRupees: 16,
    positionSizeRupees: 100_000,
    slippagePercentPerSide: 0.05,
};

export const ZERO_COSTS: CostModel = {
    sttPercentPerSide: 0,
    stampPercentBuy: 0,
    exchangePercentPerSide: 0,
    sebiPercentPerSide: 0,
    brokeragePercentPerSide: 0,
    gstPercent: 0,
    dpChargeRupees: 0,
    positionSizeRupees: 100_000,
    slippagePercentPerSide: 0,
};

/**
 * Total round-trip cost as a % of position value.
 * Default model ≈ 0.34% (STT alone is 0.2% of that).
 */
export function roundTripCostPercent(model: CostModel = NSE_DELIVERY_COSTS): number {
    const feesPerSide = model.brokeragePercentPerSide + model.exchangePercentPerSide + model.sebiPercentPerSide;
    const gstPerSide = feesPerSide * (model.gstPercent / 100);
    const perSide = model.sttPercentPerSide + feesPerSide + gstPerSide + model.slippagePercentPerSide;
    const dpPercent = model.positionSizeRupees > 0
        ? (model.dpChargeRupees / model.positionSizeRupees) * 100
        : 0;
    return Number((2 * perSide + model.stampPercentBuy + dpPercent).toFixed(4));
}
