import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	isLoading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

const baseStyles =
	'inline-flex items-center justify-center gap-2 font-bold transition-[background-color,color,transform] rounded-2xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

const variants = {
	primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100',
	secondary:
		'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-100',
	outline: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
	ghost: 'text-slate-500 hover:bg-blue-50 hover:text-blue-600',
	danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100',
};

const sizes = {
	sm: 'px-4 py-2 text-xs',
	md: 'px-6 py-3 text-sm',
	lg: 'px-8 py-5 text-base',
};

export default function Button({
	children,
	variant = 'primary',
	size = 'md',
	isLoading,
	leftIcon,
	rightIcon,
	className = '',
	...props
}: ButtonProps) {
	return (
		<button
			className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
			disabled={isLoading || props.disabled}
			aria-busy={isLoading}
			{...props}
		>
			{isLoading ? <i className="fas fa-spinner fa-spin mr-1"></i> : leftIcon}
			{children}
			{!isLoading && rightIcon}
		</button>
	);
}
