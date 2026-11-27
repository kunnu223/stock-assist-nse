# All-in costs & taxes: NSE cash-equity delivery + equity ETFs (retail resident, Rs 1–10 lakh, monthly rebalance)

Status date: 2026-09-29. Broker/exchange pages fetched on 2026-09-29. Source tags `[S#]` resolve to URLs in the Sources list (just above the final table).
Access notes: `incometaxindia.gov.in` and `nseindia.com` returned HTTP 403 to direct fetch; statutory text marked "(snippet)" was read from search-result extracts of those URLs, and some Income-tax Act 2025 text comes from secondary mirrors (eztax.in, myITreturn). NSE circulars were read from `nsearchives.nseindia.com` PDFs.

## 0. Key facts (TL;DR)

- Delivery STT is 0.1% on buy + 0.1% on sell. It did NOT change in Budget 2025 or Budget 2026; only F&O STT changed (1 Oct 2024 and 1 Apr 2026) [S1][S2][S3].
- Zerodha delivery round trip (no slippage) = 0.2225% of traded value (proportional) + Rs 15.34 DP per scrip per sell day → 0.376% at Rs 10k, 0.284% at Rs 25k, 0.238% at Rs 1 lakh (derived, §4).
- STCG on listed equity/equity-ETF units: 20% (transfers on/after 23 Jul 2024); LTCG: 12.5% above Rs 1.25 lakh/yr; holding >12 months = long-term; +4% cess. Unchanged in Budgets 2025 and 2026 [S27][S28][S30][S31].
- Income-tax Act 2025 in force from 1 Apr 2026: s.111A → s.196, s.112A → s.198, s.74 → s.111 (8-tax-year loss carry-forward); rates unchanged [S32][S33][S34][S37].
- A monthly-rebalanced book will realise mostly short-term gains (≤12 months), i.e. 20.8% effective incl. cess (derived).
- New since Aug 2026: NSE Closing Auction Session for F&O stocks (3:15–3:35 pm) sets the official close [S25].

## 1. Securities Transaction Tax (STT)

| Transaction (NSE, recognised exchange) | Rate | Payer | Status | Source |
|---|---|---|---|---|
| Purchase of equity share, delivery | 0.1% | Buyer | "No Change" w.e.f. 1 Oct 2024 and 1 Apr 2026 | [S2][S1] |
| Sale of equity share, delivery | 0.1% | Seller | "No Change" (both circulars) | [S2][S1] |
| Sale of unit of equity-oriented fund (equity ETF), delivery | 0.001% | Seller | "No Change" | [S2][S1] |
| Purchase of equity-ETF unit | nil (no purchase row for EOF units in STT table) | – | – | [S1][S4] |
| Sale of equity share / EOF unit, non-delivery (intraday) | 0.025% | Seller | "No Change" | [S1] |
| Sale of futures (reference) | 0.0125% → 0.02% (1 Oct 2024) → 0.05% (1 Apr 2026) | Seller | changed | [S2][S1] |
| Sale of option, on premium (reference) | 0.0625% → 0.10% (1 Oct 2024) → 0.15% (1 Apr 2026) | Seller | changed | [S2][S1] |
| Sale of option where exercised (reference) | 0.125% → 0.15% (1 Apr 2026) | Purchaser | changed | [S1] |

Budget timeline:
- Union Budget July 2024 → Finance (No. 2) Act 2024 (assent 16 Aug 2024): only F&O STT raised, effective 1 Oct 2024; delivery/intraday/ETF rows "No Change" (NSE/FATAX/63809, 9 Sep 2024) [S2].
- Union Budget Feb 2025 → Finance Act 2025: no STT rate change found. Evidence: NSE's 31 Mar 2026 STT circular lists its prior STT circulars and the latest before it is 9 Sep 2024 (none in 2025) [S1]. Explicit "no STT change" statement for Budget 2025: UNVERIFIED (inference from the circular chain).
- Union Budget Feb 2026 → Finance Act 2026 (assent 30 Mar 2026): futures 0.02%→0.05%, options premium 0.10%→0.15%, exercised 0.125%→0.15%, effective 1 Apr 2026 (NSE/FATAX/73524, 31 Mar 2026) [S1]; Zerodha: "Equity delivery and intraday rates remain unchanged" [S3].
- Answer: delivery-equity STT did not change in 2025 or 2026.

Mechanics: STT is rounded to the nearest rupee (≥50 paise rounds up) [S3]. STT does not apply to gold, liquid, gilt and some international ETFs [S4].

## 2. Exchange, regulatory and statutory charges (cash segment)

| Charge | Current rate | Effective date / history | Source |
|---|---|---|---|
| NSE exchange transaction charge (ETC), cash market | Rs 2.97 per lakh each side (0.00297%), uniform for all members | w.e.f. 1 Oct 2024 (NSE/FA/64232, 27 Sep 2024), replacing slab-wise structure per SEBI "True to Label" circular SEBI/HO/MRD/TPD-1/P/CIR/2024/92 (1 Jul 2024); previous retail rate 0.00322% | [S5][S6] |
| NSE IPFT (Investor Protection Fund Trust) | Rs 10 per crore (0.0001% = Rs 0.10/lakh) on equity | Recalibrated from Rs 0.01/crore to Rs 10/crore, announced 24 Mar 2023 alongside the 1 Apr 2023 rollback | [S8][S9] |
| ETC as shown by brokers (ETC + IPFT combined) | 0.00307% (Rs 3.07/lakh) each side | Upstox: 0.00307% "From 1st March 2026" (0.00297% from 1 Oct 2024 to 28 Feb 2026) and "IPFT charges will be combined with Transaction Charges"; Zerodha: IPFT "included in the exchange transaction fees"; Angel One: 0.0030699% | [S12][S7][S13] |
| BSE ETC (reference) | 0.00375% (groups A, B, non-exclusive) | since 1 Dec 2022 | [S10] |
| SEBI turnover fee | Rs 10 per crore (0.0001%) each side | Schedule III fee table substituted w.e.f. 1 Apr 2019 (previously Rs 15/crore) | [S14][S10] |
| Stamp duty, delivery | 0.015% (Rs 1,500/crore), buy side only | w.e.f. 1 Jul 2020 (Indian Stamp Act amendments via Finance Act 2019); levied on one side only | [S15][S10] |
| Stamp duty, non-delivery (reference) | 0.003%, buy side | w.e.f. 1 Jul 2020 | [S15] |
| GST | 18% on brokerage + exchange transaction charges (incl. IPFT) + SEBI fee; also on DP charges. Not on STT or stamp duty | current broker schedules | [S10][S11][S12] |
| CDSL depository fee inside DP charge | Rs 3.50 per debit (was Rs 5) | from 1 Oct 2024 | [S6] |
| UPI MDR on capital-market pay-ins | 0.02% capped at Rs 300 per transaction | from 15 Oct 2026 (NPCI framework); who bears it (broker vs client) unresolved | [S19] |

Conflicts / flags:
- Zerodha and Upstox pages list IPFT as "₹0.01 per crore" [S16][S12], which contradicts the Rs 10/crore figure [S8] and Groww's 0.0001% [S9]; the all-in cash ETC of 0.00307% (= 0.00297% + 0.0001%) is consistent across brokers. NSE primary circular for the March-2026 combined presentation: UNVERIFIED.
- Primary NPCI circular for the UPI MDR: UNVERIFIED (news sources only) [S19].

## 3. Broker charges for delivery (retail resident; pages fetched 2026-09-29)

| Broker | Delivery brokerage | DP charge per scrip per sell day | AMC (demat) | Source |
|---|---|---|---|---|
| Zerodha | Rs 0 | Rs 15.34 incl. GST (Rs 3.5 CDSL + Rs 9.5 Zerodha + Rs 2.34 GST), irrespective of quantity; Rs 0.25 less for female first holder | Free in year 1 (resident individuals). BSDA: up to Rs 4 lakh free; Rs 4–10 lakh Rs 100/yr + 18% GST; >Rs 10 lakh Rs 300/yr + GST. Non-BSDA: Rs 300/yr + 18% GST, charged quarterly | [S10] |
| Groww | Lower of Rs 20 or 0.1% per executed order, minimum Rs 5 | Rs 3.5 CDSL (Rs 3.25 female) + Rs 16.5 Groww, + 18% GST = Rs 23.60; Rs 0 if debit value < Rs 100 | Rs 0 | [S11] |
| Upstox | Rs 20 per executed order | Rs 20.0 (CDSL 3.5 + Upstox 16.5) + GST = Rs 23.60, "per scrip per day only on sell" | Zero in year 1 for users onboarded from 14 Feb 2025; non-BSDA Rs 300 + GST (billing period not stated: UNVERIFIED); BSDA terms: UNVERIFIED (linked page not read) | [S12] |
| Angel One | Lower of Rs 20 or 0.1% per executed order, minimum Rs 5 (Rs 0 up to Rs 500 in first 30 days) | Rs 20 + GST = Rs 23.60 per ISIN debit (CDSL 3.5 + Angel 16.5) | Free year 1. BSDA: up to Rs 4 lakh nil; Rs 4–10 lakh Rs 100 + GST/yr. Non-BSDA: Rs 60 + GST per quarter (charged after first trade in the quarter) | [S13] |

BSDA regulation: SEBI circular SEBI/HO/MIRSD/MIRSD-PoD1/P/CIR/2024/91 (28 Jun 2024): no AMC up to Rs 4 lakh holdings; AMC ≤ Rs 100 for Rs 4–10 lakh [S17]. SEBI circular of 24 Dec 2025 (effective 31 Mar 2026): DPs must reassess BSDA eligibility every quarter and open BSDA by default for eligible holders unless they opt out [S18]. For a Rs 1–10 lakh portfolio at Zerodha, AMC is at most Rs 118/yr if the account is BSDA (the default for eligible holders from 31 Mar 2026 [S18]) and Rs 354/yr if non-BSDA (derived from [S10]).

## 4. Worked examples: Zerodha round trip (buy V, later sell V, one NSE order each side)

Assumptions: flat price (buy value = sell value = V), one scrip, DP charged once on the sell day, no slippage, rates from §1–§3.
Formula (fractions of V): buy side = STT 0.001 + ETC 0.0000307 + SEBI 0.000001 + stamp 0.00015 + GST 0.18×(ETC+SEBI) = 0.11874%; sell side = 0.001 + 0.0000307 + 0.000001 + 0.18×(0.0000317) = 0.10374%; round trip = 0.22248% + Rs 15.34 fixed (derived from [S1][S7][S10][S14][S15]).

| Component (Rs) | V = 10,000 | V = 25,000 | V = 1,00,000 |
|---|---|---|---|
| Brokerage (both sides) | 0.00 | 0.00 | 0.00 |
| STT 0.1% buy + 0.1% sell | 20.00 | 50.00 | 200.00 |
| NSE ETC incl. IPFT 0.00307% × 2 | 0.61 | 1.54 | 6.14 |
| SEBI fee 0.0001% × 2 | 0.02 | 0.05 | 0.20 |
| Stamp duty 0.015% (buy) | 1.50 | 3.75 | 15.00 |
| GST 18% on (ETC + SEBI) | 0.11 | 0.29 | 1.14 |
| DP charge (sell day, incl. GST) | 15.34 | 15.34 | 15.34 |
| **Total** | **37.59** | **70.96** | **237.82** |
| **Round-trip cost % of V** | **0.376%** | **0.284%** | **0.238%** |
| Of which STT share | 53% | 70% | 84% |

Same trade at other brokers (same statutory charges; brokerage + 18% GST; DP Rs 23.60), derived from [S11][S12][S13]:

| Broker | Rs 10,000 | Rs 25,000 | Rs 1,00,000 |
|---|---|---|---|
| Zerodha | Rs 37.59 (0.376%) | Rs 70.96 (0.284%) | Rs 237.82 (0.238%) |
| Groww / Angel One (post-offer) | Rs 69.45 (0.694%) | Rs 126.42 (0.506%) | Rs 293.28 (0.293%) |
| Upstox | Rs 93.05 (0.930%) | Rs 126.42 (0.506%) | Rs 293.28 (0.293%) |

Equity ETF at Zerodha (STT 0.001% sell only; STT unrounded): Rs 10k → Rs 17.69 (0.177%); Rs 25k → Rs 21.21 (0.085%); Rs 1 lakh → Rs 38.82 (0.039%); proportional part 0.0235% + Rs 15.34 DP (derived from [S1][S4][S10]).

Rebalancing implications (derived):
- The DP charge is fixed per scrip per sell day, so small trims are expensive: selling Rs 2,000 of a holding costs Rs 17.41 = 0.87% at Zerodha.
- Illustration: Rs 5 lakh book of 20 names × Rs 25k, replacing 4 names per month = 48 round trips/yr × Rs 70.96 = Rs 3,406/yr ≈ 0.68% of capital per year before slippage and tax.

## 5. Slippage / impact cost and spreads

Definition (NSE Indices methodology, Sept 2026): impact cost = percentage mark-up over the ideal price (best buy + best sell)/2 when buying/selling a given quantity; computed separately for buy and sell, varies with order size, and a penal impact cost applies to illiquid stocks [S21].

| Item | Figure | Date / basis | Source |
|---|---|---|---|
| NIFTY 50 eligibility | Average impact cost ≤ 0.50% for 90% of observations over last 6 months, basket Rs 10 crore (Rs 100 million) | factsheet dated 31 Aug 2026 | [S20][S21] |
| Nifty 500 eligible universe | Average impact cost ≤ 1% over previous 6 months; traded ≥90% of days; top 800 by turnover and market cap | methodology Sept 2026 | [S21] |
| Nifty Microcap 250 / Nifty Smallcap 500 universes | Average impact cost ≤ 1% over previous 6 months | methodology Sept 2026 | [S21] |
| Observed: NIFTY 50 weighted-average impact cost | 0.02% for a Rs 50 lakh portfolio | NSE monthly data, Mar 2019 (dated) | [S22] |
| Observed: Nifty Next 50 weighted-average impact cost | 0.04% for a Rs 25 lakh portfolio | Mar 2019 (dated) | [S22] |
| Observed: individual Nifty 50 / Next 50 stocks (examples shown in source) | 0.01%–0.16% average impact cost | Mar 2019 (dated) | [S22] |
| Top-100 NSE stocks, mean quoted spread | 5 bps (Jul–Aug 2009) → 3 bps (Jul–Aug 2012) | working paper, Aggarwal & Thomas, Dec 2013 | [S23] |
| Top-100 NSE stocks, impact cost for a Rs 25,000 order | 7 bps (2009) → 4 bps (2012) | same | [S23] |
| NSE tick sizes, cash & stock F&O | < Rs 250: Rs 0.01; Rs 251–1,000: Rs 0.05; Rs 1,001–5,000: Rs 0.10; Rs 5,001–10,000: Rs 0.50; Rs 10,001–20,000: Rs 1.00; > Rs 20,001: Rs 5.00 | effective 15 Apr 2025 (based on 28 Mar 2025 closes); NSE circular itself UNVERIFIED | [S24] |

- One-tick minimum spread (derived from [S24]): Rs 0.05 at Rs 300 = 1.7 bps; Rs 0.10 at Rs 1,001 ≈ 1.0 bp; Rs 5 at Rs 20,001 = 2.5 bps.
- UNVERIFIED: current (2025–26) impact-cost or spread levels for NIFTY 50, Nifty 500, midcap and smallcap indices. They are not in the Aug-2026 factsheet [S20] or Index Dashboard (Aug 2026, no impact-cost field) [S26]; NSE quote pages/API were blocked (HTTP 403); no Market Pulse PDF with impact cost could be located. Calibrate from NSE per-stock "impact cost" quotes or your own fills.
- Execution venue for rebalances: from 3 Aug 2026 NSE runs a Closing Auction Session (CAS) 3:15–3:35 pm for stocks with active derivatives. Orders match at a single equilibrium price that becomes the official close, within a fixed ±3% band around the reference price. Non-F&O stocks keep continuous trading to 3:30 pm and the existing close mechanism (last-30-min VWAP). NSE circular NSE/CMTR/74466 (29 May 2026), as reported by [S25].

## 6. Capital gains tax: listed equity shares and equity ETFs (resident individual)

| Item | Rule | Effective / changes | 1961 Act → 2025 Act | Source |
|---|---|---|---|---|
| STCG (held ≤ 12 months), STT paid on sale | 20% (15% for transfers before 23 Jul 2024) | 23 Jul 2024 (Budget 2024 speech: "20 per cent") | s.111A → s.196 | [S27](snippet)[S29][S33] |
| LTCG (held > 12 months) | 12.5% on gains above Rs 1.25 lakh per year (10% above Rs 1 lakh before 23 Jul 2024) | 23 Jul 2024 | s.112A → s.198 | [S28](snippet)[S29][S34] |
| STT condition for LTCG rate | Shares: STT paid on acquisition and transfer; equity-oriented fund units: on transfer | – | s.112A → s.198(1)(c) | [S34][S35] |
| Holding-period threshold | Listed securities and equity-oriented fund units: long-term if held > 12 months (other assets 24 months) | – | s.2(42A) → s.2(101)/s.2(67) | [S35] |
| Equity-oriented fund definition | ≥ 65% in listed domestic equity (fund-of-ETF: 90%/90%) | – | → s.198(8) | [S34] |
| Surcharge / cess | Plus surcharge if applicable and 4% cess → effective 20.8% STCG / 13.0% LTCG before surcharge (derived) | – | – | [S31] |
| Low-income residents | Unused basic-exemption limit can absorb s.196/s.198 gains; Chapter VIII deductions not allowed against them; s.156 rebate not allowed against s.198 tax | – | s.196(2),(4); s.198(3),(6),(7) | [S33][S34][S35] |
| Budget 2025 | Capital-gains rates and holding periods unchanged | Feb 2025 | – | [S30] |
| Budget 2026 | Capital-gains structure unchanged. Buyback proceeds taxed as capital gains from 1 Apr 2026 (previously the whole proceeds were taxed as dividend) | Feb 2026 / 1 Apr 2026 | – | [S31][S36b] |
| STT in computing gains | Not deductible (proviso to s.48); transfer expenses such as brokerage are deductible (s.48(i)) | – | ITA-2025 equivalent UNVERIFIED | [S41](snippet) |

Income-tax Act 2025:
- In force 1 Apr 2026; the 1961 Act stands repealed. The new Act "does not impose any new tax". "Tax year" replaces previous year/assessment year [S32].
- Returns for AY 2026-27 (FY 2025-26) are filed under the old Act; advance tax for Tax Year 2026-27 follows the new Act [S32].
- Old circulars continue unless inconsistent (s.536(2)(j)) [S32].

Loss set-off and carry-forward:
- Same year: short-term capital loss (STCL) can be set off against any capital gain (short- or long-term); long-term capital loss (LTCL) only against LTCG (s.70 → s.108(2)) [S36].
- Carry-forward: up to 8 tax years; carried STCL is set off against any capital gains, carried LTCL only against LTCG (s.74 → s.111) [S37].
- A loss return filed late (outside s.139(3) r/w s.80 of the 1961 Act) cannot carry the loss forward. Pre-2026 losses keep their character and original 8-year clock under s.536(2)(m),(n) [S38]. ITA-2025 section for the timely-filing condition: UNVERIFIED.

Capital gains vs business income:
- CBDT Circular No. 6/2016 (29 Feb 2016): if the taxpayer itself opts to treat listed shares as stock-in-trade, the income is business income.
- Under the same circular, for listed shares held > 12 months the taxpayer may elect capital-gains treatment and the AO will not dispute it, but the stand must be applied consistently in later years.
- All other cases are decided on facts under the earlier guidance (Instruction 1827/1989, Circular 4/2007 of 15 Jun 2007) [S39].
- A frequent-rebalancing (≤ 12-month) book is therefore not protected by the 12-month safe harbour. Business-income treatment means slab-rate tax; apply case-specific judgement.

## 7. SEBI / exchange rules that affect retail rebalancing

- Settlement:
  - T+1 rolling settlement was fully implemented w.e.f. 27 Jan 2023 [S42].
  - Optional T+0 went live 28 Mar 2024 as a beta on 25 scrips [S42]. SEBI/HO/MRD/MRD-PoD-3/P/CIR/2024/172 (10 Dec 2024) extended it to the top 500 scrips by market cap as on 31 Dec 2024, phased from 31 Jan 2025 [S43]. The readiness deadline for qualified stock brokers moved from 1 May 2025 to 1 Nov 2025 [S44].
  - Upstox FAQ: 100% of sell proceeds are usable for trading the same day and withdrawable from T+1 [S12].
- Price bands:
  - Scrip-wise bands of up to 20% either way apply to all rolling-settlement scrips except those with derivatives (SEBI Master Circular SEBI/HO/MRD-PoD2/CIR/P/2024/0181, 30 Dec 2024, para 2.3.1) [S46].
  - Exchanges periodically move stocks between the 20/10/5/2% bands [S58].
  - F&O stocks use dynamic bands: 10% of the previous close at start of day, flexed in 5% steps after a 15-minute cooling-off. The flex condition was raised to 50 trades, 10 UCCs and 3 trading members per side (SEBI/HO/MRD/TPD-1/P/CIR/2024/58, 24 May 2024) [S45].
  - Market-wide index circuit breakers trigger at 10/15/20% index moves, recalibrated daily (CIR/MRD/DP/25/2013) [S47b].
- ETF bands:
  - Before the change: fixed 20% band for equity/debt/commodity ETFs on a T-2 NAV base.
  - New SEBI framework: 10% initial band, flexing by 5% up to twice (to 20%) after a 15-minute cooling-off, on a previous-close base. Liquid/overnight ETFs keep 5%; gold/silver ETFs start at 6%.
  - Reported to take effect "from September 2026" (Livemint, 15 Jun 2026); exact circular and effective date UNVERIFIED [S47].
- Surveillance frameworks (exclude or penalise these names in backtests):
  - LT-ASM: Stage I 100% margin; Stages II–III price band cut to the next lower level; Stage IV gross (trade-for-trade) settlement with 100% margin and a 5% band [S48].
  - GSM: Stage 1 has 100% margin and a ≤5% band; Stage 2 adds T2T plus a 50% Additional Surveillance Deposit (ASD); Stages 3–4 trade only once a week with 100% ASD, and Stage 4 allows no upward movement. Zerodha restricts buying from GSM Stage 2 [S49].
  - ESM: from 13 Aug 2024 covers main-board companies up to Rs 1,000 crore market cap (earlier < Rs 500 crore, since June 2023). Stage I is T2T with a 5% or 2% band; Stage II is T2T with a 2% band [S50].
  - ASM stocks cannot be pledged [S52].
- Trade-to-trade (T2T/BE/BZ): no intraday or BTST; every buy and sell is compulsorily delivered [S51]. Because T2T trades are never netted, a same-day sell and rebuy of a T2T name settles as two separate delivery trades (derived from [S51]).
- Also: an NSE pre-open session realignment was scheduled for 7 Sep 2026 per [S25]; details and implementation status UNVERIFIED.

## Sources

- S1 NSE/FATAX/73524 (31 Mar 2026), STT from 1 Apr 2026: https://nsearchives.nseindia.com/content/circulars/FATAX73524.pdf
- S2 NSE/FATAX/63809 (9 Sep 2024), STT from 1 Oct 2024: https://nsearchives.nseindia.com/content/circulars/FATAX63809.pdf
- S3 Zerodha, STT article: https://support.zerodha.com/category/trading-and-markets/trading-faqs/articles/how-is-the-securities-transaction-tax-stt-calculated
- S4 Zerodha, STT on ETFs: https://support.zerodha.com/category/account-opening/resident-individual/ri-charges/articles/stt-etfs
- S5 NSE/FA/64232 (27 Sep 2024), uniform transaction charges: https://nsearchives.nseindia.com/content/circulars/FA64232.pdf
- S6 Zerodha bulletin (28 Sep 2024), 1 Oct 2024 revision and CDSL fee split: https://zerodha.com/marketintel/bulletin/391488/revision-in-transactions-charges-from-1st-october-2024
- S7 Zerodha, exchange transaction charges table: https://support.zerodha.com/category/account-opening/charges-at-zerodha/articles/why-am-i-being-charged-higher-transaction-charges
- S8 The Hindu (24 Mar 2023), IPFT Rs 0.01→Rs 10 per crore: https://www.thehindu.com/business/nse-to-roll-back-6-increase-in-transaction-charges/article66657383.ece
- S9 Groww, IPFT 0.0001%: https://groww.in/help/stocks,-f&o,-ipo-&-mtf/sx-pricing/what-are-ipft-charges--35
- S10 Zerodha charges page: https://zerodha.com/charges/
- S11 Groww pricing: https://groww.in/pricing
- S12 Upstox brokerage charges: https://upstox.com/brokerage-charges/
- S13 Angel One charges: https://www.angelone.in/exchange-transaction-charges
- S14 SEBI (Stock Brokers) Regulations 1992, compiled Mar 2023, Schedule III fee table: https://www.sebi.gov.in/sebi_data/attachdocs/mar-2023/1679546555060.pdf
- S15 SEBI FAQ on Indian Stamp Act amendments (Jun 2020): https://www.sebi.gov.in/sebi_data/faqfiles/jun-2020/1593534237938.pdf
- S16 Zerodha, IPFT article: https://support.zerodha.com/category/account-opening/charges-at-zerodha/statutory-and-exchange/articles/ipft-charges
- S17 Kotak Securities investor-rights doc (SEBI BSDA AMC slabs): https://www.kotaksecurities.com/uploads/8_Rights_to_investor_35b89740f3.pdf
- S18 SEBI circular HO/38/11/11(3)2025-MIRSD-POD/I/1101/2025 (24 Dec 2025), BSDA (copy): https://www.kotakneo.com/uploads/SEBI_CIRCULAR_on_EASE_OF_INVESTMENTS_147f59fdef.pdf
- S19 UPI MDR 0.02% capped at Rs 300 from 15 Oct 2026:
  - ET: https://economictimes.indiatimes.com/industry/banking/finance/mutual-funds-stocks-upi-payments-to-attract-0-02-mdr-under-new-npci-framework/articleshow/134266396.cms
  - Livemint: https://www.livemint.com/money/personal-finance/seems-to-be-an-issue-between-the-broker-and-client-no-govt-talks-on-new-upi-mdr-nse-ceo-ashish-chauhan-11790433535759.html
- S20 NIFTY 50 factsheet (31 Aug 2026): https://www.niftyindices.com/Factsheet/ind_nifty50.pdf
- S21 Nifty Indices methodology document (Sept 2026, v20260821): https://www.niftyindices.com/Methodology/Method_NIFTY_Equity_Indices.pdf
- S22 freefincal (17 Apr 2019), citing NSE monthly impact-cost data for Mar 2019: https://freefincal.com/impact-cost/
- S23 Aggarwal & Thomas, "Market quality in the time of algorithmic trading" (Dec 2013 working paper): https://ifrogs.org/PDF/CONF_2013/Aggarwal_Thomas_2013.pdf
- S24 Angel One news (17 Mar 2025), NSE tick sizes from 15 Apr 2025: https://www.angelone.in/news/market-updates/nse-revises-tick-size-for-stocks-and-indices-from-april-15-what-traders-need-to-know
- S25 HDFC Sky (2 Jun 2026), NSE CAS from 3 Aug 2026, citing NSE/CMTR/74466: https://hdfcsky.com/news/nse-to-extend-equity-derivatives-trading-by-10-minutes-from-august-3-with-launch-of-closing-auction-session
- S26 NSE Indices Index Dashboard (Aug 2026): https://www.niftyindices.com/Index_Dashboard/Index%20Dashboard_AUG2026.pdf
- S27 Income Tax Dept, s.111A (snippet: "twenty per cent ... on or after the 23rd day of July, 2024"): https://www.incometaxindia.gov.in/w/section-111a-22
- S28 Income Tax Dept, s.112A (snippet: "ten per cent ... before the 23rd day of July, 2024"): https://www.incometaxindia.gov.in/w/section-112a-60
- S29 ET (23 Jul 2024), Budget 2024 capital-gains changes: https://m.economictimes.com/wealth/tax/capital-gains-exemption-limit-hiked-to-rs-1-25-lakh-stcg-tax-rate-changed-to-20-ltcg-hiked-to-12-5-on-certain-assets-in-budget-2024/articleshow/111951361.cms
- S30 Financial Express (5 Feb 2025), Budget 2025 capital gains unchanged: https://www.financialexpress.com/money/budget-2025-new-capital-gains-tax-rules-latest-ltcg-and-stcg-rates-revealed-3738879/
- S31 Moneycontrol (1 Feb 2026), Budget 2026 capital gains unchanged / buyback / cess: https://www.moneycontrol.com/news/business/personal-finance/budget-2026-has-the-capital-gains-tax-structure-changed-check-here-13796270.html
- S32 Income Tax e-filing FAQ, Income-tax Act 2025 scope and transition: https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/objective-and-scope-new-act
- S33 ITA 2025 s.196 text (eztax mirror): https://eztax.in/income-tax-act-2025/section-196
- S34 ITA 2025 s.198 text (eztax mirror): https://eztax.in/income-tax-act-2025/section-198
- S35 myITreturn (8 Aug 2026), ITA 2025 holding periods and ss.196–198: https://help.myitreturn.com/hc/en-us/articles/60943188924313-Capital-Gains-Holding-Periods-Tax-Rates-Income-Tax-Act-2025
- S36 ITA 2025 s.108 text (eztax mirror): https://eztax.in/income-tax-act-2025/section-108
- S36b ET, buyback taxed as capital gains from 1 Apr 2026: https://economictimes.indiatimes.com/wealth/tax/wipro-is-buying-back-shares-at-rs-250-what-your-tax-bill-looks-like-depends-on-this-factor/articleshow/130628306.cms
- S37 ITA 2025 s.111 text (eztax mirror): https://eztax.in/income-tax-act-2025/section-111
- S38 Income Tax e-filing FAQ, set-off / carry-forward under ITA 2025: https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/set-offcarry-forward-losses
- S39 CBDT Circular 6/2016:
  - Listing: https://www.incometaxindia.gov.in/w/circular-no.-06/2016-issue-of-taxability-of-surplus-on-sale-of-shares-and-securities-capital-gains-or-business-income-instructions-in-order-to-reduce-litigation
  - KPMG summary: https://assets.kpmg.com/content/dam/kpmg/pdf/2016/04/CBDT-Circular-on-the-taxability-of-surplus-on-sale-of-shares-1.pdf
- S41 Income Tax Dept, s.48 STT proviso (snippet):
  - Proviso: https://www.incometaxindia.gov.in/w/section-50aa-3
  - s.48(i) text: https://www.incometaxindia.gov.in/w/section-48-10
- S42 SEBI T+0 circular (21 Mar 2024), T+1 fully implemented 27 Jan 2023: https://www.sebi.gov.in/sebi_data/attachdocs/mar-2024/1711019839112.pdf
- S43 SEBI circular (10 Dec 2024), T+0 extended to top 500 scrips: https://www.sebi.gov.in/sebi_data/attachdocs/dec-2024/1733829354031.pdf
- S44 SEBI circular (Apr 2025), QSB T+0 deadline 1 Nov 2025: https://www.sebi.gov.in/sebi_data/attachdocs/apr-2025/1745926772451.pdf
- S45 SEBI/HO/MRD/TPD-1/P/CIR/2024/58 (24 May 2024), dynamic price bands: https://www.sebi.gov.in/sebi_data/attachdocs/may-2024/1716559743354.pdf
- S46 SEBI consultation paper (Jun 2026) quoting Master Circular para 2.3: https://www.sebi.gov.in/sebi_data/attachdocs/jun-2026/1781178504377.pdf
- S47 Livemint (15 Jun 2026), SEBI ETF trading framework: https://www.livemint.com/market/sebi-revamps-etf-trading-framework-introduces-dynamic-price-bands-mfs-11781529737086.html
- S47b SEBI CIR/MRD/DP/25/2013, market-wide circuit breakers: https://www.sebi.gov.in/sebi_data/attachdocs/1378198702862.pdf
- S48 NSE ASM FAQ: https://nsearchives.nseindia.com/web/sites/default/files/inline-files/FAQs%20-%20Additional%20Surveillance%20Measure%20%28ASM%29_1.pdf
- S49 Zerodha, GSM stages: https://support.zerodha.com/category/trading-and-markets/trading-faqs/articles/what-does-gsm-mean
- S50 ET (10 Aug 2024), ESM widened to Rs 1,000 crore: https://economictimes.indiatimes.com/markets/stocks/news/bourses-include-companies-up-to-rs-1000-crore-m-cap-under-esm/articleshow/112416511.cms
- S51 Zerodha, T2T stocks: https://support.zerodha.com/category/trading-and-markets/trading-faqs/general/articles/what-are-trade-to-trade-stocks
- S52 Zerodha, ASM: https://support.zerodha.com/category/trading-and-markets/trading-faqs/trading-categories-and-groups/articles/what-is-asm
- S58 ET (Dec 2025), NSE revises price bands of 230 stocks: https://m.economictimes.indiatimes.com/markets/stocks/news/nse-revises-price-bands-for-230-stocks-effective-today/articleshow/125778064.cms

## Cost model parameters

Fractions apply to traded value (buy value for buy-side items, sell value for sell-side items). "derived" = computed from the cited rates.

| parameter | value | unit | source |
|---|---|---|---|
| stt_delivery_buy | 0.001 | fraction of buy value | S1 |
| stt_delivery_sell | 0.001 | fraction of sell value | S1 |
| stt_equity_etf_buy | 0 | fraction | S1, S4 |
| stt_equity_etf_sell | 0.00001 | fraction of sell value | S1, S4 |
| stt_intraday_sell (reference) | 0.00025 | fraction of sell value | S1 |
| stt_rounding | nearest rupee per contract note | INR | S3 |
| nse_exchange_txn_charge | 0.0000297 | fraction, each side | S5 |
| nse_ipft | 0.000001 | fraction, each side | S8, S9 |
| nse_txn_all_in (ETC + IPFT, as billed) | 0.0000307 | fraction, each side | S7, S12 |
| sebi_turnover_fee | 0.000001 | fraction, each side | S14, S10 |
| stamp_duty_delivery_buy | 0.00015 | fraction of buy value | S15, S10 |
| stamp_duty_sell | 0 | fraction | S15 |
| gst_rate | 0.18 | on brokerage + exchange txn (incl. IPFT) + SEBI fee + DP fee (ex-GST) | S10, S11 |
| zerodha_brokerage_delivery | 0 | INR per order | S10 |
| zerodha_dp_charge | 15.34 | INR per scrip per sell day, incl. GST | S10 |
| groww_angel_brokerage_delivery | min(20, 0.001 × order value), floor 5 | INR per executed order + 18% GST | S11, S13 |
| upstox_brokerage_delivery | 20 | INR per executed order + 18% GST | S12 |
| dp_charge_groww_upstox_angel | 23.60 | INR per scrip per sell day, incl. GST (Groww: 0 if debit < Rs 100) | S11, S12, S13 |
| zerodha_amc_bsda_le_4L | 0 | INR per year | S10, S17 |
| zerodha_amc_bsda_4L_to_10L | 118 | INR per year (Rs 100 + 18% GST) | S10, S17 |
| zerodha_amc_non_bsda | 354 | INR per year (Rs 300 + 18% GST) | S10 |
| zerodha_roundtrip_variable (equity) | 0.0022248 | fraction of V (buy 0.0011874 + sell 0.0010374) | derived (S1, S7, S10, S14, S15) |
| zerodha_roundtrip_variable (equity ETF) | 0.0002348 | fraction of V | derived (S1, S4, S7, S10, S15) |
| zerodha_roundtrip_total_10k / 25k / 1L | 0.00376 / 0.00284 / 0.00238 | fraction of V incl. DP, excl. slippage | derived (§4) |
| upi_mdr_capital_markets (pay-in, from 2026-10-15) | 0.0002, cap 300 | fraction / INR per UPI payment; incidence unresolved | S19 |
| impact_cost_nifty50_portfolio (dated, Mar 2019) | 0.0002 | fraction, Rs 50 lakh portfolio | S22 |
| impact_cost_niftynext50_portfolio (dated, Mar 2019) | 0.0004 | fraction, Rs 25 lakh portfolio | S22 |
| impact_cost_top100_25k_order (dated, 2012) | 0.0004 | fraction per trade | S23 |
| quoted_spread_top100 (dated, 2012) | 0.0003 | fraction | S23 |
| impact_cost_cap_nifty500_universe | 0.01 | fraction, eligibility maximum (not a typical value) | S21 |
| slippage_midcap / slippage_smallcap (current) | UNVERIFIED | calibrate from NSE per-stock impact cost or own fills | – |
| tick_size | 0.01 (<250), 0.05 (251–1000), 0.10 (1001–5000), 0.50 (5001–10000), 1.00 (10001–20000), 5.00 (>20000) | INR | S24 |
| stcg_rate_equity (≤12 months) | 0.20 | fraction of gain (+ surcharge if any) | S27, S33 |
| ltcg_rate_equity (>12 months) | 0.125 | fraction of gain above exemption | S28, S34 |
| ltcg_annual_exemption | 125000 | INR per tax year | S29, S34 |
| health_education_cess | 0.04 | fraction of tax | S31 |
| stcg_effective_with_cess / ltcg_effective_with_cess | 0.208 / 0.130 | fraction (no surcharge) | derived |
| long_term_holding_threshold | > 12 | months | S35 |
| capital_loss_carry_forward | 8 | tax years; STCL vs any capital gains, LTCL vs LTCG only | S36, S37 |
| stt_deductible_from_capital_gains | false | boolean | S41 (snippet) |
| settlement_cycle | T+1 (optional T+0, top 500) | trading days | S42, S43 |
| price_band_non_fno_max | 0.20 (bands 0.02/0.05/0.10/0.20) | fraction of previous close | S46, S58 |
| dynamic_band_fno_start / flex_step | 0.10 / 0.05 | fraction of previous close | S45 |
| cas_band_fno (from 2026-08-03) | 0.03 | fraction around CAS reference price | S25 |
