import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AvatarWithGear from './AvatarWithGear';

describe('AvatarWithGear — equipped cosmetics are actually visible', () => {
    it('renders the bare avatar with no equipment', () => {
        render(<AvatarWithGear avatar="🧙" equipped={{}} />);
        expect(screen.getByText('🧙')).toBeTruthy();
    });

    it('renders every equipped cosmetic on its slot', () => {
        render(<AvatarWithGear avatar="🧙" equipped={{ head: 'crown', face: 'glasses' }} />);
        expect(screen.getByLabelText('כתר מלכותי').textContent).toBe('👑');
        expect(screen.getByLabelText('משקפיים חכמים').textContent).toBe('👓');
    });

    it('ignores non-visual equipment and unknown item ids', () => {
        const { container } = render(
            <AvatarWithGear
                avatar="🧙"
                equipped={{ booster_double_points: 'double_points', theme: 'theme_ocean', head: 'no_such_item' }}
            />
        );
        // only the avatar itself — boosters/themes/ghosts add no overlays
        expect(container.querySelectorAll('[aria-label]')).toHaveLength(0);
    });
});
