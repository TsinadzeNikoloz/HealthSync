import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PAGE_SIZE } from '../../utils/constants';

interface PaginationProps {
  count: number;
  pageSize?: number;
}

const Pagination: React.FC<PaginationProps> = ({ count, pageSize = PAGE_SIZE }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = !searchParams.get('page') ? 1 : Number(searchParams.get('page'));
  const pageCount = Math.ceil(count / pageSize);

  if (pageCount <= 1) return null;

  const handlePage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next);
  };

  return (
    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
      <p className="text-sm text-slate-400 font-semibold">
        Showing <span className="text-slate-700">{(currentPage - 1) * pageSize + 1}</span>–
        <span className="text-slate-700">{Math.min(currentPage * pageSize, count)}</span> of{' '}
        <span className="text-slate-700">{count}</span> results
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePage(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-10 h-10 rounded-xl border border-slate-100 bg-white flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-500 disabled:hover:border-slate-100"
        >
          <i className="fas fa-chevron-left text-xs"></i>
        </button>

        {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePage(page)}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
              page === currentPage
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                : 'border border-slate-100 bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePage(currentPage + 1)}
          disabled={currentPage === pageCount}
          className="w-10 h-10 rounded-xl border border-slate-100 bg-white flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-500 disabled:hover:border-slate-100"
        >
          <i className="fas fa-chevron-right text-xs"></i>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
