import { useSearchParams } from 'react-router-dom';
import { PAGE_SIZE } from '../utils/constants';

interface PaginationProps {
	count: number;
	pageSize?: number;
}

function getPageItems(current: number, total: number): (number | '...')[] {
	const pages: (number | '...')[] = [1];
	if (current > 3) pages.push('...');
	const start = Math.max(2, current - 1);
	const end = Math.min(total - 1, current + 1);
	for (let i = start; i <= end; i++) pages.push(i);
	if (current < total - 2) pages.push('...');
	pages.push(total);
	return pages;
}

export default function Pagination({
	count,
	pageSize = PAGE_SIZE,
}: PaginationProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const currentPage = !searchParams.get('page')
		? 1
		: Number(searchParams.get('page'));
	const pageCount = Math.ceil(count / pageSize);

	if (pageCount <= 1) return null;

	const handlePage = (page: number) => {
		const next = new URLSearchParams(searchParams);
		next.set('page', String(page));
		setSearchParams(next);
	};

	const pageItems = getPageItems(currentPage, pageCount);

	return (
		<div className="flex items-center justify-between border-t border-slate-100 pt-6">
			<p className="text-sm font-semibold text-slate-400">
				Showing{' '}
				<span className="text-slate-700">
					{(currentPage - 1) * pageSize + 1}
				</span>
				–
				<span className="text-slate-700">
					{Math.min(currentPage * pageSize, count)}
				</span>{' '}
				of <span className="text-slate-700">{count}</span> results
			</p>

			<div className="flex items-center gap-2">
				<button
					onClick={() => handlePage(currentPage - 1)}
					disabled={currentPage === 1}
					aria-label="Previous page"
					className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-500 transition-colors hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-100 disabled:hover:bg-white disabled:hover:text-slate-500"
				>
					<i className="fas fa-chevron-left text-xs"></i>
				</button>

				{pageItems.map((item, idx) =>
					item === '...' ? (
						<span
							key={`ellipsis-${idx}`}
							className="flex h-10 w-10 items-center justify-center text-sm font-bold text-slate-400"
						>
							…
						</span>
					) : (
						<button
							key={item}
							onClick={() => handlePage(item)}
							aria-label={`Page ${item}`}
							aria-current={item === currentPage ? 'page' : undefined}
							className={`h-10 w-10 rounded-xl text-sm font-bold transition-colors ${
								item === currentPage
									? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
									: 'border border-slate-100 bg-white text-slate-500 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600'
							}`}
						>
							{item}
						</button>
					),
				)}

				<button
					onClick={() => handlePage(currentPage + 1)}
					disabled={currentPage === pageCount}
					aria-label="Next page"
					className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-500 transition-colors hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-100 disabled:hover:bg-white disabled:hover:text-slate-500"
				>
					<i className="fas fa-chevron-right text-xs"></i>
				</button>
			</div>
		</div>
	);
}
