/**
 * Deterministic pseudo-random helpers.
 *
 * Challenge components must render pure (React Compiler rules), so option
 * shuffling cannot call Math.random() during render. Seeding a PRNG from the
 * word id gives a stable-per-word order that is also referentially pure:
 * the same word always yields the same shuffled options.
 */

/** xmur3 string hash — turns an arbitrary string seed into a 32-bit int. */
function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return () => {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}

/** mulberry32 PRNG — fast, good-enough distribution for UI shuffling. */
function mulberry32(a) {
    return () => {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Fisher-Yates shuffle driven by a string seed.
 * Same (array contents, seed) → same order. Does not mutate the input.
 */
export function seededShuffle(array, seed) {
    const rand = mulberry32(xmur3(String(seed))());
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
