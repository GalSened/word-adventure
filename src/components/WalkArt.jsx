import React from 'react';

/**
 * Hand-drawn SVG art for the pet-walk scene.
 *
 * The characters are rigged: limbs are separate nodes driven by the
 * walk-* CSS keyframes in index.css (transform-based, GPU-friendly),
 * so the gait never swaps glyphs — that was the source of the old
 * emoji flicker. Pause the gait by putting `walk-paused` on a parent.
 * All figures face RIGHT (the direction of travel).
 */

export function DogWalker({ mood = 'walk', className = '', style }) {
    const tailClass = mood === 'happy' ? 'walk-tail walk-tail-fast' : 'walk-tail';
    return (
        <svg viewBox="0 0 150 115" className={className} style={style} aria-hidden="true">
            <defs>
                <linearGradient id="dog-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f7c873" />
                    <stop offset="1" stopColor="#e09a4a" />
                </linearGradient>
                <linearGradient id="dog-leg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#e8a958" />
                    <stop offset="1" stopColor="#c9853e" />
                </linearGradient>
            </defs>

            {/* ground shadow */}
            <ellipse cx="78" cy="108" rx="56" ry="6" fill="rgba(0,0,0,0.18)" />

            {/* tail (root at its right end, against the body) */}
            <path
                className={tailClass}
                d="M30 48 Q12 34 16 20 Q22 30 34 40 Z"
                fill="#c9853e"
            />

            {/* far legs (phase B, slightly darker for depth) */}
            <rect className="walk-leg-b" x="46" y="60" width="9" height="34" rx="4.5" fill="#b3762f" />
            <rect className="walk-leg-b" x="100" y="60" width="9" height="34" rx="4.5" fill="#b3762f" />

            {/* body */}
            <g className="walk-bob">
                <ellipse cx="76" cy="52" rx="44" ry="25" fill="url(#dog-body)" />
                <ellipse cx="104" cy="60" rx="16" ry="12" fill="#fbe3bb" />

                {/* head */}
                <g>
                    <circle cx="120" cy="30" r="22" fill="url(#dog-body)" />
                    {/* snout */}
                    <ellipse cx="136" cy="38" rx="12" ry="8.5" fill="#fbe3bb" />
                    <circle cx="144" cy="35" r="4" fill="#4e342e" />
                    <path d="M132 44 Q137 48 142 44" stroke="#4e342e" strokeWidth="2" fill="none" strokeLinecap="round" />
                    {mood === 'happy' && (
                        <ellipse cx="137" cy="50" rx="4" ry="6" fill="#ef6c8f" />
                    )}
                    {/* eye */}
                    <circle cx="121" cy="24" r="3.6" fill="#33241c" />
                    <circle cx="122.3" cy="22.8" r="1.2" fill="#fff" />
                    {/* floppy ear */}
                    <path
                        className="walk-ear"
                        d="M104 14 Q98 34 108 44 Q116 36 116 20 Q110 12 104 14 Z"
                        fill="#c9853e"
                    />
                </g>

                {/* collar + tag */}
                <path d="M100 44 Q108 52 118 50 L116 58 Q106 60 98 52 Z" fill="#e53935" />
                <circle cx="108" cy="58" r="4" fill="#fdd835" stroke="#c8a415" strokeWidth="1" />
            </g>

            {/* near legs (phase A) */}
            <rect className="walk-leg-a" x="58" y="62" width="10" height="36" rx="5" fill="url(#dog-leg)" />
            <rect className="walk-leg-a" x="112" y="62" width="10" height="36" rx="5" fill="url(#dog-leg)" />
        </svg>
    );
}

export function KidWalker({ gender = 'boy', className = '', style }) {
    const isGirl = gender === 'girl';
    const shirtTop = isGirl ? '#f06292' : '#5cb3f7';
    const shirtBottom = isGirl ? '#d81b60' : '#1e88e5';
    return (
        <svg viewBox="0 0 100 175" className={className} style={style} aria-hidden="true">
            <defs>
                <linearGradient id={`kid-shirt-${gender}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={shirtTop} />
                    <stop offset="1" stopColor={shirtBottom} />
                </linearGradient>
            </defs>

            {/* ground shadow */}
            <ellipse cx="50" cy="168" rx="30" ry="5" fill="rgba(0,0,0,0.18)" />

            {/* back arm (swings) */}
            <rect className="walk-arm" x="30" y="78" width="9" height="34" rx="4.5" fill="#f2b98d" />

            {/* legs */}
            <g>
                <rect className="walk-leg-a" x="36" y="110" width="11" height="42" rx="5.5" fill={isGirl ? '#f8bbd0' : '#3949ab'} />
                <rect className="walk-leg-b" x="53" y="110" width="11" height="42" rx="5.5" fill={isGirl ? '#f8bbd0' : '#303f9f'} />
            </g>

            <g className="walk-bob">
                {/* torso: dress for the girl, shirt for the boy */}
                {isGirl ? (
                    <path d="M34 74 L66 74 L74 120 L26 120 Z" fill={`url(#kid-shirt-${gender})`} />
                ) : (
                    <rect x="31" y="72" width="38" height="46" rx="10" fill={`url(#kid-shirt-${gender})`} />
                )}

                {/* front arm reaching to the leash */}
                <path d="M62 80 Q80 88 88 102" stroke="#f2b98d" strokeWidth="9" fill="none" strokeLinecap="round" />
                <circle cx="89" cy="104" r="6" fill="#f2b98d" />

                {/* head */}
                <circle cx="50" cy="42" r="24" fill="#fcd7b6" />
                {/* hair */}
                {isGirl ? (
                    <path d="M26 40 Q24 12 50 14 Q76 12 74 40 Q74 62 66 70 L66 46 Q52 30 34 46 L34 70 Q26 62 26 40 Z" fill="#8d5524" />
                ) : (
                    <path d="M27 36 Q28 14 50 15 Q72 14 73 36 Q62 24 50 26 Q38 24 27 36 Z" fill="#6d4c41" />
                )}
                {/* crown */}
                <path d="M36 12 L42 20 L50 10 L58 20 L64 12 L64 22 L36 22 Z" fill="#fbc02d" stroke="#c8a415" strokeWidth="1" />
                {/* face */}
                <circle cx="59" cy="40" r="3.2" fill="#33241c" />
                <circle cx="60.2" cy="38.9" r="1" fill="#fff" />
                <path d="M52 52 Q58 57 64 51" stroke="#c96f4a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                <circle cx="64" cy="47" r="3.4" fill="rgba(240,98,146,0.35)" />
            </g>
        </svg>
    );
}

export function RoundTree({ className = '', style }) {
    return (
        <svg viewBox="0 0 120 160" className={className} style={style} aria-hidden="true">
            <ellipse cx="60" cy="154" rx="34" ry="5" fill="rgba(0,0,0,0.15)" />
            <path d="M54 92 Q52 130 50 152 L70 152 Q68 130 66 92 Z" fill="#795548" />
            <circle cx="38" cy="70" r="30" fill="#2e7d32" />
            <circle cx="82" cy="70" r="30" fill="#388e3c" />
            <circle cx="60" cy="44" r="34" fill="#43a047" />
            <circle cx="48" cy="38" r="6" fill="#66bb6a" />
            <circle cx="72" cy="58" r="5" fill="#66bb6a" />
        </svg>
    );
}

export function PineTree({ className = '', style }) {
    return (
        <svg viewBox="0 0 110 170" className={className} style={style} aria-hidden="true">
            <ellipse cx="55" cy="164" rx="30" ry="5" fill="rgba(0,0,0,0.15)" />
            <rect x="48" y="120" width="14" height="42" rx="4" fill="#6d4c41" />
            <path d="M55 8 L88 62 L22 62 Z" fill="#1b5e20" />
            <path d="M55 38 L94 98 L16 98 Z" fill="#2e7d32" />
            <path d="M55 70 L100 132 L10 132 Z" fill="#388e3c" />
        </svg>
    );
}
