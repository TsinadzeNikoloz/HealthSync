import React from 'react';
import AppLogo from '../../ui/AppLogo';

interface AuthPaneProps {
	title: React.ReactNode;
	description: string;
	footer: React.ReactNode;
}

export default function AuthPane({
	title,
	description,
	footer,
}: AuthPaneProps) {
	return (
		<div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 lg:flex lg:w-3/5">
			<div className="absolute right-0 top-0 h-3/4 w-3/4 -translate-y-1/4 translate-x-1/3 rounded-full bg-blue-500/10 blur-[120px]"></div>
			<div className="absolute bottom-0 left-0 h-1/2 w-1/2 -translate-x-1/4 translate-y-1/4 rounded-full bg-blue-400/10 blur-[100px]"></div>
			<div className="relative z-10 flex h-full w-full flex-col justify-between p-20">
				<div>
					<AppLogo variant="dark" className="mb-12" />
					<div className="max-w-xl">
						<h1 className="mb-8 text-6xl font-black leading-[1.1] text-white">
							{title}
						</h1>
						<p className="text-xl font-medium leading-relaxed text-blue-100/70">
							{description}
						</p>
					</div>
				</div>
				{footer}
			</div>
		</div>
	);
}
