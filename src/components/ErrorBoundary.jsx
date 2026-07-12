import React from 'react';
import { RefreshCw, Home } from 'lucide-react';

/**
 * ErrorBoundary component - Catches and handles React errors
 * Prevents entire app crashes and shows user-friendly error screen
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        this.setState({
            error,
            errorInfo
        });

        // Optional: Send error to analytics service
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });

        // Call optional onReset callback from props
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    handleGoHome = () => {
        this.handleReset();

        // Navigate to home if callback provided
        if (this.props.onGoHome) {
            this.props.onGoHome();
        }
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI can be passed as prop
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
                        <div className="text-7xl mb-4" role="img" aria-label="Error">
                            😵
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-3">
                            אופס! משהו השתבש
                        </h1>
                        <p className="text-slate-600 mb-6">
                            נתקלנו בבעיה לא צפויה. אל דאגה, המידע שלך נשמר!
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <details className="mb-6 text-right">
                                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                                    פרטים טכניים (למפתחים)
                                </summary>
                                <div className="mt-2 p-3 bg-red-50 rounded-lg text-xs text-right font-mono overflow-auto max-h-40">
                                    <div className="text-red-700 font-bold mb-1">
                                        {this.state.error.toString()}
                                    </div>
                                    <div className="text-red-600">
                                        {this.state.errorInfo?.componentStack}
                                    </div>
                                </div>
                            </details>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                aria-label="Go to home screen"
                            >
                                <Home size={20} />
                                לתפריט ראשי
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                                aria-label="Try again"
                            >
                                <RefreshCw size={20} />
                                נסה שוב
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
