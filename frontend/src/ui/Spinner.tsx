interface SpinnerProps {
	fullscreen?: boolean;
}

function Spinner({ fullscreen = false }: SpinnerProps) {
	if (fullscreen) {
		return (
			<div className="h-screen flex items-center justify-center bg-slate-50">
				<div role="status" aria-label="Loading" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center h-64">
			<div role="status" aria-label="Loading" className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
		</div>
	);
}

export default Spinner;
