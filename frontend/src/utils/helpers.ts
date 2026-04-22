import { formatDistance, parseISO, format } from 'date-fns';

export function getServiceImageUrl(imageCover?: string | null): string {
	if (!imageCover) return `https://picsum.photos/seed/service/800/600`;
	if (imageCover.startsWith('http') || imageCover.startsWith('/img')) return imageCover;
	return `/img/services/${imageCover}`;
}

export function getUserPhotoUrl(photo?: string | null, name = 'U'): string {
	if (!photo)
		return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`;
	if (photo.startsWith('http') || photo.startsWith('/img')) return photo;
	return `/img/users/${photo}`;
}

export function formatCurrency(value: number): string {
	return new Intl.NumberFormat('en', {
		style: 'currency',
		currency: 'EUR',
	}).format(value);
}

export function formatDistanceFromNow(dateStr: string): string {
	return formatDistance(parseISO(dateStr), new Date(), {
		addSuffix: true,
	})
		.replace('about ', '')
		.replace('in', 'In');
}

export function formatDate(dateStr: string): string {
	return format(parseISO(dateStr), 'dd/MM/yyyy');
}

export function formatDateTime(dateStr: string): string {
	return format(parseISO(dateStr), 'EEE, MMM dd yyyy, HH:mm');
}

export function formatTime(dateStr: string): string {
	return new Date(dateStr).toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});
}

export function formatLongDate(date: Date = new Date()): string {
	return date.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	});
}

export function getToday(options?: { end?: boolean }): string {
	const today = new Date();
	if (options?.end) {
		today.setUTCHours(23, 59, 59, 999);
	} else {
		today.setUTCHours(0, 0, 0, 0);
	}
	return today.toISOString();
}
