import { Link } from 'react-router-dom';

export default function NotFound() {
	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
			<div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-12 max-w-md w-full text-center">
				<div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
					<i className="fas fa-ghost text-2xl text-blue-500"></i>
				</div>
				<p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">404</p>
				<h1 className="text-2xl font-black text-slate-800 mb-2">Page not found</h1>
				<p className="text-slate-400 font-medium text-sm mb-8">
					The page you're looking for doesn't exist or has been moved.
				</p>
				<Link
					to="/"
					className="inline-block bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-blue-100 hover:-translate-y-0.5 active:scale-95"
				>
					Go Home
				</Link>
			</div>
		</div>
	);
}
