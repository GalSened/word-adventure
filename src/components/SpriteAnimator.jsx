import React, { useEffect } from 'react';
import { motion, useAnimate } from 'framer-motion';

const SpriteAnimator = ({
    spriteSheet,
    frames = 4,
    fps = 10,
    scale = 1,
    className = ""
}) => {
    const [scope, animate] = useAnimate();

    useEffect(() => {
        // We animate the backgroundPosition from 0% to 100% in discrete steps
        // For N frames, we need N steps. 
        // The background position X moves from 0px to -(width_of_sheet - width_of_frame) typically
        // Or if using percentages with background-size fitting, steps(N).

        // Simplest approach: Use CSS steps() timing function.
        // However, framer motion 'animate' is great for control.

        // Let's assume the sprite sheet is horizontal.
        // background-position-x goes from 0 to 100%? No, standard CSS sprite logic:
        // width: 100% / frames. 
        // actually, simpler: use stepped animation on backgroundPositionX.

        const duration = frames / fps;

        // We want to jump through frames.
        // We can animate a value from 0 to frames-1 and update background position?
        // Or just use native CSS animation via Framer Motion for performance.

        animate(scope.current, { backgroundPositionX: ["0%", "100%"] }, {
            ease: `steps(${frames})`, // cycles through all frames
            duration: duration,
            repeat: Infinity,
            repeatType: "loop"
        });

    }, [spriteSheet, frames, fps]);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <motion.div
                ref={scope}
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${spriteSheet})`,
                    backgroundSize: `${frames * 100}% 100%`, // The sheet is N times the width of the container
                    backgroundRepeat: 'no-repeat',
                }}
            />
        </div>
    );
};

export default SpriteAnimator;
