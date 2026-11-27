# Stock Assist

A research project on Indian stocks, in TypeScript. It has two parts:

1. **An NSE momentum backtest** built to be hard to fool: survivorship-free data, a spec frozen before the test, real costs and tax, and a holdout period that was touched once.
2. **A stock analysis web app** that puts technical indicators and two LLMs (Groq and Gemini) side by side for one stock. Live at [stock-assist-web.vercel.app](https://stock-assist-web.vercel.app).

This is a personal project, not a product, and nothing here is investment advice.

## What did not work

I started by trying to predict trades. Three approaches failed, and the code for them is still here on purpose:

| Approach | Result |
|---|---|
| Chart patterns (order blocks, liquidity sweeps, fair-value gaps) with a confidence score | Win rate stayed between 18% and 32% over 6+ variants. A per-condition check showed no real edge. |
| Momentum breakout with stops (top 30% by 6-month return, Donchian breakout, ATR stops) | Profitable in 1 year of 3. |
| Scoring 25 conditions and trading above a threshold | Scores barely correlated with outcomes. |

The lesson was that a backtest is easy to fool yourself with. So the next attempt was built the other way round: write the rules and the pass marks first, then run the test once.

## What held up: a rules-only momentum portfolio

- **Rules:** take the 500 most traded NSE stocks, score each by 6- and 12-month return divided by volatility (the NSE Nifty200 Momentum 30 method), hold the top 20 at equal weight, and rebalance twice a year. No stops, no predictions.
- **Data:** NSE daily price files from 2004, **including delisted stocks**, so dead companies are not silently dropped. Splits and bonuses are rebuilt from NSE's corporate-action files, and ETFs are excluded.
- **Method:** the variant was chosen on 2011–2017 only. The spec and three pass criteria were frozen before the 2018–2026 holdout was run.

Holdout, January 2018 to September 2026:

| | Strategy | Nifty 500 |
|---|---|---|
| Return per year, after costs | 17.1% | 10.1% |
| Return per year, after tax | 14.8% | 9.4% |
| Worst drawdown | −45.8% | −38.3% |

It beat 500 random portfolios drawn from the same stocks (p = 0.018). It also lost money in 4 years of 9, and the top 10 of 245 stocks made 70% of the profit. This is a backtest; live momentum has historically earned less than its backtests.

One bug is disclosed rather than hidden: the first run let ETFs into the stock universe and scored 21.3%. That run is invalid, and its files are kept in `docs/results/run1-etfs-in-universe/`.

Full write-up: [`docs/momentum-system-implementation.md`](docs/momentum-system-implementation.md) (spec, results, limitations) and [`docs/research/strategy-research.md`](docs/research/strategy-research.md) (evidence and sources). Raw results are in `docs/results/`.

## Layout

```
apps/api      Express + TypeScript API
  src/services/nse        NSE data: downloader, price files, corporate actions, point-in-time panel
  src/services/momentum   universe, score, selection, costs, tax, simulation, report
  src/services/backtest   the earlier (failed) strategies and the walk-forward engine
  src/services/ai         Groq and Gemini calls for the analysis app
  scripts                 nseSync, momentumBacktest, momentumPicks
apps/web      Next.js front end
packages/shared   shared types and constants
```

## Run it

```bash
npm install
cp .env.example .env        # MongoDB and Gemini keys, only needed for the analysis app
npm run dev                 # API on :4000, web on :3000
```

The momentum backtest needs no keys:

```bash
cd apps/api
npx tsx scripts/nseSync.ts               # downloads and caches NSE data (large, slow the first time)
npx tsx scripts/momentumBacktest.ts holdout
```

## Tests

```bash
npm run build -w @stock-assist/shared
cd apps/api && npx vitest run     # 193 tests
```

## Known gaps

- The LLM model names in `apps/api/src/services/ai` are old and need updating before the analysis app's AI part works again.
- Returns are price returns (dividends ignored), for the strategy and the benchmarks alike.
