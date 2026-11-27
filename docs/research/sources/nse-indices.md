# NSE factor indices: methodology, performance, ETFs, data access (for backtester replication)

Compiled 2026-09-29 IST. Every fact carries a source tag; tags resolve to URLs in the table below. "[CALC]" = my own computation
from official niftyindices.com PR/TRI series downloaded 2026-09-29 via [HIST] (method stated where used). UNVERIFIED = could not confirm.

## Sources
| Tag | URL | Version / date |
|---|---|---|
| M26 | https://www.niftyindices.com/Methodology/Method_NIFTY_Equity_Indices.pdf | "Methodology Document for Equity Indices, September 2026" (build 20260821), 342 pp |
| M21 | https://web.archive.org/web/2021id_/https://www.niftyindices.com/Methodology/Method_NIFTY_Equity_Indices.pdf | August 2021 edition (archived) |
| FS-x | https://www.niftyindices.com/Factsheet/ + `Factsheet_Nifty200_Momentum30.pdf`, `ind_nifty_200.pdf`, `ind_nifty50.pdf`, `ind_nifty_500.pdf`, `Nifty100_LowVolatility30.pdf`, `Factsheet_Nifty_Alpha50.pdf`, `FactsheetNifty500Momentum50.pdf`, `Factsheet_NiftyMidcap150Momentum50.pdf`, `Factsheet_NIFTY_Alpha_Low-Volatility_30.pdf`, `Factsheet_NIFTY200_Quality30.pdf` | all dated **August 31, 2026** |
| WP26 | https://www.niftyindices.com/docs/default-source/indices/nifty200-momentum-30/momentum-strategy-whitepaper_2026.pdf | "The Science of Momentum", April 2026, data to 27-Feb-2026 |
| WP20 | https://www.niftyindices.com/docs/default-source/indices/nifty200-momentum-30/nifty200_momentum_30_index_whitepaper_sep_20.pdf | Sep 2020, data to 31-Aug-2020 |
| WPLV | https://www.niftyindices.com/docs/default-source/indices/nifty-100-low-volatility-30/nifty100_low_vol_30_white_papere020f74c99bc6f449e1fff0400847f3c.pdf | June 2018 |
| WPALV | https://www.niftyindices.com/docs/default-source/indices/nifty-alpha-low-volatility-30/nifty-alpha-low-volatility-30-whitepaper_2020.pdf | 2020 |
| PR-yyyymmdd | https://www.niftyindices.com/Press_Release/ind_prsDDMMYYYY.pdf (e.g. `ind_prs10062026.pdf`, `ind_prs11122025.pdf`, `ind_prs06062025.pdf`, `ind_prs11122024.pdf`, `ind_prs07062024.pdf`, `ind_prs23022026.pdf`, `ind_prs10082026.pdf`, `ind_prs25082020.pdf`) | as dated |
| MEDIA | https://www.niftyindices.com/media | press-release index (fetched 2026-09-29) |
| HIST | https://www.niftyindices.com/reports/historical-data ; JS https://liveindexsa.niftyindices.com/assets/js/IISLComponet.js | fetched 2026-09-29 |
| ETFLIST | https://nsearchives.nseindia.com/content/equities/eq_etfseclist.csv | fetched 2026-09-29 |
| BHAV | https://nsearchives.nseindia.com/products/content/sec_bhavdata_full_DDMMYYYY.csv | 1–29 Sep 2026 |
| AMFI | https://www.amfiindia.com/ter-of-mf-schemes ; API `https://www.amfiindia.com/api/populate-te-rdata-revised?MF_ID=All&Month=09-2026&strCat=<id>&strType=1&excel=true` | TER dates 24–29 Sep 2026 |
| SEBI19 | https://www.sebi.gov.in/sebi_data/attachdocs/jan-2019/1547119165305.pdf | SEBI/HO/IMD/DF3/CIR/P/2019/011, 10-Jan-2019 |
| SEBI26 | https://www.sebi.gov.in/sebi_data/attachdocs/jul-2026/1783933012694.pdf | SEBI (Mutual Funds) Regulations, 2026, in force 1-Apr-2026 |
| FO | https://nsearchives.nseindia.com/content/fo/fo_mktlots.csv | current F&O underlyings, fetched 2026-09-29 |

## 1. Nifty200 Momentum 30: exact rules

| Item | Rule (as written) | Src |
|---|---|---|
| Universe | Stocks "forming part / going to be a part of the Nifty 200 index at the time of review" | M26 §16 p.184 |
| Listing | Minimum listing history of 1 year. After a scheme of arrangement: 12 calendar months of trading on ex-basis as of the cut-off date | M26 p.184 |
| F&O | "Stock should be available for trading in derivative segment (F&O) as on the effective date". The rule is already in the Aug-2021 edition. It is not mentioned in the 2020 launch PR or WP20 | M26 p.185; M21 p.94; PR-20200825 |
| 12M return | `[Price(M-1)/Price(M-13)] - 1`, where M = rebalance month and prices are "as of the last trading day of M-1 Month and M-13 Month" | M26 p.185 |
| 6M return | `[Price(M-1)/Price(M-7)] - 1` (same convention) | M26 p.185 |
| Skip-month? | **No skip month.** The window ends at the last trading day of M-1 (May/Nov), which is also the data cut-off. The rebalance month itself (≈1 month until the effective date) is simply not used. The 500/Midcap variants say this explicitly: "using data ending last trading day of May and November". These are *price* returns, so dividends are excluded | M26 p.185, p.191, p.204 |
| Volatility σp | "Annualised standard deviation of lognormal daily returns of the stock for 1 year". The **same σp** divides both the 12M and 6M returns. Daily returns, not weekly | M26 p.185 |
| Momentum ratios | MR12 = R12/σp; MR6 = R6/σp | M26 p.185 |
| Normalisation | Z12 = (MR12 − μMR12)/σMR12 and Z6 likewise, with mean/SD taken over the **eligible universe**. **No winsorisation** is specified for any momentum index. The document's only winsorisation mention is for Nifty500 Growth 50 (PAT/sales CAGR) | M26 pp.185–186; §19 |
| Combine | Weighted Avg Z = 50% × Z12 + 50% × Z6 | M26 p.186 |
| NMS transform | NMS = 1 + Z if Z ≥ 0; NMS = (1 − Z)^-1 if Z < 0 | M26 p.186 |
| Selection | Top 30 by NMS | M26 p.186 |
| Buffer | Top 15 by NMS are compulsorily included. Existing members ranked **beyond 45** are compulsorily excluded. A stock that leaves Nifty 200 exits "at the time of the review" of this index, i.e. at the next Jun/Dec review, not at the parent's Mar/Sep change | M26 p.186 |
| Weight | Free-float mcap × NMS ("factor tilt") | M26 p.184, p.186 |
| Cap | "lower of 5% or 5 times the weight of the stock in the index based only on free float market capitalization". Applied semi-annually at rebalance only; weights drift in between | M26 p.184, p.186 |
| Rebalance | Semi-annual, June and December | M26 p.186; p.289 table |
| Effective / pricing | Periodic replacements take effect "from the last trading day (beginning of day)" of the month. For capped indices, capping uses "closing prices as on T-3 basis, where T day is last trading day" | M26 pp.285–286 |
| Notice | ≥5 working days for non-broad indices. Actual reviews: PR 10-Jun-2026 → effective 30-Jun-2026 ("close of June 29"); PR 11-Dec-2025 → 31-Dec-2025 (close 30-Dec); PR 06-Jun-2025 → 30-Jun-2025 (close 27-Jun); PR 11-Dec-2024 → 31-Dec-2024 (close 30-Dec); PR 07-Jun-2024 → 28-Jun-2024 (close 27-Jun) | M26 p.285; PR-20260610, -20251211, -20250606, -20241211, -20240607 |
| Ad hoc | Ad-hoc reconstitution if a constituent is removed from Nifty 200 by corporate action (scheme, delisting) or suspension. For fixed-count indices, weights are "realigned from their drifted weights to their original capping limits" | M26 p.187, p.286 |
| SEBI screen | Screened quarterly against the SEBI 10-Jan-2019 norms: ≥10 stocks; single stock ≤25% (≤35% for sectoral/thematic); top-3 ≤65%; each constituent trading frequency ≥80% and average impact cost ≤1% over 6 months | M26 p.187; SEBI19 |
| Base / launch | Base date 01-Apr-2005, base value 1000. Launched 25-Aug-2020, so values before that date are back-calculated. Real-time calculation (the 2020 PR said end-of-day) | M26 p.184; FS Mom30; PR-20200825 |

Worked calendar (NSE sessions from the [HIST] series):
- **Jun-2026 review:** C = 2026-05-29, M−7 = 2025-11-28, M−13 = 2025-05-30. T = 2026-06-30, T−1 = 2026-06-29, T−3 = 2026-06-24 (a holiday falls in between).
- **Dec-2025 review:** C = 2025-11-28, M−7 = 2025-05-30, M−13 = 2024-11-29. T = 2025-12-31, T−3 = 2025-12-26. [CALC]

Realised turnover:
- Names replaced per review (out of 30): Jun-2024 13, Dec-2024 19, Jun-2025 20, Dec-2025 19, Jun-2026 22. Counted from PR-20240607 / -20241211 / -20250606 / -20251211 / -20260610.
- Annual weight churn, semi-annual index (WP26 Exh.11): FY22 101%, FY23 112%, FY24 115%, FY25 110%, FY26 (to 27-Feb-2026) 134%.
- Caps apply only at rebalance, so weights drift above 5%. On 31-Aug-2026 the top weights were Laurus Labs 5.96%, MCX 5.86%, Shriram Finance 5.34%, Hindalco 5.09% (FS Mom30).
- All 30 current constituents (https://www.niftyindices.com/IndexConstituent/ind_nifty200Momentum30_list.csv) appear in the current NSE F&O list [FO] [CALC].

## 2. Related factor indices (brief)

| Index | Universe / filters | Score | N | Buffer | Weight / cap | Review | Base / launch |
|---|---|---|---|---|---|---|---|
| **Nifty500 Momentum 50** | Nifty 500; listing ≥1y; non-member non-F&O stock ineligible if circuit hits ≥20% of trading days in past 6m (upper+lower same day = 2); promoter pledge >20% ineligible; bottom 10 pct by 6m ADT and bottom 10 pct by turnover ratio ineligible (turnover ratio = 6m ADT / 6m avg FFMC as defined in the doc's MQVLv 50 section; applicability here UNVERIFIED) | Same NMS | 50 | Existing within top 75 retained; top-25 non-members forced in "replacing the stocks with lowest momentum score"; existing beyond 75 excluded | FFMC×NMS; min(5%, 5×FFMC wt) | Jun/Dec, data to last trading day May/Nov | 01-Apr-2005 / 04-Jun-2024 |
| **Nifty Midcap150 Momentum 50** | Nifty Midcap 150; listing ≥1y; non-F&O stocks with circuit instances ≥20% of trading days (past 6m) ineligible | Same NMS | 50 | Same 75 / 25 rules | FFMC×NMS; min(5%, 5×) | Jun/Dec, data to May/Nov | 01-Apr-2005 / 16-Aug-2022 |
| **Nifty Alpha 50** | NSE-listed; top 300 by 6m avg FF mcap and avg daily turnover; listing ≥1y; 100% trading frequency over 1y | Alpha from 1-yr trailing prices adjusted for corporate actions (benchmark/rf not specified in this section: UNVERIFIED) | 50 | Existing retained if rank ≤100; negative alpha not selected unless no positive-alpha candidate | w ∝ alpha; capping "-" | Quarterly; 6m data ending last trading day Feb/May/Aug/Nov; effective Mar/Jun/Sep/Dec | 31-Dec-2003 / 19-Nov-2012 |
| **Nifty100 Low Volatility 30** | Nifty 100; listing ≥1y; F&O; DVRs ineligible | SD of daily log price returns, last 1y, adjusted closes, ending last trading day Feb/May/Aug/Nov | 30 lowest | Existing retained if rank ≤60 | w = (1/σ)/Σ(1/σ). Stocks whose 6m avg turnover is below the lowest 6m avg turnover in Nifty 50 are capped at 3%, excess redistributed pro-rata | Quarterly; weights on closes 3 trading days before effective date | 01-Apr-2005 / 08-Jul-2016 |
| **Nifty Alpha Low-Volatility 30** | Nifty 100 + Nifty Midcap 50 (one sentence says Midcap 150: internal inconsistency); F&O; listing ≥1y | Alpha: Jensen's α, 1y vs Nifty 50, rf = avg daily 3M MIBOR, β over 12m. LowVol: inverse SD of 1y daily returns. Each factor: Z → factor score (1+Z, or 1/(1−Z)) → percentile; select on the 50/50 average percentile | 30 | Top 10 forced in; existing out if rank drops below 50 | "Based on weighted average factor level Z score" (exact transform UNVERIFIED); min(5%, 5×) | Semi-annual Jun/Dec | 01-Apr-2005 / 10-Jul-2017 |
| **Nifty200 Quality 30** | Nifty 200; listing ≥1y; F&O | Z of ROE and D/E (latest FY; D/E skipped for financials) and EPS-growth variability (5 FYs, from 6 years of adjusted EPS). Negative EPS in any of the 6 FYs → excluded. Non-fin Z = 0.33·Z_ROE − 0.33·Z_DE − 0.33·Z_EPSvar; fin Z = 0.5·Z_ROE − 0.5·Z_EPSvar. Score = 1+Z (Z>0) or (1−Z)^-1 | 30 | Top 10 forced in; existing beyond 50 out | **√FFMC** × quality score; min(5%, 5×) | Semi-annual Jun/Dec | 01-Apr-2005 / 17-Apr-2018 |

Sources for the table:
- M26 §21 pp.201–204, §17 pp.188–191, §10 pp.170–171, §15 pp.181–183, §28 pp.230–235, §25 pp.219–221, §23 (turnover ratio definition), plus the Index Characteristics table (p.283) and the reconstitution table (p.289).
- Launch dates are taken from the respective FS-x factsheets.

## 3. NIFTY 500 eligibility, Nifty 200 composition, where changes are published

**Ranking basis.** Nifty 500 ranks the eligible universe on **full** market capitalisation, not free-float. Free float is used only for weighting. (M26 p.7; FS Nifty 500 "Methodology: Free Float Market Capitalization")

**Eligible universe (M26 pp.9–10):**
- Domiciled in India and traded on NSE.
- Excluded: convertibles, bonds, warrants, rights, preferred stock with guaranteed fixed return, suspended stocks, BZ series.
- DVRs are eligible, subject to the DVR criteria.
- Free float: IWF ≥ 0.10, OR 6m average FF mcap ≥ 25% of the 6m average full mcap of the smallest existing Nifty 500 constituent.
- Traded on ≥90% of days in the previous 6 months.
- Average impact cost ≤1% over 6 months. The basket size is not stated for Nifty 500 (UNVERIFIED); Nifty 50 uses Rs 10 cr.
- Newly listed stocks are checked on 1 month of data instead of 6.
- Must rank within the top 800 on both average daily turnover and average daily full mcap (6 months).
- After a scheme of arrangement: 1 calendar month of ex-basis trading.

**Inclusion and exclusion (M26 p.11, p.16):**
- Include: rank by full mcap within the top 350 AND full mcap ≥1.5× that of the smallest constituent.
- Exclude: full-mcap or average-turnover rank below 800, failing the minimum criteria, or suspension/delisting/scheme.
- At most 25 replacements per review. The limit does not apply to eligibility failures, parent exclusions or corporate events.

**Schedule:**
- Semi-annual review on six months of data ending **January and July**. Changes take effect on the last trading day of **March and September**, with 4 weeks' prior notice for broad indices (M26 p.9, pp.285–286).
- Examples: PR 23-Feb-2026 → effective 30-Mar-2026 (close 27-Mar-2026); PR 10-Aug-2026 → effective 30-Sep-2026 (close 29-Sep-2026) (PR-20260223, PR-20260810).

**Nifty 200 is not simply the top 200 by market cap.** It is Nifty 100 ∪ Nifty Midcap 100 (M26 p.8, p.16), built as follows (M26 pp.7–15):
- **Nifty 100** = top 100 by full mcap from Nifty 500, with buffers. Include if rank ≤90 and either F&O or ADT above the 90th stock's; exclude if rank is beyond 110; max 5 replacements.
- **Nifty Midcap 150** = ranks 101–250. Include ≤225, exclude >275; max 15.
- **Nifty Midcap 100** = Nifty Midcap 50 plus other Midcap 150 names by ADT. Include ADT rank ≤70, exclude below 130; max 10.
- Child indices use the latest parent composition, including announced changes (M26 p.17).

**Where changes and constituents are published:**
- **Press releases:** [MEDIA] lists 1,496 unique PR links (1,509 anchors including duplicates), pattern `/Press_Release/ind_prsDDMMYYYY[_n].pdf`, back to 2004 (counted 2026-09-29). Strategy-index semi-annual changes appear as "Replacements in indices" each Jun/Dec; broad-market changes in Feb/Aug; ad-hoc exclusions separately, e.g. demerger dummy symbol DUMMYSIEMS in PR-20250606.
- **Current constituents only:** `https://www.niftyindices.com/IndexConstituent/ind_nifty500list.csv`, `ind_nifty200list.csv`, `ind_nifty200Momentum30_list.csv`. Mirror: `https://nsearchives.nseindia.com/content/indices/ind_nifty500list.csv` (tested 2026-09-29, 502 lines).
- **Month-end weights zip** (`/Indices_-_Market_Capitalisation_and_Weightage/indices_dataAug2026.zip`) covers only 7 indices: Nifty 50, Bank, Financial Services, Midcap Select, IT, Next 50, India FPI 150. No factor indices.
- **Historical EOD constituent data is a paid product** ("For subscription of end of day index constituent data, write to us"): https://www.niftyindices.com/offerings/data-subscription

**Implication:** point-in-time membership must be rebuilt by walking backwards from the current CSVs through the PRs.

## 4. Performance

### 4a. Factsheets dated 31-Aug-2026 (FS-x)
Notes on the figures:
- QTD, YTD and 1Y are absolute returns; longer periods are CAGR.
- "Std. Deviation = average daily SD annualised". Statistics (SD, beta, correlation) are based on the price-return index; beta and correlation are vs NIFTY 50.
- Since-inception (SI) periods start at each index's own base date, so they are not comparable across indices.

| Index (SI base) | PR 1Y | PR 5Y | PR SI | TR 1Y | TR 5Y | TR SI | SD 1Y/5Y/SI | Beta 1Y/5Y/SI | Corr 1Y/5Y/SI |
|---|---|---|---|---|---|---|---|---|---|
| Nifty200 Momentum 30 (01-Apr-05) | 5.78 | 10.05 | 17.44 | 6.38 | 11.02 | 18.70 | 18.08/19.46/22.33 | 1.19/1.19/0.95 | 0.87/0.84/0.88 |
| Nifty 200 (01-Jan-04) | 3.53 | 9.26 | 12.36 | 4.51 | 10.42 | 13.84 | 13.79/14.37/20.84 | 1.03/1.02/0.98 | 0.98/0.98/0.99 |
| Nifty 50 (03-Nov-95) | −1.42 | 7.05 | 10.86 | −0.35 | 8.32 | 12.38 | 13.20/13.81/22.42 | 1/1/1 | 1/1/1 |
| Nifty100 Low Vol 30 (01-Apr-05) | −0.13 | 8.95 | 15.06 | 0.92 | 10.47 | 16.92 | 11.96/11.94/16.83 | 0.86/0.79/0.76 | 0.95/0.91/0.93 |
| Nifty Alpha 50 (31-Dec-03) | 17.27 | 13.75 | 19.56 | 17.72 | 14.49 | 20.62 | 18.85/21.67/24.76 | 1.18/1.19/0.97 | 0.83/0.76/0.83 |
| Nifty500 Momentum 50 | 11.52 | 13.89 | 20.66 | 12.02 | 14.63 | 21.76 | 18.19/20.77/22.41 | 1.17/1.17/0.90 | 0.85/0.78/0.83 |
| Nifty Midcap150 Mom 50 | 9.93 | 17.37 | 21.53 | 10.49 | 18.11 | 22.73 | 17.91/19.04/21.13 | 1.15/1.08/0.82 | 0.85/0.78/0.80 |
| Nifty Alpha Low-Vol 30 | 4.07 | 9.44 | 16.66 | 4.97 | 10.62 | 18.19 | 12.89/13.36/17.21 | 0.90/0.85/0.74 | 0.92/0.88/0.89 |
| Nifty200 Quality 30 | 0.99 | 7.10 | 15.16 | 2.51 | 8.88 | 17.16 | 13.48/13.54/17.89 | 0.87/0.82/0.79 | 0.85/0.84/0.91 |
| Nifty 500 (01-Jan-95) | 4.40 | 10.01 | 10.47 | 5.34 | 11.13 | 12.14 | 13.94/14.43/21.93 | 1.03/1.01/0.94 | 0.97/0.97/0.95 |

YTD 2026 to 31-Aug (TR): Momentum 30 +1.20, Nifty 200 −2.53, Nifty 50 −7.00, Low Vol 30 −3.41, Alpha 50 +14.75 (FS-x). The factsheets do **not** publish max drawdown.

### 4b. Common window 01-Apr-2005 → 31-Aug-2026, TRI [CALC]
Method: TRI from [HIST]; volatility = sample SD of daily log returns × √252; MDD = worst peak-to-trough on daily closes.

Check on the data: this reproduces the factsheet SI TR figures exactly for Momentum 30 (18.70), Low Vol 30 (16.92) and Alpha 50 (base-date SI 20.62).

| Index | CAGR % | Vol % | CAGR/Vol | Max DD (peak → trough) | MDD since 2024-01-01 |
|---|---|---|---|---|---|
| Nifty200 Momentum 30 | 18.70 | 22.42 | 0.83 | −67.7% (2008-01-07 → 2008-10-27) | −31.6% (2024-09-27 → 2025-04-07) |
| Nifty 200 | 13.86 | 20.47 | 0.68 | −63.7% (2008-01-04 → 2008-10-27) | −17.8% |
| Nifty 50 | 13.54 | 20.73 | 0.65 | −59.5% (2008-01-08 → 2008-10-27) | −15.4% |
| Nifty 500 | 14.06 | 20.21 | 0.70 | −63.7% | −18.6% |
| Nifty100 Low Vol 30 | 16.92 | 16.86 | 1.00 | −48.7% (2008-01-02 → 2008-10-27) | −18.1% |
| Nifty Alpha 50 | 19.24 | 24.77 | 0.78 | −78.9% (2008-01-07 → 2009-03-09) | −31.3% |
| Nifty500 Momentum 50 | 21.76 | 22.53 | 0.97 | −70.2% | −31.6% |
| Nifty Midcap150 Mom 50 | 22.73 | 21.25 | 1.07 | −72.5% (→ 2009-03-09) | −25.5% |
| Nifty Alpha Low-Vol 30 | 18.19 | 17.28 | 1.05 | −57.3% | −24.7% |
| Nifty200 Quality 30 | 17.16 | 17.92 | 0.96 | −55.6% | −22.4% |

Other drawdown checks:
- **COVID 2020 [CALC]:** Momentum 30 −34.0% (2020-02-19 → 2020-03-23) vs Nifty 200 −38.0%.
- **Current, 29-Sep-2026 close [CALC]:** Momentum 30 is −21.5% below its TRI high of 2024-09-27; Nifty 200 is −9.3% below its high of 2026-01-02.
- **Published drawdowns reconcile with the calculation:**
  - WP26 Exh.6 (to 27-Feb-2026): Momentum 30 −67.7% vs Nifty 200 −63.7% (trough 27-10-2008); N500 Mom 50 −70.2% vs Nifty 500 −63.7%; Midcap150 Mom 50 −72.5% vs Midcap 150 −72.9% (09-03-2009).
  - WPLV: Low Vol 30 −49.5% (2008) vs Nifty 100 −61.5%. My price-return calculation gives −49.5% [CALC].

### 4c. WP26 extras (TRI, as of 27-Feb-2026)
Annualised returns:

| Period | Mom30 | Nifty 200 | Mid150 Mom50 | Midcap 150 | N500 Mom50 | Nifty 500 |
|---|---|---|---|---|---|---|
| SI (Apr-05) | 19.19 | 15.08* | 23.00 | 17.24 | 21.94 | 18.85* |
| 10y | 20.16 | 15.74 | 23.38 | 20.21 | 20.83 | 16.04 |
| 5y | 18.15 | 14.42 | 24.72 | 20.77 | 20.79 | 14.88 |
| 3y | 21.50 | 17.53 | 26.20 | 24.92 | 23.28 | 17.97 |
| 1y | 18.18 | 17.71 | 21.94 | 23.87 | 16.99 | 17.62 |

Notes on this table:
- \*The Nifty 200 and Nifty 500 SI figures do **not** reconcile with niftyindices TRI data; my calculation gives 14.21% and 14.32% [CALC]. Treat them as UNVERIFIED or erroneous.
- WP26's 1y figures reproduce exactly when the start date is 2025-02-28 [CALC].

**Calendar-year TRI returns (WP26 Exh.7).** Mom30 %, with excess vs Nifty 200 in pp in brackets. I checked 2008, 2009, 2021, 2022, 2024 and 2025 against the TRI data and they match [CALC].

| 2006–2015 | 2016–2025 |
|---|---|
| 2006 44.17 (+7.44) | 2016 9.56 (+4.48) |
| 2007 100.84 (+35.28) | 2017 57.46 (+22.25) |
| 2008 −60.04 (−3.95) | 2018 −1.66 (−1.98) |
| 2009 69.34 (−19.47) | 2019 10.55 (+0.52) |
| 2010 19.75 (+4.13) | 2020 19.95 (+3.13) |
| 2011 −16.07 (+10.00) | 2021 53.81 (+24.93) |
| 2012 38.80 (+5.17) | 2022 −5.45 (−10.36) |
| 2013 12.89 (+6.99) | 2023 41.71 (+17.05) |
| 2014 49.56 (+12.25) | 2024 21.33 (+6.58) |
| 2015 10.85 (+11.60) | 2025 −4.57 (−14.13) |

**Quarterly rebalancing (WP26 Exh.8, Exh.11; NSE's educational variant, Mom30):**
- SI return 17.12% vs 19.19% for the semi-annual index.
- Quarterly churn: FY22 148%, FY23 146%, FY24 147%, FY25 167%.

## 5. ETFs and index funds

ETFs on NSE (from ETFLIST). Column notes:
- **Listing** is the NSE listing date. The NFO/allotment date may differ (UNVERIFIED).
- **BER** and **TER** come from AMFI, as of 2026-09-28 unless stated. TER = BER + brokerage + transaction cost + statutory levies. Groww reports under the Direct-plan column.
- **Liquidity** is the mean / median daily traded value in ₹ cr, plus median trades per day, over 20 sessions on 1–29 Sep 2026 (BHAV) [CALC]. Reference: NIFTYBEES mean ₹176.45 cr/day.
- **AUM** is from WP26 Exh.12, as of 27-Feb-2026.

| Index | Symbol | Fund | Listing | BER % | TER % | ADTV mean / median (₹ cr) | Median trades | AUM ₹ cr |
|---|---|---|---|---|---|---|---|---|
| Mom30 | MOM30IETF | ICICI Pru Nifty 200 Momentum 30 ETF | 10-Aug-22 | 0.26 | 0.76 | 1.93 / 1.52 | 1,874 | 583 |
| Mom30 | MOMOMENTUM | Motilal Oswal Nifty 200 Momentum 30 ETF | 17-Feb-22 | 0.26 | 0.93 | 0.47 / 0.39 | 398 | 125 |
| Mom30 | HDFCMOMENT | HDFC NIFTY200 Momentum 30 ETF | 17-Oct-22 | 0.25 | 0.30 (24-Sep) | 0.62 / 0.47 | 648 | 96 |
| Mom30 | MOMENTUM | Aditya Birla SL Nifty 200 Momentum 30 ETF | 19-Aug-22 | 0.25 | 0.74 | 0.26 / 0.22 | 211 | 44 |
| Mom30 | MOMENTUM30 | Kotak Nifty 200 Momentum 30 ETF | 17-Oct-25 | 0.22 | 0.77 (27-Sep) | 0.43 / 0.07 | 95 | 6 |
| N500 Mom50 | MOMENTUM50 | Motilal Oswal Nifty 500 Momentum 50 ETF | 30-Sep-24 | 0.35 | 0.94 | 3.62 / 2.44 | 9,736 | 276 |
| N500 Mom50 | GROWWMOM50 | Groww Nifty 500 Momentum 50 ETF | 24-Apr-25 | 0.40 | 0.88 (29-Sep) | 0.22 / 0.19 | 540 | 22 |
| Mid150 Mom50 | MOMIDMTM | Motilal Oswal Nifty Midcap 150 Momentum 50 ETF | 03-Jul-25 | 0.45 | 1.06 | 0.56 / 0.40 | 348 | 27 |
| Mid150 Mom50 | SBIMIDMOM | SBI Nifty Midcap 150 Momentum 50 ETF | 06-Mar-26 | 0.25 | 0.41 | 0.39 / 0.28 | 172 | n/a |
| LV30 | LOWVOLIETF | ICICI Pru Nifty 100 Low Volatility 30 ETF | 10-Jul-17 | 0.36 | 0.48 | 4.44 / 2.98 | 9,830 | UNVERIFIED |
| LV30 | LOWVOL1 | Kotak Nifty 100 Low Volatility 30 ETF | 29-Mar-22 | 0.11 | 0.19 (27-Sep) | 1.12 / 0.63 | 7,110 | UNVERIFIED |
| LV30 | LOWVOL | Mirae Asset Nifty 100 Low Volatility 30 ETF | 31-Mar-23 | 0.29 | 0.43 | 0.02 / 0.02 | 14 | UNVERIFIED |
| LV30 | HDFCLOWVOL | HDFC NIFTY100 Low Volatility 30 ETF | 17-Oct-22 | 0.25 | 0.30 (24-Sep) | 0.04 / 0.01 | 72 | UNVERIFIED |
| Alpha50 | ALPHA | Kotak Nifty Alpha 50 ETF | 29-Dec-21 | 0.25 | 0.51 (27-Sep) | 6.16 / 4.68 | 3,223 | UNVERIFIED |
| Alpha50 | MOALPHA50 | Motilal Oswal Nifty Alpha 50 ETF | 10-Jul-25 | 0.45 | 0.96 | 0.10 / 0.05 | 86 | UNVERIFIED |
| AlphaLV30 | ALPL30IETF | ICICI Pru Nifty Alpha Low-Volatility 30 ETF | 18-Aug-20 | 0.36 | 0.60 | 1.61 / 0.76 | 884 | UNVERIFIED |
| Q30 | SBIETFQLTY | SBI Nifty 200 Quality 30 ETF | 17-Dec-18 | 0.25 | 0.34 | 0.15 / 0.03 | 67 | UNVERIFIED |
| Q30 | NIFTYQLITY | Aditya Birla SL Nifty 200 Quality 30 ETF | 19-Aug-22 | 0.25 | 0.34 | 0.10 / 0.06 | 186 | UNVERIFIED |
| Q30 | QUAL30IETF | ICICI Pru Nifty 200 Quality 30 ETF | 10-Aug-23 | 0.26 | 0.36 | 0.17 / 0.15 | 263 | UNVERIFIED |
| Q30 | QUALITY30 | Kotak Nifty200 Quality 30 ETF | 18-Jul-25 | 0.21 | 0.32 (27-Sep) | 0.02 / 0.01 | 56 | UNVERIFIED |

**Index funds** (not exchange-listed). Figures are AMFI Direct plan BER / total TER %, TER dated 24–29 Sep 2026; ₹ cr AUM at 27-Feb-2026 from WP26 where available.
- **Mom30:** UTI 0.38/0.89 (8,712); Motilal 0.28/0.83 (974); HDFC 0.31/0.81 (648); ICICI 0.27/0.78 (564); Kotak 0.17/0.77 (503); Bandhan 0.33/0.88 (133); SBI 0.34/0.93 (112); Baroda BNP 0.37/1.09 (23).
- **N500 Mom50:** Nippon 0.21/0.67 (1,084); Motilal 0.36/0.85 (725); Axis 0.15/0.65 (127); Bandhan 0.31/0.87 (30); Kotak 0.16/0.76 (17).
- **Mid150 Mom50:** Edelweiss 0.39/0.84 (1,452); Tata 0.38/0.82 (1,063); Kotak 0.24/0.73 (322).
- **LV30:** Bandhan 0.30/0.45; HDFC 0.34/0.49; Kotak 0.17/0.37; SBI 0.33/0.48.
- **Alpha50:** Bandhan 0.30/0.61; Kotak 0.30/0.79.
- **AlphaLV30:** Bandhan 0.24/0.55; Edelweiss 0.35/0.66; Kotak 0.20/1.27; Nippon 0.30/0.58; UTI 0.51/0.82.
- **Q30:** Bandhan 0.31/0.53; ICICI 0.33/0.49; Kotak 0.18/0.35; SBI 0.29/0.44; UTI 0.48/0.67.
- **Family totals (WP26):** 13 Mom30 funds with ₹12,523 cr AUM; 24 momentum-family passive funds with ₹17,667 cr in total.

**TER framework (SEBI26):**
- Regulations in force from 1-Apr-2026. Base expense ratio (BER) excludes statutory levies and transaction cost (Reg 66(7), (10)).
- BER limit for index funds/ETFs: 0.90% of daily net assets.
- Brokerage may be charged above BER, capped at 0.06% of trade value for cash trades and 0.02% for derivatives (Reg 66(9)).
- AMFI describes its transaction-cost column as the "annualized, cumulative daily average transaction cost incurred on trades executed during the reference period… reset monthly" (AMFI).

**Observed levies:** in Sep-2026 AMFI data, the "Statutory Levies (incl. GST)" component is 0.45–0.63% for every Mom30 scheme except HDFC's Mom30 ETF (0.05), versus 0.05–0.20% for LV30 and Q30 schemes. What these levies contain (e.g. STT or stamp duty on portfolio trades) is not defined on the page: UNVERIFIED.

## 6. Downloading index values and TRI from niftyindices.com

**Endpoints.** These are undocumented AJAX endpoints used by the Historical Data page [HIST], all verified on 2026-09-29. Send them as POST with `Content-Type: application/json; charset=utf-8`:
- **Price index (OHLC):** `https://www.niftyindices.com/BackPage/getHistoricaldatatabletoString`. Returns `[{INDEX_NAME, HistoricalDate:"10 Jun 2026", OPEN, HIGH, LOW, CLOSE}]` as strings. OHLC is "-" for early back-calculated dates (e.g. Mom30 01-Apr-2005 has only CLOSE = 1000.00).
- **TRI:** `https://www.niftyindices.com/BackPage/getTotalReturnIndexString`. Returns `[{"Index Name", Date, TotalReturnsIndex, NTR_Value}]`.
- **Valuation (P/E, P/B, dividend yield):** `https://www.niftyindices.com/BackPage/getpepbHistoricaldataDBtoString`. Returns `pe, pb, divYield, DATE`. It works for NIFTY 50 but returned `[]` for NIFTY200 MOMENTUM 30.
- **India VIX:** `/BackPage/BindHistoricalIndiaVixData` appears in the JS but is untested.

**Request body.** `cinfo` is a *string* containing a single-quoted pseudo-JSON object. Dates use the format `dd-MMM-yyyy`.
```bash
curl -s -X POST 'https://www.niftyindices.com/BackPage/getTotalReturnIndexString' \
  -H 'Content-Type: application/json; charset=utf-8' -H 'Referer: https://www.niftyindices.com/reports/historical-data' \
  -A 'Mozilla/5.0' \
  --data "{\"cinfo\":\"{'name':'NIFTY200 MOMENTUM 30','startDate':'01-Apr-2005','endDate':'29-Sep-2026','indexName':'NIFTY200 MOMENTUM 30'}\"}"
```

**Verified name strings:** `NIFTY200 MOMENTUM 30`, `NIFTY 200`, `NIFTY 50`, `NIFTY 100`, `NIFTY 500`, `NIFTY100 LOW VOLATILITY 30`, `NIFTY ALPHA 50`, `NIFTY ALPHA LOW-VOLATILITY 30`, `NIFTY500 MOMENTUM 50`, `NIFTY MIDCAP150 MOMENTUM 50`, `NIFTY200 QUALITY 30`.

**Rows returned by a single full-range TRI call:**
- NIFTY200 MOMENTUM 30: 5,332 rows from 01-Apr-2005.
- NIFTY 200: 5,647 rows from 01-Jan-2004.
- NIFTY 50: 6,779 rows from 30-Jun-1999.
- NIFTY 500: 7,867 rows from 01-Jan-1995.
- NIFTY ALPHA 50: 5,648 rows from 31-Dec-2003.

**Date-range limit:** the page JS has a comment "Date cannot be selected more than 1 year", added 28-08-2025. The limit is enforced in the browser only: the server returned multi-decade ranges on 2026-09-29. It may change, so throttle requests and check https://www.niftyindices.com/terms-of-use.

**Other files:**
- **Daily snapshot of all indices:** `https://www.niftyindices.com/Daily_Snapshot/ind_close_all_DDMMYYYY.csv`, with OHLC, change, volume, turnover, P/E, P/B, DY. Example, 29-09-2026: Nifty200 Momentum 30 closed at 29,530.1 with P/E 23.2, P/B 4.28 and DY 0.84.
- **Stock-level daily data (NSE bhavcopy):** `https://nsearchives.nseindia.com/products/content/sec_bhavdata_full_DDMMYYYY.csv`. On Sundays this archive serves the previous Friday's file, so dedupe on DATE1.

## 7. Replication spec: Nifty200 Momentum 30

**Inputs (all point-in-time):**
- NSE trading calendar.
- Daily closes adjusted for splits, bonuses and rights (no dividend adjustment).
- Nifty 200 membership as of each review, including announced changes.
- F&O underlying list on the effective date T.
- Listing dates.
- Shares outstanding × IWF (free float) as of W.
- Suspension and corporate-action flags.

**Algorithm:**
1. **Schedule.** For each year Y and each M ∈ {June, December}, define:
   - T = last NSE trading day of M;
   - C = last trading day of M−1;
   - C6 = last trading day of M−7;
   - C12 = last trading day of M−13;
   - W = the trading day 3 sessions before T.
2. **Universe.** U = Nifty 200 members (as known for this review) that meet all of:
   - listed ≥ 1 year as of C;
   - available in F&O on T;
   - not suspended;
   - if a scheme of arrangement occurred, ≥ 12 calendar months of ex-basis trading as of C.
3. **Returns.** For each i in U: R12 = P(C)/P(C12) − 1 and R6 = P(C)/P(C6) − 1, using price only.
4. **Volatility.** σ = SD of daily ln(P_t/P_{t−1}) over the 1 year ending C, × √252. Any constant annualisation factor cancels in step 6.
5. **Momentum ratios.** MR12 = R12/σ; MR6 = R6/σ.
6. **Z-scores.** Z12 = (MR12 − mean_U) / sd_U, and Z6 likewise. Do not winsorise. Z = 0.5·Z12 + 0.5·Z6.
7. **NMS.** NMS = 1 + Z if Z ≥ 0; otherwise NMS = 1/(1 − Z). Rank U by NMS, descending (rank 1 = best).
8. **Selection.**
   - First review: S = top 30.
   - Otherwise, let E = current constituents ∩ U. Constituents that have left Nifty 200 are dropped now, not earlier.
   - S = {rank ≤ 15} ∪ {i ∈ E : rank ≤ 45}.
   - If |S| > 30, remove members of E with rank > 15, worst rank first, until |S| = 30.
   - If |S| < 30, add the best-ranked i ∈ U \ S until |S| = 30.
9. **Weights at W.**
   - FFMC_i = P_i(W) × shares_i × IWF_i.
   - raw_i = FFMC_i × NMS_i; w_i = raw_i / Σraw.
   - cap_i = min(0.05, 5 × FFMC_i / Σ_{j∈S} FFMC_j).
   - Loop until no w_i > cap_i: set each violator to cap_i, then rescale the uncapped names in proportion to raw so that Σw = 1.
10. **Implementation.** Hold units N_i ∝ w_i / P_i(W) from the close of T−1 (i.e. the index is effective from the beginning of day T). In a close-to-close backtest, trade at the T−1 close.
11. **Between reviews.** Keep units fixed and let weights drift; there is no re-capping.
   - PR: price changes only; special dividends are adjusted in PR on the ex-date.
   - TR: TR_t = TR_{t−1} × [1 + ((PR_t + IndexedDividend_t)/PR_{t−1} − 1)], where IndexedDividend = dividend payout / base market cap of the index (M26 "Total Return Index Calculation").
12. **Ad hoc.** If a constituent is removed from Nifty 200 because of a merger, delisting, demerger or suspension, replace it to keep 30 names (next best by the latest NMS rank: UNVERIFIED). Then reset all weights "from drifted weights to original capping limits".
13. **Validate.**
   - Reproduce PR constituent changes, e.g. Jun-2026: 22 out / 22 in; Jun-2025: 20 / 20; Dec-2025: 19 / 19.
   - Match the current CSV.
   - Track the official PR/TRI series from §6.
   - Treat pre-25-Aug-2020 official values as NSE back-calculations.

## 8. UNVERIFIED / open items
- **Price adjustment.** Momentum returns: whether prices are corporate-action adjusted is not stated. Alpha and LowVol sections say "adjusted"; I assume the same here.
- **Listing-history date.** The reference date for the 1-year listing check is not stated; C is assumed.
- **Volatility details.** σ window end (C is implied), observation count, and whether SD is sample or population. Sample vs population rescales Z, which changes NMS weights but not ranks.
- **Ties and fill order.** Tie-breaking is unspecified. The fill order when |S| > 30 is my reading for Momentum 30; the 500/Midcap momentum sections state it explicitly.
- **Back-history.** Whether the F&O filter and buffers were applied in NSE's 2005–2020 back-calculation. How the base-date (01-Apr-2005) portfolio was formed, and whether the first rebalance was June 2005.
- **Cap denominator.** Whether "5 × weight based only on FFMC" means within the 30 selected stocks (assumed) or within the parent index. The redistribution algorithm is also unspecified.
- **Other indices.** Alpha 50's alpha definition; the Alpha Low-Vol 30 weight transform and its universe wording; the Nifty 500 impact-cost basket size.
- **ETFs.** NFO launch dates (NSE listing dates used instead); AUM for non-momentum ETFs.
- **WP26 figures.** The parent-index SI figures do not reconcile with the TRI data (§4c).
