/**
 * Purchased theme sets (ערכות נושא) — the equipped theme restyles the whole
 * app shell: page background and the two ambient color blobs.
 *
 * Tailwind only ships classes it can see statically, so every theme lists
 * full literal class names (never template-built ones).
 */
export const THEME_STYLES = {
    default: {
        page: 'bg-slate-50',
        blobA: 'bg-purple-300',
        blobB: 'bg-blue-300',
    },
    theme_ocean: {
        page: 'bg-cyan-50',
        blobA: 'bg-blue-300',
        blobB: 'bg-cyan-300',
    },
    theme_forest: {
        page: 'bg-green-50',
        blobA: 'bg-emerald-300',
        blobB: 'bg-lime-300',
    },
    theme_sunset: {
        page: 'bg-orange-50',
        blobA: 'bg-orange-300',
        blobB: 'bg-pink-300',
    },
    theme_galaxy: {
        page: 'bg-indigo-100',
        blobA: 'bg-purple-400',
        blobB: 'bg-indigo-400',
    },
    theme_candy: {
        page: 'bg-pink-50',
        blobA: 'bg-pink-300',
        blobB: 'bg-fuchsia-300',
    },
};

/** Resolve the equipped theme id (equipped.theme slot) to its styles. */
export function getThemeStyle(themeId) {
    return THEME_STYLES[themeId] || THEME_STYLES.default;
}
