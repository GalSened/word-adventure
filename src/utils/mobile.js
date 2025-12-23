/**
 * Mobile utilities for touch interactions and haptic feedback
 */

/**
 * Trigger haptic feedback if available
 * @param {'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'} type
 */
export function hapticFeedback(type = 'light') {
    // Check for Vibration API
    if (!navigator.vibrate) return;

    const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10, 50, 10],
        warning: [30, 50, 30],
        error: [50, 100, 50],
        tap: [5],
        selection: [8]
    };

    try {
        navigator.vibrate(patterns[type] || patterns.light);
    } catch {
        // Silently fail if vibration not supported
    }
}

/**
 * Check if device is mobile
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    ) || window.innerWidth <= 768;
}

/**
 * Check if device supports touch
 */
export function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Prevent pull-to-refresh on mobile (for game screens)
 */
export function preventPullToRefresh(element) {
    if (!element) return () => {};

    let startY = 0;

    const handleTouchStart = (e) => {
        startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
        const currentY = e.touches[0].clientY;
        const scrollTop = element.scrollTop;

        // Prevent pull-to-refresh when at top and pulling down
        if (scrollTop <= 0 && currentY > startY) {
            e.preventDefault();
        }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
    };
}

/**
 * Create swipe handler for element
 */
export function createSwipeHandler({ onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50 }) {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
    };

    const handleTouchEnd = (e) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const duration = Date.now() - startTime;

        // Only register swipes that are quick enough
        if (duration > 500) return;

        const diffX = endX - startX;
        const diffY = endY - startY;

        // Horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                onSwipeRight?.();
            } else {
                onSwipeLeft?.();
            }
        }
        // Vertical swipe
        else if (Math.abs(diffY) > threshold) {
            if (diffY > 0) {
                onSwipeDown?.();
            } else {
                onSwipeUp?.();
            }
        }
    };

    return {
        onTouchStart: handleTouchStart,
        onTouchEnd: handleTouchEnd
    };
}

/**
 * Safe area insets for notched devices
 */
export function getSafeAreaInsets() {
    const style = getComputedStyle(document.documentElement);
    return {
        top: parseInt(style.getPropertyValue('--sat') || '0', 10),
        right: parseInt(style.getPropertyValue('--sar') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
        left: parseInt(style.getPropertyValue('--sal') || '0', 10)
    };
}

/**
 * Lock screen orientation (if supported)
 */
export async function lockOrientation(orientation = 'portrait') {
    try {
        if (screen.orientation?.lock) {
            await screen.orientation.lock(orientation);
            return true;
        }
    } catch {
        // Orientation lock not supported
    }
    return false;
}

/**
 * Keep screen awake during gameplay
 */
let wakeLock = null;

export async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            return true;
        }
    } catch {
        // Wake lock not supported or denied
    }
    return false;
}

export async function releaseWakeLock() {
    if (wakeLock) {
        await wakeLock.release();
        wakeLock = null;
    }
}

export default {
    hapticFeedback,
    isMobile,
    isTouchDevice,
    preventPullToRefresh,
    createSwipeHandler,
    getSafeAreaInsets,
    lockOrientation,
    requestWakeLock,
    releaseWakeLock
};
