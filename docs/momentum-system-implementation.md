# Momentum system: implementation spec and pre-registered test

Status: **spec frozen 2026-09-29, before any momentum backtest on this data.** Results are in §9 (holdout: PASS).
Data fixes made while running are marked in §3.
Evidence and sources: [`research/strategy-research.md`](research/strategy-research.md).

## 1. Goal

A rules-only monthly procedure the user can follow without judgement: "on day X, hold these N stocks, in these
quantities". It must be proven on data it was not designed on, net of all costs, against three baselines: the index,
the average stock, and random stock picks.

## 2. Code layout (apps/api)

| Path | Role |
|---|---|
| `src/services/nse/archive.ts` | URL builders and a paced, cached downloader for bhavcopies, PR zips and symbol changes |
| `src/services/nse/indices.ts` | Index history from niftyindices.com and the IIMA monthly risk-free rate |
| `src/services/nse/bhavcopy.ts` | Parses both bhavcopy formats (pre-2024-07-08 and UDiFF) into one row type |
| `src/services/nse/corporateActions.ts`, `actionIndex.ts` | Parse `Bc` purposes into price factors (split, bonus, consolidation, gap-type) and de-duplicate them |
| `src/services/nse/symbolChanges.ts` | Date-aware rename chaining |
| `src/services/nse/panel.ts`, `adjust.ts` | Point-in-time price panel (raw OHLC, traded value, series, locked flag), plus event verification, the heuristic and adjusted closes |
| `src/services/momentum/universe.ts`, `score.ts`, `selection.ts` | Liquidity universe, NSE momentum score, rank buffer |
| `src/services/momentum/book.ts`, `charges.ts`, `tax.ts` | Whole-share positions with FIFO lots, Zerodha charges, capital-gains tax |
| `src/services/momentum/context.ts`, `simulate.ts`, `report.ts`, `benchmarks.ts`, `metrics.ts`, `pipeline.ts` | Precomputation, the simulation loop, summaries, baselines, metrics, and data loading with quality checks |
| `scripts/nseSync.ts` | Downloads and caches the data |
| `scripts/momentumBacktest.ts` | Subcommands: `data`, `design`, `holdout`, `posthoc`, `sensitivity`, `validate` |
| `scripts/momentumPicks.ts` | Live orders for the coming month |

The cache lives in `apps/api/.cache/nse/` and is git-ignored.

## 3. Data pipeline

1. **Trading calendar:** every weekday from 2004-01-01 is tried. A 404 marks a holiday (cached).
2. **Bhavcopy rows** kept: series EQ, BE and BZ, for price continuity. Only EQ rows are eligible for new buys.
   If a symbol has both EQ and BE rows on a day, EQ wins.
3. **Symbol renames** (`symbolchange.csv`) are chained, so each company has one continuous series under its latest symbol.
4. **Corporate actions**, from `Bc` files, which run from 2010-01 onward. Price factor `f` multiplies pre-ex prices:
   - Split `FV a → b`: `f = b/a`
   - Bonus `x:y` (x new for y held): `f = y/(x+y)`
   - Consolidation: `f = b/a > 1`
   - Demerger, rights, capital reduction, scheme or arrangement: `f = open_ex / close_prev`, i.e. the overnight gap is
     treated as the action. Applied only if the gap exceeds 3%.
   - Dividends are ignored everywhere. Every return in this project is a **price return**, and so is every benchmark.
     This understates absolute returns by about 1%/yr.
   - If the gap on the stated ex-date doesn't match `f`, search ±3 trading days for the matching gap. Tolerance is
     min(25%, half the log-distance from `f` to "no change"). If none is found, log the event and skip it.
   - Ratios cut off by older files' 25-character PURPOSE field (e.g. `FV SPLIT FROM RS10 TO RS`) snap the observed
     ex-date gap to a standard ratio.
   - _Changed during the run (data fixes, made before any holdout result):_ the tolerance was 10%, which rejected
     real events on volatile days. Abbreviations `BON`/`BONS` were missed, which lost combined bonus + split events
     (e.g. TITAN 2011). `Bc` files are now fetched for **every** trading day, because some list only 2 days ahead.
5. **Gap heuristic** (fallback, all years): a drop below 0.72 whose **overnight gap** is within 5% of a standard ratio
   (1/2, 1/3, 2/3, 1/4, 3/4, 2/5, 1/5, 1/10) and whose close is within 15% of it.
   - Share volume over the next 20 days must scale up (≥ 0.4/ratio×), and the previous close must be ≥ ₹5, because
     one-tick moves in penny stocks mimic ratios.
   - It is validated against `Bc` on 2010+ data.
   - **Pre-registered:** if recall and precision are both ≥ 95% on the 2010+ data, the design period starts in 2006.
     Otherwise it starts in 2011.
   - **Outcome:** recall 70.2%, precision 93.8%, so the design period starts in **2011**.
6. **Instrument type:** ETFs and fund units trade in the EQ series too. Anything with an ISIN not starting `INE` is
   excluded (357 instruments tagged, from weekly ISIN samples since 2010). The score also rejects any series with
   volatility below 5%/yr.
7. **Adjusted close** = raw close × the product of `f` for all later actions. Held share counts are divided by `f` on
   the ex-date, so position value is continuous.
8. **Validation, reported with the results:**
   - V1: split-adjusted returns of 10 large caps vs Yahoo `close` (split-adjusted), CAGR gap < 0.5%/yr.
   - V2: count of remaining unexplained moves of more than 35% among universe stocks, with the top ones listed.
   - V3: correlation of monthly returns between the K=200/N=30/6-month variant and the official Nifty200
     Momentum 30 price index.

## 4. Strategy rules

- **Calendar:** signal date `C` is the last trading day of a month. Execution `T` is the next trading day, at the open.
  Rebalance every `R` months: R=1 every month-end; R=3 at Feb/May/Aug/Nov; R=6 at May/Nov (as NSE).
- **Universe at C:**
  - Company shares only (ISIN `INE…`), EQ series on C.
  - First trade ≥ 252 trading days before C, and a price on ≥ 90% of the last 252 days.
  - Close ≥ ₹10.
  - Rank by the 126-day median daily traded value (days with no trade count as 0) and keep the top K.
  - A current holding stays eligible while its rank is within 1.5K.
- **Score** (adjusted closes): R12 = P(C)/P(C−12m) − 1 and R6 = P(C)/P(C−6m) − 1, using month-end closes.
  - σ = sample SD of the last 252 daily log returns × √252. At least 200 returns are required.
  - Z6 and Z12 are the cross-sectional z-scores of R6/σ and R12/σ. Z = ½Z6 + ½Z12.
  - NMS = 1+Z if Z ≥ 0, else 1/(1−Z). This is the NSE method with no skip-month.
- **Selection** of N names:
  - S = {rank ≤ N/2} ∪ {held with rank ≤ 1.5N}.
  - If |S| > N, drop held names ranked > N/2, worst first.
  - If |S| < N, add the best-ranked names not in S.
- **Trend filter (variant):** risk-off when the Nifty 500 month-end close is below its 10-month SMA of month-end closes.
  - It is checked every month-end. Risk-off means sell everything and hold cash.
  - Returning to risk-on runs a full selection.
- **Execution on T:**
  - Sells come first, at open × (1 − slip); buys follow, at open × (1 + slip). Sale proceeds are usable the same day.
  - The target per name is equity/N, and quantities are whole shares.
  - An existing holding is resized only if its weight is outside 0.5–1.5× the target.
  - A buy is skipped (the next-ranked name is taken instead) if one share costs more than the target, or if the stock
    is locked (high = low).
  - A locked sell is retried on the next day.
- **Disappearance:** a holding with no row for 5 consecutive trading days is closed at its last close and logged, with
  the count reported.

## 5. Costs, cash, tax (see research §6)

- **Charges per side:**
  - STT 0.1%.
  - Exchange 0.00307% and SEBI 0.0001%, each plus 18% GST.
  - Stamp 0.015% on buys.
  - DP charge ₹15.34 per sold scrip.
  - Brokerage ₹0.
- **Slippage per side, by 126-day median traded value:**

  | Median traded value | Slippage |
  |---|---|
  | ≥ ₹100 cr | 0.05% |
  | ₹25–100 cr | 0.10% |
  | ₹5–25 cr | 0.25% |
  | < ₹5 cr | 0.50% |

  A 2× sensitivity run is reported.
- **Capital:** ₹5,00,000 at the start, with a ₹1,00,000 sensitivity run.
- **Cash:** earns the IIMA monthly risk-free rate. After the series ends (Dec-2025), its last value is carried forward.
- **Tax** (current rules applied to all years):
  - Lots are matched FIFO.
  - Short-term gains (held ≤ 12 months) are taxed at 20.8%; long-term gains at 13% above ₹1.25 lakh per financial year.
  - Short-term losses offset any gain; long-term losses offset only long-term gains. Losses carry forward 8 years.
  - Tax is paid at each 31 March by scaling the equity curve by (1 − tax/equity).
  - Benchmark after tax: Nifty 500 bought once and sold at the end (LTCG).

## 6. Evaluation protocol (pre-registered)

- **Periods:**
  - **Holdout** runs 2018-01-01 → last available date and is untouched until the variant is chosen.
  - The **design** period runs 2006-01-01 or 2011-01-01 (see §3.5) → 2017-12-31.
- **Design grid:** K ∈ {200, 500} × N ∈ {10, 20, 30} × R ∈ {1, 3, 6} × filter ∈ {off, on}, which is 36 variants.
  - The **highest design-period Sharpe** (net of costs, before tax) is chosen. A tie goes to fewer trades.
- **Baselines**, all over the same holdout period:
  1. Nifty 500 price index, buy and hold.
  2. Equal-weight universe: the average daily return of the top-K universe, gross of costs.
  3. 500 random portfolios: the same K/N/R/filter, buffer and costs, but ranks drawn at random each rebalance.
     p = (1 + #random CAGR ≥ strategy CAGR) / 501.
- **Metrics:**
  - CAGR, volatility, Sharpe (excess over cash), max drawdown, and worst month and year.
  - Year-by-year returns, turnover, costs paid, tax paid.
  - ₹5 lakh → ₹X.
- **Pass (all three required, holdout, chosen variant only):**
  - **P1:** CAGR net of costs > Nifty 500 CAGR.
  - **P2:** p < 0.05 vs random portfolios.
  - **P3:** CAGR after tax > Nifty 500 after tax.
- The whole grid is then shown on the holdout, labelled **post-hoc**, as a robustness view only. It cannot change the pick.
- If the chosen variant fails, at most **two** pre-listed follow-ups may be run, with a Bonferroni-adjusted P2 of p < 0.017:
  - (a) Cash in risk-off replaced by the 30 lowest-volatility names.
  - (b) A 15% per-stock stop-loss checked at month-end.
  - After that, stop and report. There is no further tuning.

## 7. Live procedure ("blind" trading)

1. After 7 pm on the last trading day of the month, run, from `apps/api`:
   `npx tsx scripts/momentumPicks.ts --sync --holdings holdings.json`.
   - `holdings.json` looks like `{"cash": 500000, "positions": {"CUPID": 80}}`.
   - `--sync` downloads the latest bhavcopies.
2. The script prints the target list and exact SELL/BUY share counts. Place them as AMO orders for the next
   morning's open.
3. Record the fills in `holdings.json`.
4. With the chosen variant (R=6), trades happen only at the **May and November** month-ends. An empty portfolio can
   start at any month-end.
5. Never override the list or skip a rebalance.
6. **Kill switch** (pre-defined): stop and review if either of these happens:
   - the 3-year rolling return trails Nifty 500 by more than 5 pp/yr;
   - the drawdown exceeds **−57%** (the worst holdout drawdown × 1.25).

## 8. Tests (vitest, `src/services/**/__tests__`)

- Purpose parsing, using real strings from the `Bc` files. Factor application and share adjustment.
- Both bhavcopy formats.
- NMS maths and the selection buffer.
- Cost arithmetic against the Zerodha round-trip figures (0.2225% + ₹15.34).
- FIFO tax with set-off and carry-forward.
- Metrics (CAGR, max drawdown).
- An end-to-end simulation on a synthetic panel with a known answer.

## 9. Results (run 2026-09-30, data to 2026-09-29)

**Verdict: PASS.** All three pre-registered holdout criteria are met. Raw output is in `docs/results/*.json`.

**Chosen on the design period (2011–2017):** K=500, N=20, R=6 (rebalance at May/Nov month-ends), no trend filter.
It had the highest Sharpe of the 36 variants: 1.07, CAGR 31.6%, max drawdown −31.0%.

**Holdout, 2018-01-01 → 2026-09-29, ₹5 lakh start:**

| | Strategy | Nifty 500 | Equal-weight universe | Random portfolios (500) |
|---|---|---|---|---|
| CAGR, after costs | **17.1%** | 10.1% | 11.0% | median 9.5% (5–95%: 4.7–15.2%) |
| CAGR, after tax | **14.8%** | 9.4% | – | – |
| ₹5 lakh becomes | ₹20.0L (₹16.7L after tax) | ₹11.6L | ₹12.4L | – |
| Max drawdown | **−45.8%** (Jan-2018 → Mar-2020) | −38.3% | −61.0% | – |
| Sharpe | 0.56 | 0.35 | 0.36 | – |

- **Pass tests:**
  - P1: 17.1% > 10.1%.
  - P2: p = 0.018 vs random picks from the same universe.
  - P3: 14.8% > 9.4% after tax.
- **By year:**

  | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 (to Sep) |
  |---|---|---|---|---|---|---|---|---|
  | −19.1% | −0.8% | +48.0% | +60.0% | −9.8% | +78.5% | +15.3% | −7.7% | +22.6% |

  Four losing years out of nine.
- **Costs:** charges ₹35.6k, slippage ₹42.9k and tax ₹2.47 lakh over 595 trades. Costs were 0.90%/yr and turnover 1.6× a year.
- **Sensitivity:**
  - 2× slippage: 16.3%.
  - ₹1 lakh capital: 16.0%.
  - Post-launch NSE era (2020-09 on): 27.3% vs Nifty 500 15.2%.
- **Robustness:**
  - Post-hoc, 35 of 36 variants beat Nifty 500 on the holdout (range 9.5–27.2%). The chosen variant is the median.
  - Treating every demerger/rights gap as a loss: 15.7%. Removing heuristic splits: no change.
  - The one delisted holding (TATASTLBSL, merged into Tata Steel) written to zero: 16.6%.
- **Concentration:** the top 10 of 245 names traded made 70% of realised profit (TITAGARH, APARINDS, APOLLO, ZENTEC,
  JSL, ADANIGREEN, …). Missing a few big winners is the main way live results fall short.
- **Data validation:**
  - V1: 10 large caps are within 0.4 pp/yr of Yahoo's split-adjusted series.
  - V2: 142 unexplained moves above 35% remain among top-500 stocks, mostly before 2010.
  - V3: the Nifty200 Momentum 30 replica correlates 0.914 monthly with the official index (18.5% vs 15.4% CAGR).
- **Disclosed bug:** the first run included liquid ETFs (EQ series, near-zero volatility, so extreme scores) in the
  universe. It chose K500/N30/R3 and scored 21.3%, p = 0.002. That run is invalid; its files are kept in
  `docs/results/run1-etfs-in-universe/`. After the fix, design and holdout were re-run once each.

**What this means in rupees:** at 14.8%/yr after tax, ₹10 lakh grows to about ₹40 lakh in 10 years, vs about ₹24.6 lakh
at the index's 9.4%. This is a backtest. Live momentum has historically earned less than its backtests.

## 10. Known limitations

- The universe is a liquidity proxy, not the official Nifty 200/500 membership, because history isn't free.
- Dividends are excluded. Momentum names yield less than average, which slightly favours the strategy vs the
  equal-weight universe.
- Slippage for small caps is assumed, not measured.
- Tax uses today's rates for all years, and business-income treatment is not modelled.
- The NSE method was designed in 2020 with data back to 2005, so only data after Aug-2020 is truly unseen by its designers.
  Post-2020 results are reported separately.
