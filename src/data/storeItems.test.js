import { describe, it, expect } from 'vitest';
import { STORE_ITEMS, CATEGORIES, getItemsByCategory, getWalkablePets } from './storeItems';

/**
 * Pet-care economy: the walk mode feeds treats and plays with toys bought
 * in the store — the loop Gal asked for (walk → earn → buy → care).
 */
describe('pet care store category', () => {
    it('petcare category exists and is listed', () => {
        expect(CATEGORIES.petcare).toBeTruthy();
        expect(getItemsByCategory('petcare').length).toBeGreaterThanOrEqual(5);
    });

    it('treats are stackable and carry a satiety value', () => {
        const treats = getItemsByCategory('petcare').filter(i => i.treat);
        expect(treats.length).toBeGreaterThanOrEqual(2);
        for (const t of treats) {
            expect(t.stackable, t.id).toBe(true);
            expect(t.effect?.satiety, t.id).toBeGreaterThan(0);
        }
    });

    it('toys are permanent (non-stackable) and marked as toys', () => {
        const toys = getItemsByCategory('petcare').filter(i => i.toy);
        expect(toys.length).toBeGreaterThanOrEqual(3);
        for (const toy of toys) {
            expect(toy.stackable, toy.id).toBeFalsy();
            expect(toy.price, toy.id).toBeGreaterThan(0);
        }
    });

    it('walkable pets are unchanged by the new category', () => {
        const pets = getWalkablePets();
        expect(pets.length).toBeGreaterThanOrEqual(6);
        for (const p of pets) expect(p.category).toBe('pets');
    });

    it('every petcare item has the standard card fields', () => {
        for (const item of getItemsByCategory('petcare')) {
            expect(item.name, item.id).toBeTruthy();
            expect(item.icon, item.id).toBeTruthy();
            expect(item.description, item.id).toBeTruthy();
            expect(item.rarity in { common: 1, rare: 1, epic: 1, legendary: 1 }, item.id).toBe(true);
        }
    });

    it('the starter dog stays affordable for a fresh player boost', () => {
        expect(STORE_ITEMS.dog.walkable).toBe(true);
        expect(STORE_ITEMS.dog.price).toBeLessThanOrEqual(200);
    });
});
