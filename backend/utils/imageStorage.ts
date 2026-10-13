import fs from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

const isCloudinaryEnabled = () =>
	Boolean(
		process.env.CLOUDINARY_CLOUD_NAME &&
			process.env.CLOUDINARY_API_KEY &&
			process.env.CLOUDINARY_API_SECRET,
	);

let configured = false;
const configure = () => {
	if (configured) return;
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
		secure: true,
	});
	configured = true;
};

/**
 * Stores a processed JPEG and returns the value to save in the database:
 * - Cloudinary configured: the image's https URL (survives redeploys on hosts with ephemeral disk)
 * - otherwise (local dev / tests): writes public/img/<folder>/<name>.jpeg and returns "<name>.jpeg"
 */
export const storeImage = async (
	buffer: Buffer,
	folder: 'users' | 'services',
	name: string,
): Promise<string> => {
	if (!isCloudinaryEnabled()) {
		const filename = `${name}.jpeg`;
		await fs.writeFile(
			path.join(process.cwd(), 'public', 'img', folder, filename),
			buffer,
		);
		return filename;
	}

	configure();
	return new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					folder: `healthsync/${folder}`,
					public_id: name,
					resource_type: 'image',
					overwrite: true,
				},
				(err, result) => {
					if (err || !result) {
						return reject(err ?? new Error('Cloudinary upload failed'));
					}
					resolve(result.secure_url);
				},
			)
			.end(buffer);
	});
};
