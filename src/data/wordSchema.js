import { z } from 'zod';

export const WordSchema = z.object({
  id: z.string().min(1),
  word: z.string().min(1),
  hebrew: z.string().min(1),
  hint: z.string().min(1),
  category: z.string().min(1),
  emoji: z.string().min(1),
  level: z.enum(['easy', 'medium', 'hard', 'expert']),
  type: z.enum(['word', 'sentence']),
  gender: z.enum(['m', 'f', 'n']),
  exampleSentence: z.string().min(1),
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
