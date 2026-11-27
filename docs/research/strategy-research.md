# Strategy research: what can be traded "blindly" on NSE

Compiled 2026-09-29. Detailed, fully-cited notes are in `sources/`:
[`evidence.md`](sources/evidence.md) (academic and index evidence),
[`nse-indices.md`](sources/nse-indices.md) (NSE factor-index rules and performance),
[`costs-taxes.md`](sources/costs-taxes.md) (charges and taxes as of Sep-2026).
Numbers below come from those files unless marked "checked" (verified directly in this session).

## 1. Bottom line

- A **mechanical, monthly-rebalanced momentum portfolio** is the only strategy with long, free-data, Indian
  evidence that a retail trader can follow without judgement. The rules need only daily prices.
- It has worked on paper for 30 years. IIMA's survivorship-adjusted long-short momentum factor (WML) earned
  **10.6%/yr from 1994 to 2025** (checked: 10.62% from the IIMA CSV).
- The investable version earns much less than the back-test. Nifty200 Momentum 30 beat Nifty 200 by +6.4 pp/yr in
  its back-tested years (FY06–FY20) but only **+2.2 pp/yr after launch (FY22–FY26)**, and +0.6 pp/yr over the 5 years
  to Aug-2026.
- It has deep drawdowns: **−67.7% in 2008**, −34% in Mar-2020 and **−31.8% from Sep-2024 to Apr-2025**, with no
  market crash in that last case. Blind trading means sitting through these.
- The previous approaches in this repo (SMC patterns, Donchian breakout with ATR stops, confidence scoring) are
  documented failures (see "What did not work" in the README) and are not revisited.

## 2. Evidence summary

| Idea | Indian evidence | Free data? | Use |
|---|---|---|---|
| Cross-sectional momentum (6m + 12m return ÷ volatility) | IIMA WML 10.6%/yr since 1994. N200 Momentum 30 18.7%/yr vs Nifty 200 13.8% since 2005 (TRI, mostly back-test). Beat its parent in 14 of 21 fiscal years | Prices only | **Core signal** |
| Market trend filter (Faber 10-month SMA) | US: max DD 83.7% → 42.2%. No Indian long-only test found | Index prices | Test as a variant |
| Volatility scaling / stop-losses on momentum | US long-short only (Sharpe 0.53 → 0.97; worst month −49.8% → −17.4%) | Prices | Not in v1; test later |
| Low volatility | Nifty100 Low Vol 30: 16.9%/yr since 2005 with lower SD; +1.5 pp/yr live over 5 years | Prices only | Candidate complement |
| Quality, value, post-earnings drift | Real in India, but need point-in-time fundamentals or earnings dates | **No** (paid CMIE data) | Excluded: backtests would be look-ahead biased |
| Size (small caps) | Survivorship-adjusted SMB is **−3.7%/yr** since 1994 | Prices | Don't tilt to small caps |

Momentum crashes cluster in sharp **rebounds** (Apr–May 2009, Apr 2020), when last year's losers rally hardest.
A trend filter cuts bear-market losses but does not fix rebound lag (FY10: −23.5 pp, FY21: −12.2 pp vs Nifty 200).

## 3. Realistic expectations, in rupees

| Assumption (10 years, ₹10 lakh start, before tax) | CAGR | End value |
|---|---|---|
| Index (Nifty 200 TRI since 2005) | 13.8% | ₹36 lakh |
| Momentum, back-test-era edge (+5 pp) | 18.7% | ₹56 lakh |
| Momentum, live-era edge (+2 pp over a 12% market) | 14% | ₹37 lakh vs ₹31 lakh |

- The project's original target of 30–50%/yr sustained has **no support** in any Indian source found. The best-documented
  Indian momentum products did 11–22%/yr, with 22% SD.
- Anomaly returns fall ~26% out-of-sample and ~58% after publication (McLean & Pontiff). US smart-beta indexes went from
  +2.8%/yr before launch to −0.4%/yr after.
- Judge any system over 3–5 years. Live momentum indices have lagged their parent 3 years in a row.

## 4. Biases that would make our own backtest lie

| Bias | Size | Fix used here |
|---|---|---|
| Today's index list used for past years (look-ahead + survivorship) | +4.9 pp/yr on Nifty Smallcap 250 (2016–2025); up to 8 pp/yr in US | Build the universe **point-in-time** from NSE daily bhavcopies, which include later-delisted stocks |
| Unadjusted splits/bonuses | A 1:1 bonus looks like a −50% crash | Adjust using NSE's corporate-action (Bc) files; checked that raw bhavcopy `PREVCLOSE` is **not** adjusted (HDFCBANK split, 19-Sep-2019) |
| Parameter mining | In-sample edge disappears | Pre-registered design/holdout split. Parameters come from NSE's published method, not from tuning |
| Ignoring costs and tax | 0.24–0.38% per round trip; 20.8% STCG | Full cost model plus a post-tax result |

This repo's earlier backtests used today's NIFTY 100 list, so every one of those results is inflated.

## 5. Data sources (all free; availability checked on 2026-09-29)

| Data | Source | Checked |
|---|---|---|
| Daily EOD, all NSE stocks incl. later-delisted ones, 2005 → 2024-07-05 | `nsearchives.nseindia.com/content/historical/EQUITIES/{YYYY}/{MON}/cm{DD}{MON}{YYYY}bhav.csv.zip` | 2005-04-01 ✓; 2024-07-08 404 (format switch) |
| Daily EOD from 2024-07-08 (UDiFF format) | `nsearchives.nseindia.com/content/cm/BhavCopy_NSE_CM_0_0_0_{YYYYMMDD}_F_0000.csv.zip` | 2024-01-05 ✓, 2026-09-25 ✓; 2023 and earlier 404 |
| Corporate actions (ex-date + purpose, e.g. `BONUS 1:1`, `FV SPLT FRM RS 5 TO RE 1`) | `Bc*.csv` inside `nsearchives.nseindia.com/archives/equities/bhavcopy/pr/PR{DDMMYY}.zip`. Rolling window of ±1–2 weeks | 2010, 2011, 2019, 2024, 2026 ✓ (date format changes to ISO by 2026) |
| Symbol renames | `nsearchives.nseindia.com/content/equities/symbolchange.csv` | 1,064 rows ✓ |
| Index history (Nifty 500, Nifty 50, Nifty200 Momentum 30, …) | POST `niftyindices.com/BackPage/getHistoricaldatatabletoString` (price), `…/getTotalReturnIndexString` (TRI) | Nifty 500 from 2005-01-03 ✓; N200M30 from 2005-04-01 ✓ |
| Risk-free rate (monthly) and reference momentum factor | IIMA data library CSV (to Dec-2025) | ✓ |
| Current Nifty 500 list (live trading only) | `archives.nseindia.com/content/indices/ind_nifty500list.csv` | 501 rows ✓ |

Historical Nifty 200/500 membership is **not** published for free, so the backtest universe is a liquidity-ranked
proxy (top-K by 6-month median traded value). Market cap is also unavailable before 2024.

## 6. Costs and taxes (retail, Zerodha, checked on zerodha.com/charges 2026-09-29)

| Item | Rate |
|---|---|
| STT, delivery | 0.1% on buy and on sell (unchanged in Budgets 2025 and 2026) |
| NSE transaction charge (incl. IPFT) | 0.00307% per side |
| SEBI fee | ₹10 per crore per side |
| Stamp duty | 0.015%, buy side only |
| GST | 18% on brokerage + exchange + SEBI charges |
| Brokerage | ₹0 for delivery |
| DP charge | ₹15.34 per scrip per sell day |
| Round trip, excluding slippage | 0.376% at ₹10k, 0.284% at ₹25k, 0.238% at ₹1 lakh |
| STCG (held ≤ 12 months) | 20% + 4% cess = 20.8% |
| LTCG | 12.5% above ₹1.25 lakh/yr + cess |
| Loss carry-forward | 8 years; short-term losses offset any gain |

Slippage for mid and small caps is not published (UNVERIFIED); the backtest uses liquidity-tiered assumptions and a
2× sensitivity run. A monthly-rotated book realises almost everything as STCG. Frequent trading may be assessed as
business income (CBDT Circular 6/2016 gives no safe harbour under 12 months). Ask a CA.

## 7. Decisions carried into the implementation

1. The signal is NSE's normalised momentum score (6m and 12m price return ÷ 1-year daily volatility, z-scored), equal-weighted.
2. The universe is point-in-time and liquidity-ranked (top 200 or top 500), built from bhavcopies that include delisted stocks.
3. The rebalance-rank buffer follows NSE: the top N/2 are always in, and holdings are kept while ranked ≤ 1.5N.
4. Variants tested on the **design period only**: universe size, N, rebalance frequency, and a Nifty 500 10-month-SMA filter.
5. The single chosen variant is tested once on the **holdout**, against Nifty 500, the equal-weight universe and
   random portfolios from the same universe.
6. Full costs and a post-tax result are included. Results are framed in rupees.

Spec and measured results: [`../momentum-system-implementation.md`](../momentum-system-implementation.md). The holdout
(2018–2026) passed: 17.1%/yr after costs vs Nifty 500 10.1%, max drawdown −45.8%.
