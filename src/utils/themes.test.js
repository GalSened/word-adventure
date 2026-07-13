import { describe, it, expect } from 'vitest';
import { THEME_STYLES, getThemeStyle } from './themes';
import { getItemsByCategory } from '../data/storeItems';

describe('purchased themes actually restyle the app', () => {
    it('every theme sold in the store has a style set', () => {
        for (const item of getItemsByCategory('themes')) {
            expect(THEME_STYLES[item.id], `${item.id} has no THEME_STYLES entry`).toBeTruthy();
        }
    });

    it('every style set is complete (page + both blobs)', () => {
        for (const [id, style] of Object.entries(THEME_STYLES)) {
            expect(style.page, `${id}.page`).toMatch(/^bg-/);
            expect(style.blobA, `${id}.blobA`).toMatch(/^bg-/);
            expect(style.blobB, `${id}.blobB`).toMatch(/^bg-/);
        }
    });

    it('unknown or missing theme falls back to the default look', () => {
        expect(getThemeStyle(undefined)).toBe(THEME_STYLES.default);
        expect(getThemeStyle('theme_that_never_existed')).toBe(THEME_STYLES.default);
        expect(getThemeStyle('theme_ocean')).toBe(THEME_STYLES.theme_ocean);
    });
});
