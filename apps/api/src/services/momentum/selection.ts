/**
 * Target selection with NSE's rank buffer (Nifty200 Momentum 30 uses 15 / 45 for N = 30):
 *   S = {rank ≤ N/2} ∪ {current holdings with rank ≤ 1.5N}
 *   |S| > N → drop holdings ranked > N/2, worst first;  |S| < N → add the best-ranked non-members.
 *
 * @module @stock-assist/api/services/momentum/selection
 */

export interface Selection {
    /** Chosen names, best rank first */
    targets: number[];
    /** Remaining ranked names, in order, to replace any target that cannot be bought */
    fallback: number[];
}

export function selectTargets(
    ranked: number[],
    rankOf: (i: number) => number,
    held: Iterable<number>,
    N: number,
): Selection {
    const half = Math.floor(N / 2);
    const keepLimit = Math.floor(1.5 * N);
    const chosen = new Set<number>(ranked.slice(0, half));
    const keptHoldings = [...held].filter(i => rankOf(i) <= keepLimit);
    for (const i of keptHoldings) chosen.add(i);

    if (chosen.size > N) {
        const droppable = [...chosen].filter(i => rankOf(i) > half).sort((a, b) => rankOf(b) - rankOf(a));
        for (const i of droppable) {
            if (chosen.size <= N) break;
            chosen.delete(i);
        }
    }
    for (const i of ranked) {
        if (chosen.size >= N) break;
        chosen.add(i);
    }
    const targets = [...chosen].sort((a, b) => rankOf(a) - rankOf(b));
    return { targets, fallback: ranked.filter(i => !chosen.has(i)) };
}
