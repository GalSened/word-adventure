import { describe, it, expect } from 'vitest';
import {
    CHAPTERS,
    LEVEL_CHAPTERS,
    ALL_CHAPTERS,
    getChapter,
    isChapterUnlocked,
    getNPCDialogue,
} from './story';
import { LEVELS } from './levels';

/**
 * The per-level story content (LEVEL_CHAPTERS) was authored but never
 * shown: every lookup went through CHAPTERS, which only holds the legacy
 * difficulty keys. These tests pin the merged lookup so all 16 levels
 * resolve to real chapters with gendered intros and NPC dialogue.
 */
describe('chapter lookup covers every level', () => {
    it('resolves a chapter for level_1 through level_16', () => {
        for (let i = 1; i <= 16; i++) {
            const chapter = getChapter(`level_${i}`);
            expect(chapter, `level_${i}`).not.toBeNull();
            expect(chapter.intro?.boy, `level_${i} intro.boy`).toBeTruthy();
            expect(chapter.intro?.girl, `level_${i} intro.girl`).toBeTruthy();
            expect(chapter.completion?.boy, `level_${i} completion.boy`).toBeTruthy();
            expect(chapter.completion?.girl, `level_${i} completion.girl`).toBeTruthy();
            expect(chapter.npc?.dialogues?.length, `level_${i} npc dialogues`).toBeGreaterThan(0);
        }
    });

    it('legacy difficulty chapters still resolve', () => {
        for (const key of ['easy', 'medium', 'hard', 'expert', 'master']) {
            expect(getChapter(key), key).not.toBeNull();
        }
    });

    it('every level in the level map has a story chapter', () => {
        for (const level of LEVELS) {
            expect(getChapter(level.storyChapter), level.storyChapter).not.toBeNull();
        }
    });

    it('ALL_CHAPTERS is the union of legacy and level chapters', () => {
        const keys = Object.keys(ALL_CHAPTERS);
        for (const k of Object.keys(CHAPTERS)) expect(keys).toContain(k);
        for (const k of Object.keys(LEVEL_CHAPTERS)) expect(keys).toContain(k);
    });
});

describe('NPC dialogue for level chapters', () => {
    it('serves gendered dialogue with name substitution', () => {
        const startLine = getNPCDialogue('level_1', 'start', 'דנה', 'girl');
        expect(startLine).toBeTruthy();
        expect(startLine).not.toContain('{name}');

        const correctBoy = getNPCDialogue('level_1', 'correct', 'אדם', 'boy');
        const correctGirl = getNPCDialogue('level_1', 'correct', 'דנה', 'girl');
        expect(correctBoy).toBeTruthy();
        expect(correctGirl).toBeTruthy();
    });

    it('returns null for unknown triggers instead of crashing', () => {
        expect(getNPCDialogue('level_1', 'no_such_trigger', 'x', 'boy')).toBeNull();
    });
});

describe('level chapter unlocking', () => {
    it('level_1 is unlocked from zero words', () => {
        expect(isChapterUnlocked('level_1', 0)).toBe(true);
    });

    it('level chapters unlock as words are learned', () => {
        // LEVEL_CHAPTERS unlockRequirements are small (0-15) by convention
        for (let i = 1; i <= 16; i++) {
            expect(isChapterUnlocked(`level_${i}`, 200), `level_${i} at 200 words`).toBe(true);
        }
    });
});
