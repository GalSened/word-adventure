import { describe, it, expect } from 'vitest';
import { seededShuffle } from './seededRandom';

describe('seededShuffle', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    it('is deterministic for the same seed', () => {
        expect(seededShuffle(items, 'word_42')).toEqual(seededShuffle(items, 'word_42'));
    });

    it('produces different orders for different seeds', () => {
        // With 8 items (40320 permutations) two distinct seeds colliding is ~0.0025% —
        // if this ever fails the PRNG is broken, not unlucky.
        expect(seededShuffle(items, 'word_1')).not.toEqual(seededShuffle(items, 'word_2'));
    });

    it('returns a permutation (same members, same length)', () => {
        const out = seededShuffle(items, 'xyz');
        expect(out).toHaveLength(items.length);
        expect([...out].sort()).toEqual([...items].sort());
    });

    it('does not mutate the input array', () => {
        const original = [...items];
        seededShuffle(items, 'xyz');
        expect(items).toEqual(original);
    });

    it('handles empty and single-element arrays', () => {
        expect(seededShuffle([], 's')).toEqual([]);
        expect(seededShuffle([1], 's')).toEqual([1]);
    });
});
