import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false, error: null };

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error('ErrorBoundary caught:', error, info);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
					<div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-12 max-w-md w-full text-center">
						<div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
							<i className="fas fa-triangle-exclamation text-2xl text-rose-500"></i>
						</div>
						<h1 className="text-2xl font-black text-slate-800 mb-2">
							Something went wrong
						</h1>
						<p className="text-slate-400 font-medium text-sm mb-8">
							An unexpected error occurred. Try refreshing the page.
						</p>
						{this.state.error && (
							<p className="text-xs text-slate-300 font-mono bg-slate-50 rounded-2xl px-4 py-3 mb-8 text-left break-all">
								{this.state.error.message}
							</p>
						)}
						<button
							onClick={() => window.location.reload()}
							className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100"
						>
							Refresh Page
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
