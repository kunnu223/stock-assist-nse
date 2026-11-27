# Evidence for rules-based, long-only equity strategies in India (NSE) — momentum first

Compiled 2026-09-29. Conventions: TRI = total-return index, PR = price-return index, pp = percentage points,
"ann." = annualised. All figures are gross of costs/taxes unless stated. "(computed)" = my arithmetic on the cited
numbers (no new data). Source tags [n] map to URLs in the Sources list at the end. UNVERIFIED = could not confirm
against a primary/peer-reviewed source. AMC decks are marketing material but quote NSE Indices data.

## 0. Bottom line (details below)
- Indian cross-sectional momentum is real and large on paper: IIMA WML (12-1, long-short) 10.65%/yr ann. geometric,
  Jan-1994 to Dec-2025 [1]; long-only big-cap winners ~19.2% CAGR vs ~11.9% market, 1995-2025, gross (computed) [4][6].
- Live, investable versions deliver far less: Nifty200 Momentum 30 beat Nifty 200 TRI by +6.4 pp/yr in its back-tested
  FY06-FY20 window but +2.2 pp/yr in fully-live FY22-FY26 (computed) [35]; MSCI India Momentum +1.05 pp/yr live 2014-2025 (computed) [39].
- Crashes cluster in sharp rebounds (Apr-May 2009, Apr 2020), and the Sep-2024 to Apr-2025 slump took the Nifty200
  Momentum 30 down 31.8% [40] during a ~16% Nifty 200 correction [44], not a market crash.

## 1. Cross-sectional momentum in India

### 1.1 IIMA (Agarwalla-Jacob-Varma) factor data library — the free, survivorship-adjusted reference series
- URL: https://faculty.iima.ac.in/~iffm/Indian-Fama-French-Momentum/ (announced 2013 [8]); release 2025-12 covers
  Oct-1993 to Dec-2025; data from CMIE Prowess DX (paid DB), BSE+NSE stocks, 3 releases/yr [1].
- Construction: WML sorts on the 11-month return from end t-12 to t-1 (i.e. 12-1, skip month); winners = top 30%,
  losers = bottom 30%; "big" = top 10% of firms by market cap; WML = avg of (big W-L, small W-L) [3]. New series drops
  stocks below 10% of median market cap and median price < INR 1 (together 26.8% of stocks for 2020-21) [1].

| IIMA WML statistic | Value | Period / note | Src |
|---|---|---|---|
| Ann. geometric mean return | 10.65%/yr | since 01-Jan-1994, release 2025-12 | [1] |
| Ann. return / ann. volatility | 10.96% / 17.30% | drawdown page, Oct-1993 to Dec-2025 | [2] |
| Monthly mean / SD / ann. Sharpe-like ratio | 1.117% / 7.068% / 0.55 | 386 months Oct-1993..Dec-2025 (computed from CSV) | [4] |
| Worst months | -27.6% (Nov-2001), -25.0% (May-2009), -21.1% (Apr-2000), -20.3% (Dec-2008) | computed from CSV | [4] |
| Worst drawdown | -62.2%, 2000-03-08 to 2000-12-14, recovered 2005-03-02 (5.0 yrs) | | [2] |
| Original WP: mean / SD (ann. log) | 17.0% / 24.1% | Jan-1994..Dec-2013, Table 4 | [3] |
| Original WP abstract: avg annual WML | 21.9% (HML 15.3%, SMB ~0%, MRP 11.5%) | Jan-1994..Dec-2014 | [3] |
| Long-only big winners (WB) vs big losers (LB) | CAGR 19.19% vs 3.79%; max DD -61.0% vs -81.4% | Jan-1995..Dec-2025, value-weighted, monthly rebalanced, gross (computed) | [6] |
| Market proxy (MF+RF, approx.) | CAGR 11.89%, max DD -62.2% | same window (computed) | [4] |

### 1.2 Other Indian academic studies
| Study | Sample | Finding (numbers) | Src |
|---|---|---|---|
| Sehgal, Subramaniam & Morandiere 2012 (IJEF) | 493 BSE-500 constituents, Jan-1996..Dec-2010 | 6/6: winners 3.3%/mo vs losers 2.0%/mo; 12/12: 3.2% vs 2.4%; winner CAPM alpha 1.5%/mo (6/6), 1.3%/mo (12/12). Universe = firms that are BSE-500 members (my inference: likely a survivor-style design) | [9] |
| Sehgal & Jain 2012 (AJFA) | Sector returns, BRICKS, Jan-1993..Feb-2008 | India shows sector momentum for formation windows up to 12 months, persisting even for long windows | [10] |
| Agarwalla, Jacob, Varma, Vasudevan 2014 (IIMA WP) | Indian stocks to 2013 (start UNVERIFIED) | WML avg 22.29%/yr (vol 29.11%); BAB avg 29.10%/yr (vol 40.77%); BAB 4-factor alpha 1.08%/mo | [11] |
| Jacob, Pradeep & Varma 2022 (SSRN 4284686) | Apr-1995..Mar-2021 | Momentum factor avg 1.62%/mo, vol 7.16%; INR100 -> 6,988 (vs 9,345 for QMJ); avg momentum drawdown 12.13% | [12] |
| Ali & Joshi 2022 | ~110 largest NSE stocks, Apr-2014..Feb-2020 | 15 of 16 momentum strategies significant in 2014-16 boom; only 5 still beat benchmark in 2017-19 slowdown | [14] |
| Singh, Walia et al. 2022 (JEFAS) time-series momentum | BSE stocks, Jan-1996..Dec-2020, long-short | 12x1: 1.267%/mo (t=2.37); 12x3: 1.357%/mo; worst months Jun-2020, May-2009, Apr-2009 (see 2.2) | [13] |
| Ansari & Khan 2012 (Managerial Finance 38:206-223) | India | Momentum anomaly documented; numbers UNVERIFIED (paywalled) | [15] |
| Raju & Chandrasekaran 2019 (SSRN 3510433) | Long-only India momentum | Cited as long-only implementation study; numbers UNVERIFIED (SSRN blocked) | [16] |
| "How smart is a momentum strategy?" (Algorithmic Finance, 2023) | Indian equities | Long-only momentum delivers superior risk-adjusted performance; "accelerated momentum" underperforms. Numbers UNVERIFIED | [17] |
| "Relative, absolute or combined strength momentum: what works for India" (2024) | India | Combined relative+absolute strength beats plain price momentum. Numbers UNVERIFIED | [18] |
| "Are prominent equity market anomalies in India fading away?" (GBR 2019) | India | Value & momentum explained by risk models; size/volume effects faded vs earlier studies. Sample UNVERIFIED | [19] |

### 1.3 Index implementation: Nifty200 Momentum 30 (the de-facto Indian "risk-adjusted momentum" rule)
- Rules (methodology doc, Sep-2026): universe = Nifty 200 at review, >=1-yr listing, F&O-eligible; score = 50% z(12m
  return/sigma) + 50% z(6m return/sigma), sigma = 1-yr ann. SD of daily log returns; returns measured to last trading day
  of month M-1 for rebalance month M; top 30; weight = free-float mcap x score, cap min(5%, 5x mcap weight);
  rebalance Jun & Dec; buffer: top-15 forced in, holdings ranked >45 forced out [20].
- Launch 25-Aug-2020, base 01-Apr-2005 (so 2005-2020 is back-test) [21].

| As of 31-Aug-2026 (TRI) | 1Y | 5Y CAGR | Since base | SD since base | Base date | Src |
|---|---|---|---|---|---|---|
| Nifty200 Momentum 30 | 6.38% | 11.02% | 18.70% | 22.33% | Apr-2005 | [21] |
| Nifty 200 | 4.51% | 10.42% | 13.84% | 20.84% | Jan-2004 | [22] |
| Nifty 50 | -0.35% | 8.32% | 12.38% | 22.42% | Nov-1995 | [23] |
| Nifty500 Momentum 50 (launched 04-Jun-2024) | 12.02% | 14.63% | 21.76% | 22.41% | Apr-2005 | [27] |
| Nifty Midcap150 Momentum 50 (launched 16-Aug-2022) | 10.49% | 18.11% | 22.73% | 21.13% | Apr-2005 | [28] |
| Nifty 500 / Nifty Midcap 150 | 5.34% / 14.13% | 11.13% / 17.83% | 12.14% / 17.21% | 21.93% / 20.78% | 1995 / Apr-2005 | [24][26] |

- Same-window comparison (01-Apr-2005..30-Jun-2026): N200M30 TRI 18.8% CAGR vs Nifty 200 TRI 13.9% vs Nifty 50 TRI 13.6% [35];
  to 30-Jun-2025 it was 19.9% vs 14.7% [36].
- Trailing CAGR to 30-Jun-2026 (N200M30 / N200 / N50 TRI): 1Y -2.5/-2.2/-5.4; 3Y 14.1/12.1/8.8; 5Y 12.6/11.8/10.0;
  10Y 17.8/13.5/12.5 [35]. Daily rolling 1Y return avg 22.3% vs 16.4% (SD of rolling 1Y 28.6% vs 24.8%), Apr-2005..Jun-2026 [35].
- Fiscal-year TRI returns (N200M30 vs Nifty 200) [35]: FY08 40.9/23.5; FY09 -34.9/-38.5; FY10 62.9/86.4; FY20 -16.4/-26.1;
  FY21 62.4/74.6; FY22 37.7/21.4; FY23 -9.2/-1.1; FY24 70.0/38.3; FY25 -7.6/6.4; FY26 -3.4/-2.8. Beat Nifty 200 in 14/21 FYs [35].
- Turnover: momentum index churn "~100%" [37]; MSCI India Momentum turnover 207.04% (last 12m to Aug-2026) [39].
  ICICI Pru N200M30 index fund TER 0.78% (31-Aug-2026) of which statutory levies 0.47% [65].

### 1.4 Momentum variants — what exists for India
| Variant | Best evidence (market, period, number) | Indian evidence | Src |
|---|---|---|---|
| Volatility-adjusted score (return/sigma) | Used by all Nifty momentum indices (above) | No peer-reviewed India test vs raw 12-1 located — UNVERIFIED | [20] |
| 52-week-high | George & Hwang 2004 (US; sample period not re-checked): 52WH risk-adjusted 0.86%/mo vs 0.38% JT and 0.25% industry momentum (all months); raw returns ~0.45%/mo each | None peer-reviewed located — UNVERIFIED | [50] |
| Residual momentum | Blitz, Huij & Martens 2011 (US, Jan-1930..Dec-2009): risk-adjusted profits ~2x total-return momentum, more consistent | None located — UNVERIFIED | [51] |
| Frog-in-the-pan (information discreteness) | Da, Gurun & Warachka 2014 (US): momentum 5.94% for continuous-information stocks vs -2.07% for discrete | None located — UNVERIFIED | [52] |
| Recency weighting | Capitalmind PMS (vendor, back-test): older-weighted version +2% vs recency-weighted -8%, Sep-2024..May-2026 | Practitioner only | [43] |

## 2. Momentum crashes and mitigation

### 2.1 Core (mostly US) evidence
| Paper | Sample | Key numbers | Src |
|---|---|---|---|
| Daniel & Moskowitz 2016 (JFE) | US 1927:01..2013:03 | Winner decile 15.3%/yr excess, loser -2.5%/yr; WML mean 17.9%/yr, vol 30.0%. Jul-Aug 1932: losers +232%, winners +32% (mkt +82%). Mar-May 2009: losers +163%, winners +8% (mkt +26%). Dynamic (mean/variance-forecast) WML ~doubles alpha & Sharpe; multi-asset dynamic Sharpe 1.19 | [45] |
| Barroso & Santa-Clara 2015 (WP 2012 via CXO) | US Jul-1926..Dec-2011 | Scale WML to 12% target vol using 6-month realised daily vol: return 14.5%->16.5%/yr, vol 27.5%->17.0%, Sharpe 0.53->0.97, worst month -80.0%->-28.4%, worst drawdown -97.0%->-45.2%; plain WML lost 91.6% (Jul-Aug 1932) and 73.4% (Mar-May 2009) | [46] |
| Han, Zhou & Zhu (Sep-2016 version via CXO) | US Jan-1926..Dec-2013, 6-month EW decile long-short | 15% stop-loss: 0.99%->1.93%/mo, SD 6.01%->4.61%, monthly Sharpe 0.17->0.40, worst month -49.8%->-17.4%; winner-side turnover 39%->49%/mo. Earlier version (1926-2011, 10% stop): worst month -49.79%-> -11.34% | [47] |
| Faber 10-month SMA (2013 update) | S&P 500 1901-2012 | CAGR 9.32% (buy-hold) vs 10.18% (timing); max DD 83.66% vs 42.24%; invested ~70% of time; <1 round-trip/yr; lags in ~half of years; costs/taxes excluded | [48] |
| Antonacci dual momentum (2012) | Jan-1974..Dec-2011, US vs EAFE+ with T-bill absolute filter | 15.79%/yr, SD 12.77%, Sharpe 0.73, max DD -23.01% vs US index 11.49%/15.86%/0.35/-50.65%; relative-only (no absolute filter) max DD -54.56% | [49] |

### 2.2 Indian crash episodes
| Episode | Long-short / academic | Long-only index | Market | Src |
|---|---|---|---|---|
| 2000-01 dot-com | WML -62.2% (Mar-2000..Dec-2000; 5.0 yrs to recover); big winners -61.0% (Feb-2000..Sep-2001, computed) | MSCI India Momentum max DD -75.92% (2000-02-21..2001-09-21) | MSCI India max DD is 2008 (-63.91%) | [2][6][39] |
| 2008 fall | WML -27.2% (2007-11-16..2008-07-10); CY2008 WML -9.59%; CY2008 big winners -57.6% vs big losers -48.3% | N200M30 FY09 -34.9% vs N200 -38.5%; CY2008 ~-9 pp vs Nifty 50 (chart label, approx.); peak-to-trough -67.9% vs Nifty 50 -64.6% (secondary, UNVERIFIED) | IIMA ERP -67.4% (2008-01-07..2008-10-27; recovered 2021-01-12) | [2][5][7][35][38][41] |
| 2009 rebound (the real crash) | WML -53.1% (2008-12-01..2009-09-09; recovered 2011-12-20); Mar/Apr/May-2009 WML -6.42/-18.33/-25.00% while market premium +8.10/+14.67/+33.55%; CY2009 big winners +87.5% vs big losers +140.9% | N200M30 FY10 +62.9% vs N200 +86.4% | Market premium CY2009 +87.8% | [2][4][5][7][35] |
| Mar-2020 COVID | WML -28.2% (2020-03-26..2020-12-16; recovered 2022-01-07); Apr-2020 WML -13.48% vs market +13.88%; TSMOM worst month Jun-2020 (37.49% loss, mkt +7.09%) | N200M30 -34.21% (2020-02-19..2020-03-23, recovered 2020-09-17); FY21 +62.4% vs +74.6%; MSCI India Momentum CY2020 +5.62% vs MSCI India +18.64% | Nifty 50 -39.6% (secondary) | [2][4][13][40][35][39][41] |
| Sep-2024..2026 rotation | No >20% WML drawdown listed; WML Oct-Dec 2024 +2.30/+2.27/+2.74%, CY2025 -5.53% | N200M30 -31.79% (2024-09-27..2025-04-07, unrecovered as of Aug-2025); FY25 -7.6% vs +6.4%; PR -2.77% for 12m to Jul-2026; "4th-deepest drawdown in 21 years" (Jun-2026) | Nifty 200 ~-16% over 165 days (to Mar-2025); IIMA ERP -24.8% (2024-09-30..2025-02-28) | [2][4][5][40][35][42][44] |

- Pattern: long-only Indian momentum falls roughly with the market in crashes, then lags badly in the rebound
  (FY10 -23.5 pp, FY21 -12.2 pp vs Nifty 200, computed) [35] — consistent with Daniel-Moskowitz "losers crash up" [45].
- 2024-25 differs: the long-short factor held up [4] while the long-only index fell 31.8% [40], i.e. the loss came from
  concentrated sector/beta exposure (index beta 1.19 vs Nifty 50 over 5Y) [21] in a falling, rotating market.

### 2.3 Indian evidence on mitigation
- Singh et al. 2022: 3 of the 5 worst Indian TSMOM months fall in market recoveries (Jun-2020, May-2009, Apr-2009);
  their own risk-managed TSMOM earns 3.214%/mo vs 1.267%/mo (12x1), BSE 1996-2020, in-sample, long-short [13].
- No peer-reviewed Indian test of Barroso-Santa-Clara vol-scaling, Han-Zhou-Zhu stops, or a Faber 10-month SMA
  overlay on a long-only momentum portfolio was found — UNVERIFIED.
- Practitioners: Zerodha (Sep-2026) compared N200M30 vs a Nifty/gold dual-momentum portfolio over ~5 years; momentum
  had higher CAGR but the deepest drawdown; numbers only in charts [66]. Capitalmind adds drawdown-triggered cash calls
  to its momentum PMS (live since May-2026 in revised form; no track record yet) [43].
- Regime context: Indian equity premium over T-bills took 13.0 years (Jan-2008..Jan-2021) to recover its -67.4% drawdown [2].

## 3. Other Indian anomalies (one or two lines each)
| Anomaly | Indian evidence | Live index check (5Y TRI to 31-Aug-2026) | Data a retail user needs | Src |
|---|---|---|---|---|
| Low volatility | Low-vol decile 11.40%/yr excess vs 1.30% high-vol, Jan-2001..Jun-2015; persists in up and down markets. BAB 4-factor alpha 1.08%/mo (to 2013) | Nifty100 Low Vol 30 10.47% vs Nifty 100 8.97%; since Apr-2005 16.92%, SD 16.83% vs Nifty 100 SD 20.93%; bear-phase CAGR -25.6% (BSE Low Vol) vs -41.9% Nifty 200 (2009-2024) | Prices only — free | [53][11][29][25][37] |
| Quality | QMJ 4-factor alpha 0.92%/mo; long-only quality 0.69%/mo; Apr-1995..Mar-2021 | Nifty100 Quality 30 9.51% vs 8.97%; Nifty200 Quality 30 8.88% vs Nifty 200 10.42% | Point-in-time ROE/leverage/earnings — not free (IIMA uses CMIE Prowess) | [12][30][31][1] |
| Value | HML 6.61%/yr since Jan-1994; worst DD -64% (1994-12..2002-07, 7.6 yrs), -51.9% (2018-01..2022-01). Low vs high P/B 3.2% vs 1.49%/mo (1996-2010) | Nifty50 Value 20 8.18% vs Nifty 50 8.32%; Nifty200 Value 30 26.23% vs 10.42% (launched Jun-2024); BSE Enhanced Value beat Nifty 200 in 27.7% of 10Y rolling windows (2005-2024) | PIT book value/earnings — not free | [1][2][9][32][33][37] |
| Size | SMB -3.71%/yr since Jan-1994; -86.6% drawdown from Jan-1995, trough Mar-2009, never recovered. Contrast: +4.4%/mo small-minus-big (t=5.25) in a BSE-500-constituent sample (1996-2010; likely survivor-style) | n/a | Prices + shares — free | [1][2][9] |
| Short-term reversal | Short-term contrarian profits confined to small/mid, low-volume stocks (dissertation); magnitude UNVERIFIED | n/a | Prices — free, but high turnover | [57] |
| Post-earnings drift | Top-minus-bottom SUE decile drift 4.8% over days +2..+64 (P10 +3.4%, P1 -1.4%), quarterly, 2002Q4..2017Q3 | n/a | Quarterly EPS history + announcement dates (PIT) — not free | [55] |
| Turn-of-month | Significant positive return on 1st trading day of month (Sensex, Nifty 50); no end-of-month effect; magnitude UNVERIFIED | n/a | Index prices — free | [56] |

## 4. Survivorship and look-ahead bias magnitudes
| Source | Market / period | Bias studied | Magnitude | Src |
|---|---|---|---|---|
| Daniel, Sornette & Wohrmann 2009 (JPM) | CRSP 1926-2006, running top-500 | Look-ahead benchmark bias (using end-of-period S&P 500 members) | Up to 8%/yr; overstates Sharpe, understates drawdowns | [59] |
| Ranse 2026 (arXiv, not peer-reviewed) | NIFTY Smallcap 250, 1,437 stocks, 2016-2025 | Current constituents vs all historical members, equal-weight | +4.94 pp/yr (26.17% vs 21.23%), Sharpe +0.097; 82.5% turnover (16.1% delisted, 33.1% graduated, 33.2% demoted); rebuilt from NSE bhavcopy incl. delisted stocks | [58] |
| Bias Ledger blog 2026 (not peer-reviewed) | S&P 500 vintages | Survivor-only universe | +0.39 pp/yr (2010 vintage, 16.6 yrs), +1.02 pp/yr (2015 vintage, 11.6 yrs); single years -7.5 to +3.5 pp; its India claim (+0.8 to +3.2 pp) UNVERIFIED | [61] |
| IIMA WP 2013 | India 1994-2013, value-weighted | "Vanishing companies" (100% loss if last price < 50% of face value) | SMB -0.1 pp/yr, HML -0.2 pp/yr; no vanishing firms detected after mid-1990s | [3][1] |
| Shumway & Warther 1999 / Shumway 1997 | CRSP Nasdaq / NYSE-AMEX | Missing delisting returns | Nasdaq bias 4.7x NYSE/AMEX; use -55% for missing performance delistings (Nasdaq); ~-30% NYSE/AMEX (secondary) | [60] |
| McLean & Pontiff 2016 (JF) | 97 US predictors | Data-mining + publication decay | Returns 26% lower out-of-sample, 58% lower post-publication | [62] |
- Momentum-specific: the classic crash is on the short/loser leg [45], so delisting bias bites long-short tests most;
  for long-only winners the bigger risk is universe look-ahead (today's large caps were yesterday's winners) [59][58].
  Sehgal et al.'s Indian sample is 493 BSE-500 constituents, likely a survivor-style design (inference) [9].

## 5. Realistic expectations: live vs back-test, and how long bad spells last

### 5.1 Live vs back-tested excess return
| Strategy (launch) | Back-test window excess | Live window excess | Src |
|---|---|---|---|
| Nifty200 Momentum 30 TRI vs Nifty 200 TRI (25-Aug-2020) | FY06-FY20: 17.34% vs 10.96% = +6.38 pp/yr (computed) | FY22-FY26: 13.66% vs 11.42% = +2.24 pp/yr (computed); FY21 launch year -12.2 pp; 5Y to Aug-2026 +0.60 pp | [35][21][22] |
| MSCI India Momentum vs MSCI India, gross INR (11-Dec-2013) | Since May-1996 (mostly back-test): 13.86% vs 12.46% = +1.40 pp/yr | CY2014-2025: 14.30% vs 13.25% = +1.05 pp/yr (computed); lagged in 7 of 12 years | [39] |
| Nifty100 Low Vol 30 (Jul-2016) / Nifty100 Quality 30 (Mar-2015) / Nifty50 Value 20 (Mar-2014) | n/a | 5Y to Aug-2026 vs parent: +1.50 / +0.54 / -0.14 pp/yr | [29][30][32][25][23] |
| Nifty Alpha 50 (Nov-2012) | Since Dec-2003: 20.62% | 5Y to Aug-2026: 14.49% vs Nifty 500 11.13% (different parent universe) | [34][24] |
| Capitalmind Adaptive Momentum PMS (live >7 yrs, vendor claim) | n/a | CAGR >17% vs Nifty 50 TRI 12.5%; last ~2 yrs about -8%/yr vs -1.0%/yr | [43] |
| US smart-beta indexes (238 ETFs, 2000-2018) | +2.77%/yr before ETF listing | -0.44%/yr after listing (JFQA: ~3% -> -0.5% to -1%) | [63] |
| Vanguard 2012 study of new indexes | 87% beat US market in back-test period | 51% after launch | [64] |

### 5.2 Persistence of drawdowns / underperformance
| Series | Longest bad spells | Src |
|---|---|---|
| IIMA WML (long-short) | 5.0 yrs (2000-03..2005-03), 3.0 yrs (2008-12..2011-12), 1.9 yrs (2013-08..2015-07), 1.8 yrs (2020-03..2022-01) | [2] |
| IIMA HML / SMB / equity premium | HML 7.6 and 4.0 yrs; SMB underwater since Jan-1995 (30.9 yrs); ERP 11.3 yrs (1994-2006) and 13.0 yrs (2008-2021) | [2] |
| Nifty200 Momentum 30 absolute drawdowns (since 2010) | -26.34% 2010-11..2012-11 (2.0 yrs); -28.39% 2021-10..2023-08 (1.9 yrs); -16.76% 2018-08..2020-01 (1.4 yrs); avg recovery 191 days; -31.79% from 2024-09-27, unrecovered Aug-2025 | [40] |
| Nifty200 Momentum 30 vs Nifty 200 (FY) | Lagged in 7 of 21 FYs (FY07, FY10, FY19, FY21, FY23, FY25, FY26), incl. back-to-back FY25-FY26 (computed); trailed Nifty 50 from Mar-2024 to Mar-2026 | [35][42] |
| Rolling odds of beating Nifty 200 TRI (16-Sep-2005..31-Jan-2024) | Momentum 1Y 74.7%, 3Y 87.8%, 5Y 98.7%, 7Y/10Y 100%; Value 10Y 27.7%. Window ends just before the 2024-26 slump | [37] |
| MSCI India Momentum (live) | 3 straight calendar years behind parent right after launch (2014, 2015, 2016); also 2018, 2020, 2023, 2025 | [39] |

## Implications for a retail momentum system
- Budget for ~1-2 pp/yr of gross excess return over the parent index, not the 5-6 pp in back-tests: live FY22-FY26
  +2.2 pp vs back-test +6.4 pp [35]; MSCI India Momentum live +1.05 pp [39]; smart-beta indexes fall ~3 pp/yr after
  launch [63]. With 100-200%/yr turnover [37][39], costs and taxes can take most of that margin.
- Plan for -30 to -35% drawdowns in ordinary shocks and rotations (COVID 2020: -34.2%; 2024-25 with no market crash:
  -31.8%) [40] and -60 to -75% in systemic
  bears (MSCI India Momentum -75.9% in 2000-01 [39]; IIMA big winners -61% [6]). Per-trade stop sizing does not cap these.
- The worst months come in sharp rebounds (Apr-May 2009, Apr 2020) [4][13][45]. A market trend filter (Faber SMA)
  mainly cuts bear-market drawdowns (US 83.7% -> 42.2%) [48] and does not fix rebound lag (FY10, FY21) [35]. Vol-scaling
  and stop-losses are proven only in US long-short data [46][47]; test them out-of-sample on Indian data before relying on them.
- Backtests must use point-in-time universes: historical Nifty 200/500 membership plus delisted stocks (NSE bhavcopy
  includes them [58]). Using today's constituents can inflate returns by ~5 pp/yr in small caps [58] and up to 8 pp/yr
  in US large caps [59]; the risk is highest for equal-weighted small/mid-cap tests.
- Start from the NSE recipe, which needs only prices: 6m and 12m return divided by 1-yr volatility, z-scored, top 30 from
  an F&O-eligible large/mid universe, a 15-in/45-out rank buffer and semi-annual rebalancing [20]. Use the free IIMA WML
  CSV [4] to check that your backtest's good and bad years match the reference factor.
- Drop the 70% win-rate framing for this factor: the flagship Nifty200 Momentum 30 beat its parent in 14 of 21 fiscal years [35];
  MSCI's live momentum index did so in only 5 of 12 years [39]. Judge the system on multi-year excess return and drawdown.
- Commit to a 3-5 year evaluation window before judging the system: WML stayed underwater for 5 years [2], the MSCI
  index lagged for 3 straight years after launch [39], and N200M30 lagged in FY25-FY26 [35].
- Price-only complements are free: low volatility (5Y +1.5 pp, lower SD, shallower bear-market losses) [29][37]. Quality,
  value and PEAD need point-in-time fundamentals a retail user cannot get free [12][55]; use index products as proxies.
- Avoid heavy recency weighting: in the 2024-26 sideways market a recency-weighted momentum lost ~8% while a
  longer-lookback version gained ~2% (vendor back-test) [43].
- Be sceptical of small-cap or size-tilted momentum backtests: the value-weighted, survivorship-adjusted SMB is -3.7%/yr
  since 1994 [1], while a BSE-500-constituent study reports small-minus-big of +4.4%/mo [9].

## Sources
1. IIMA data library (release 2025-12): https://faculty.iima.ac.in/~iffm/Indian-Fama-French-Momentum/
2. IIMA drawdown tables: https://faculty.iima.ac.in/~iffm/Indian-Fama-French-Momentum/drawdown.php
3. Agarwalla, Jacob, Varma (2013) WP 2013-09-05: https://faculty.iima.ac.in/~iffm/Indian-Fama-French-Momentum/four-factors-India-90s-onwards-IIM-WP-Version.pdf
4. IIMA monthly factors CSV: https://faculty.iima.ac.in/~iffm/Indian-Fama-French-Momentum/DATA/2025-12_FourFactors_and_Market_Returns_Monthly_SurvivorshipBiasAdjusted.csv
5. IIMA yearly factors CSV: https://faculty.iima.ac.in/~iffm/Indian-Fama-French-Momentum/DATA/2025-12_FourFactors_and_Market_Returns_Yearly_SurvivorshipBiasAdjusted.csv
6. IIMA size-momentum monthly CSV: https://faculty.iima.ac.in/~iffm/Indian-Fama-French-Momentum/DATA/2025-12_Size_Momentum_Portfolio_Returns_Monthly_SurvivorshipBiasAdjusted.csv
7. IIMA size-momentum yearly CSV: https://faculty.iima.ac.in/~iffm/Indian-Fama-French-Momentum/DATA/2025-12_Size_Momentum_Portfolio_Returns_Yearly_SurvivorshipBiasAdjusted.csv
8. Varma blog (2013-10-06): https://jrvarma.wordpress.com/2013/10/06/fama-french-and-momentum-factors-data-library-for-indian-market/
9. Sehgal, Subramaniam, Morandiere (2012) IJEF 4(4): https://ccsenet.org/journal/index.php/ijef/article/download/15919/10681
10. Sehgal & Jain (2012) AJFA 4(1): http://www.macrothink.org/journal/index.php/ajfa/article/download/1560/1476
11. Agarwalla, Jacob, Varma, Vasudevan (2014) BAB, IIMA WP 2014-07-01: https://iima.ac.in/sites/default/files/rnpfiles/5848695332014-07-01.pdf
12. Jacob, Pradeep, Varma (2022) quality factor (summary; SSRN 4284686): https://quantpedia.com/performance-of-factor-strategies-in-india/ ; https://www.iimaglobal.org/sites/default/files/2022-12/Wp-2022-11-01.pdf
13. Singh, Walia et al. (2022) JEFAS 27(54): http://www.scielo.org.pe/pdf/jefas/v27n54/2218-0648-jefas-27-54-328.pdf
14. Ali & Joshi (2022): https://iaras.org/iaras/filedownloads/ijems/2022/007-0002(2022).pdf
15. Ansari & Khan (2012) citation: https://link.springer.com/chapter/10.1007%2F978-81-322-3748-8_5
16. Raju & Chandrasekaran (2019) citation: https://github.com/SpagetBakemono/MomentumStrat
17. Algorithmic Finance (2023): https://journals.sagepub.com/doi/10.3233/AF-220399
18. Relative/absolute/combined momentum India (2024): https://www.researchgate.net/publication/382879990_Relative_absolute_or_combined_strength_momentum_strategies_what_works_for_India
19. Anomalies fading? GBR (2019): https://journals.sagepub.com/doi/pdf/10.1177/0972150918811248
20. NSE Indices methodology (Sep-2026): https://www.niftyindices.com/Methodology/Method_NIFTY_Equity_Indices.pdf
21. Nifty200 Momentum 30 factsheet (31-Aug-2026): https://www.niftyindices.com/Factsheet/Factsheet_Nifty200_Momentum30.pdf
22. Nifty 200 factsheet: https://www.niftyindices.com/Factsheet/ind_nifty_200.pdf
23. Nifty 50 factsheet: https://www.niftyindices.com/Factsheet/ind_nifty50.pdf
24. Nifty 500 factsheet: https://www.niftyindices.com/Factsheet/ind_nifty_500.pdf
25. Nifty 100 factsheet: https://www.niftyindices.com/Factsheet/ind_nifty_100.pdf
26. Nifty Midcap 150 factsheet: https://www.niftyindices.com/Factsheet/ind_Nifty_Midcap_150.pdf
27. Nifty500 Momentum 50 factsheet: https://www.niftyindices.com/Factsheet/FactsheetNifty500Momentum50.pdf
28. Nifty Midcap150 Momentum 50 factsheet: https://www.niftyindices.com/Factsheet/Factsheet_NiftyMidcap150Momentum50.pdf
29. Nifty100 Low Volatility 30 factsheet: https://www.niftyindices.com/Factsheet/Nifty100_LowVolatility30.pdf
30. Nifty100 Quality 30 factsheet: https://www.niftyindices.com/Factsheet/Nifty100_Quality30.pdf
31. Nifty200 Quality 30 factsheet: https://www.niftyindices.com/Factsheet/Factsheet_NIFTY200_Quality30.pdf
32. Nifty50 Value 20 factsheet: https://www.niftyindices.com/Factsheet/Nifty50_Value20.pdf
33. Nifty200 Value 30 factsheet: https://www.niftyindices.com/Factsheet/Factsheet_Nifty200_Value30.pdf
34. Nifty Alpha 50 factsheet: https://www.niftyindices.com/Factsheet/Factsheet_Nifty_Alpha50.pdf
35. HDFC AMC N200M30 deck (Jul-2026, NSE data): https://files.hdfcfund.com/s3fs-public/Others/2026-07/HDFC%20NIFTY200%20Momentum%2030%20Index%20Fund_PPT%20(July%202026).pdf
36. HDFC AMC deck (Jul-2025): https://files.hdfcfund.com/s3fs-public/Others/2025-07/Presentation%20-%20HDFC%20NIFTY200%20Momentum%2030%20Index%20Fund%20(July,%202025).pdf?VersionId=35sXXgnfP4q4mDYBYv4Qks_pMfJaQCAK
37. Motilal Oswal AMC deck (31-Jan-2024): https://www.motilaloswalmf.com/CMS/assets/uploads/Documents/02ed0-motilal-oswal-nifty-200-momentum-30-etf-index-fund-presentation-31-jan-24-rd.pdf
38. Baroda BNP Paribas AMC NFO deck (data to 31-Aug-2024): https://www.barodabnpparibasmf.in/assets/download_documents/BBNPP-Nifty-200-Momentum-30-Index-Fund-NFO.pdf
39. MSCI India Momentum Index factsheet (31-Aug-2026): https://www.msci.com/documents/10199/4237fd0a-2d3a-44ba-98d9-2b1cc75353fc
40. Wright Research (02-Aug-2025) drawdown table: https://www.wrightresearch.in/blog/momentum-strategies-underperforming-2025-data-insights/ ; Jul-2026 review: https://www.wrightresearch.in/blog/how-did-the-nifty200-momentum-30-perform-in-july-2026/
41. Curious Investor substack (17-Mar-2025, secondary): https://curiousinvestinginsights.substack.com/p/momentum-or-mayhem-unpacking-the
42. ET Prime (19-Jun-2026): https://economictimes.indiatimes.com/prime/money-and-markets/market-darling-to-drawdown-why-momentum-stocks-are-losing-steam/primearticleshow/131614466.cms
43. Capitalmind (22-Sep-2026): https://www.capitalmind.in/insights/adaptive-momentum-rebuilt
44. Economic Times (Mar-2025): http://economictimes.indiatimes.com/markets/stocks/news/slow-motion-collapse-investors-trapped-in-stock-market-correction-twice-as-long-as-usual/articleshow/118915175.cms
45. Daniel & Moskowitz (2016) JFE: https://spinup-000d1a-wp-offload-media.s3.amazonaws.com/faculty/wp-content/uploads/sites/3/2019/09/Mom_crashes_JFE_final.pdf
46. Barroso & Santa-Clara (CXO summary of SSRN 2041429): https://www.cxoadvisory.com/20697/momentum-investing/avoiding-momentum-strategy-crashes/
47. Han, Zhou, Zhu (CXO summary of SSRN 2407199): https://www.cxoadvisory.com/25071/technical-trading/stop-losses-to-avoid-stock-momentum-crashes/ ; abstract: https://www.researchgate.net/publication/272247075_Taming_Momentum_Crashes_A_Simple_Stop-Loss_Strategy
48. Faber (2013 update, SSRN 962461): https://mebfaber.com/wp-content/uploads/2016/05/SSRN-id962461.pdf
49. Antonacci (2012, SSRN 2042750): https://trendfollowing.com/whitepaper/SSRN-id2042750.pdf
50. George & Hwang (2004) JF: http://docs.wixstatic.com/ugd/57a19e_22a5d196fa1f4d7080f6069e7ae7b211.pdf
51. Blitz, Huij, Martens (2011) JEF: https://repub.eur.nl/res/pub/22252/ResidualMomentum-2011.pdf
52. Da, Gurun, Warachka (2014) RFS abstract: https://www.researchgate.net/publication/228259308_Frog_in_the_Pan_Continuous_Information_and_Momentum
53. Volatility effect India (Applied Finance Letters, 2016): https://ojs.aut.ac.nz/applied-finance-letters/1/article/download/32/31/61
54. Volatility effect, Nifty 500 past+present members (TEL 2019): https://content.scirp.org/pdf/tel_2019082918022806.pdf
55. Harshita, Singh, Yadav (2018) PEAD India: https://file.scirp.org/pdf/TEL_2018102515432009.pdf
56. Day-of-month / turn-of-month India (IJMEC): https://ijmec.org.in/index.php/ijmec/article/download/143/89
57. MTSU dissertation, Indian contrarian/momentum: https://jewlscholar.mtsu.edu/items/fc2019d4-d85f-44e0-8b2e-fc2d4428a1af
58. Ranse (2026) arXiv 2603.19380: https://arxiv.org/abs/2603.19380
59. Daniel, Sornette, Wohrmann (2009) JPM 36(1): https://arxiv.org/abs/0810.1922
60. Shumway & Warther (1999) abstract: http://www-personal.umich.edu/~shumway/papers.dir/nasdb.html ; ~30% haircut summary: http://quantra.quantinsti.com/community/t/how-do-you-actually-use-survivorship-bias-free-data-i-e-the-nans-after-delisting/26767/2
61. Bias Ledger issue #10 (13-Aug-2026): https://financebroski.substack.com/p/issue-10-the-bug-that-was-bigger
62. McLean & Pontiff (2016) JF 71(1): https://www.lharesearch.com/wp-content/uploads/2020/08/research-destroy-predictability.pdf
63. Huang, Song, Xiang, "The Smart Beta Mirage" (JFQA): https://www.cambridge.org/core/journals/journal-of-financial-and-quantitative-analysis/article/smart-beta-mirage/35CA1CEA091A485DDA960BB2D9930BC9 ; https://www.cxoadvisory.com/big-ideas/endemic-data-snooping-in-smart-beta-offerings/
64. Vanguard "Joined at the hip" (2012) summary: https://www.planadviser.com/vanguard-principal-advises-against-rearview-mirror-investing/3/
65. ET Money, ICICI Pru Nifty 200 Momentum 30 Index Fund TER breakdown: https://www.etmoney.com/mutual-funds/icici-prudential-nifty-200-momentum-30-index-fund-direct-growth/42825
66. Zerodha "In The Money" (21-Sep-2026): https://inthemoneybyzerodha.substack.com/p/dual-momentum-when-to-buy-and-when
