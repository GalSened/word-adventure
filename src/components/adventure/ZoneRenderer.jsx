import React from 'react';

/**
 * ZoneRenderer - Renders zone background with sky gradient, ground layer,
 * and parallax decorative elements scrolled by the game loop via sceneRef.
 *
 * @param {Object} props
 * @param {Object} props.zone - Zone config from ADVENTURE_ZONES
 * @param {React.RefObject} props.sceneRef - Ref for scroll container (game loop updates transform)
 * @param {React.ReactNode} props.children - Characters and UI overlay
 */
export default function ZoneRenderer({ zone, sceneRef, children }) {
  return (
    <div className="fixed inset-0 overflow-hidden select-none">
      {/* Sky layer with smooth zone transition */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${zone.theme.sky} transition-all duration-[3000ms]`}
      />

      {/* Ground layer */}
      <div
        className={`absolute bottom-0 w-full h-[35vh] bg-gradient-to-t ${zone.theme.ground}`}
      />

      {/* Decorative elements layer (parallax via sceneRef transform) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          ref={sceneRef}
          style={{ willChange: 'transform' }}
        >
          {zone.theme.decorEmojis.map((emoji, i) => (
            <div
              key={i}
              className="absolute bottom-[20vh] text-6xl"
              style={{ left: `${i * 250}px` }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Characters and UI overlay */}
      {children}
    </div>
  );
}
