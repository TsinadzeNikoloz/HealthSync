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
				<div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
					<div className="w-full max-w-md rounded-[2.5rem] border border-slate-100 bg-white p-12 text-center shadow-sm">
						<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50">
							<i className="fas fa-triangle-exclamation text-2xl text-rose-500"></i>
						</div>
						<h1 className="mb-2 text-2xl font-black text-slate-800">
							Something went wrong
						</h1>
						<p className="mb-8 text-sm font-medium text-slate-400">
							An unexpected error occurred. Try refreshing the page.
						</p>
						{import.meta.env.DEV && this.state.error && (
							<p className="mb-8 break-all rounded-2xl bg-slate-50 px-4 py-3 text-left font-mono text-xs text-slate-300">
								{this.state.error.message}
							</p>
						)}
						<button
							onClick={() => window.location.reload()}
							className="rounded-2xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-xl shadow-blue-100 transition-all hover:bg-blue-700"
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
