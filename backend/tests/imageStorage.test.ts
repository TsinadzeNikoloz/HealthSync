import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

const { upload_stream } = vi.hoisted(() => ({ upload_stream: vi.fn() }));
vi.mock('cloudinary', () => ({
	v2: {
		config: vi.fn(),
		uploader: { upload_stream },
	},
}));

import { storeImage } from '../utils/imageStorage.js';

const CLOUD_VARS = [
	'CLOUDINARY_CLOUD_NAME',
	'CLOUDINARY_API_KEY',
	'CLOUDINARY_API_SECRET',
] as const;

afterEach(() => {
	for (const k of CLOUD_VARS) delete process.env[k];
	upload_stream.mockReset();
});

describe('storeImage', () => {
	it('writes to public/img and returns the filename when Cloudinary is not configured', async () => {
		const name = `test-image-${Date.now()}`;
		const result = await storeImage(Buffer.from('fake-jpeg'), 'users', name);

		expect(result).toBe(`${name}.jpeg`);
		const file = path.join(process.cwd(), 'public', 'img', 'users', result);
		expect((await fs.readFile(file)).toString()).toBe('fake-jpeg');
		await fs.unlink(file);
	});

	it('uploads to Cloudinary and returns the secure URL when configured', async () => {
		for (const k of CLOUD_VARS) process.env[k] = 'x';
		upload_stream.mockImplementation((_opts, cb) => ({
			end: () =>
				cb(null, { secure_url: 'https://res.cloudinary.com/demo/image/upload/a.jpg' }),
		}));

		const result = await storeImage(Buffer.from('fake-jpeg'), 'services', 'svc-1');

		expect(result).toBe('https://res.cloudinary.com/demo/image/upload/a.jpg');
		expect(upload_stream.mock.calls[0][0]).toMatchObject({
			folder: 'healthsync/services',
			public_id: 'svc-1',
		});
	});

	it('rejects when the Cloudinary upload fails', async () => {
		for (const k of CLOUD_VARS) process.env[k] = 'x';
		upload_stream.mockImplementation((_opts, cb) => ({
			end: () => cb(new Error('boom'), undefined),
		}));

		await expect(storeImage(Buffer.from('x'), 'users', 'u')).rejects.toThrow('boom');
	});
});
