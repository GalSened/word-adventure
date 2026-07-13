import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeedbackToast from './FeedbackToast';

describe('FeedbackToast — store/inventory feedback is finally visible', () => {
    it('shows the message when feedback is set', () => {
        render(<FeedbackToast feedback={{ type: 'success', message: 'רכשת כתר מלכותי! 🎉' }} />);
        expect(screen.getByRole('status').textContent).toContain('רכשת כתר מלכותי');
    });

    it('renders nothing without feedback', () => {
        render(<FeedbackToast feedback={null} />);
        expect(screen.queryByRole('status')).toBeNull();
    });
});
