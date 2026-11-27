/**
 * Retail delivery charges at a zero-brokerage broker (Zerodha schedule, checked 2026-09-29 on
 * zerodha.com/charges) and liquidity-tiered slippage assumptions.
 *
 * Per side: STT 0.1%, NSE transaction 0.00307%, SEBI ₹10/crore, GST 18% on (transaction + SEBI);
 * stamp 0.015% on buys; DP ₹15.34 per scrip per sell day. Brokerage ₹0.
 *
 * @module @stock-assist/api/services/momentum/charges
 */

export const STT = 0.001;
const EXCHANGE = 0.0000307;
const SEBI = 0.000001;
const GST = 0.18;
const STAMP_BUY = 0.00015;
export const DP_CHARGE_RUPEES = 15.34;

const FEES = (EXCHANGE + SEBI) * (1 + GST);
/** Charges as a fraction of buy value (0.0011874) */
export const BUY_RATE = STT + STAMP_BUY + FEES;
/** Charges as a fraction of sell value, excluding the flat DP charge (0.0010374) */
export const SELL_RATE = STT + FEES;

/** Slippage per side vs the open, by 126-day median daily traded value (₹). Assumption, not measured. */
export function slippageFor(medianValueRupees: number, multiplier = 1): number {
    const crore = medianValueRupees / 1e7;
    const base = crore >= 100 ? 0.0005 : crore >= 25 ? 0.001 : crore >= 5 ? 0.0025 : 0.005;
    return base * multiplier;
}

/** Round-trip cost fraction for a position of `value` rupees, excluding slippage. */
export const roundTripFraction = (value: number) => BUY_RATE + SELL_RATE + DP_CHARGE_RUPEES / value;
