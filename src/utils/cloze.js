/**
 * Cloze (sentence-completion) challenge helpers.
 *
 * A cloze shows the word's example sentence with the word blanked out —
 * reading comprehension on top of vocabulary. Not every word can produce
 * one (its sentence must actually contain it), so the selector asks
 * supportsCloze() before offering the type.
 */

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Split the example sentence around the first whole-word, case-insensitive
 * occurrence of the target word.
 * @returns {{before: string, after: string} | null} null when the sentence
 *   does not contain the word (or there is no sentence at all).
 */
export function buildClozeSentence(word) {
    const sentence = word?.exampleSentence;
    if (!sentence || !word?.word) return null;
    const re = new RegExp(`\\b${escapeRegExp(word.word)}\\b`, 'i');
    const match = re.exec(sentence);
    if (!match) return null;
    return {
        before: sentence.slice(0, match.index),
        after: sentence.slice(match.index + match[0].length),
    };
}

/**
 * Can this word be served as a cloze challenge? Requires exactly one
 * occurrence in the sentence — a repeated word would leak the answer in
 * the visible remainder.
 */
export function supportsCloze(word) {
    if (word?.type === 'sentence') return false;
    const parts = buildClozeSentence(word);
    if (!parts) return false;
    const re = new RegExp(`\\b${escapeRegExp(word.word)}\\b`, 'i');
    return !re.test(parts.before + parts.after);
}
