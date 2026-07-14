import { z } from 'zod';

/**
 * The 16 themed word categories for the word bank.
 * Aligned with the Cambridge Pre-A1 Starters / A1 Movers topic lists.
 * Used by the schema enum and exported for use by other modules.
 */
export const WORD_CATEGORIES = [
  'animals',
  'food',
  'family',
  'colors',
  'nature',
  'body',
  'actions',
  'home',
  'emotions',
  'professions',
  'school',
  'transport',
  'clothes',
  'weather',
  'sports',
  'toys',
];

export const WordSchema = z.object({
  id: z.string().min(1),
  word: z.string().min(1),
  hebrew: z.string().min(1),
  hint: z.string().min(1),
  hint_m: z.string().optional(),
  hint_f: z.string().optional(),
  category: z.enum(WORD_CATEGORIES),
  emoji: z.string().min(1),
  level: z.enum(['easy', 'medium', 'hard', 'expert']),
  type: z.enum(['word', 'sentence']),
  gender: z.enum(['m', 'f', 'n']),
  exampleSentence: z.string().min(1),
  exampleSentence_he: z.string().min(1),
});

export const WordListSchema = z.array(WordSchema);

/**
 * Validate an array of word objects against the schema.
 * Throws with clear error messages if any word fails validation.
 * @param {Array} words - Array of word objects to validate
 * @returns {Array} Validated word array (same data, typed)
 */
export function validateWords(words) {
  const result = WordListSchema.safeParse(words);
  if (!result.success) {
    const issues = result.error.issues.map(
      (i) => `Word[${i.path[0]}].${i.path.slice(1).join('.')}: ${i.message}`
    );
    throw new Error(`Word validation failed:\n${issues.join('\n')}`);
  }
  return result.data;
}
