// Uploads images that are referenced by filename in the database (and exist in public/img)
// to Cloudinary, then rewrites the DB fields to the Cloudinary URLs.
//
//   npm run migrate:images -- --dry     # show what would change
//   npm run migrate:images              # do it
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: './config.env' });

const { default: User } = await import('../models/user.model.js');
const { default: Service } = await import('../models/service.model.js');
const { storeImage } = await import('../utils/imageStorage.js');

const dry = process.argv.includes('--dry');

for (const key of [
	'CLOUDINARY_CLOUD_NAME',
	'CLOUDINARY_API_KEY',
	'CLOUDINARY_API_SECRET',
]) {
	if (!process.env[key]) {
		console.error(`Missing ${key} in config.env — aborting.`);
		process.exit(1);
	}
}

const DB = (process.env.DATABASE as string).replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD as string,
);
await mongoose.connect(DB);

const migrate = async (
	label: string,
	value: string | undefined,
	folder: 'users' | 'services',
): Promise<string | null> => {
	if (!value || value.startsWith('http') || value === 'default.jpg') return null;

	const file = path.join(process.cwd(), 'public', 'img', folder, value);
	let buffer: Buffer;
	try {
		buffer = await fs.readFile(file);
	} catch {
		console.warn(`MISSING  ${label}: ${value} (no local file, left unchanged)`);
		return null;
	}

	if (dry) {
		console.log(`WOULD    ${label}: ${value}`);
		return null;
	}
	const url = await storeImage(buffer, folder, path.parse(value).name);
	console.log(`MIGRATED ${label}: ${value} -> ${url}`);
	return url;
};

for (const user of await User.find()) {
	const url = await migrate(`user ${user.email}`, user.photo, 'users');
	if (url) {
		user.photo = url;
		await user.save({ validateBeforeSave: false });
	}
}

for (const service of await Service.find()) {
	const url = await migrate(
		`service ${service.name}`,
		service.imageCover,
		'services',
	);
	if (url) {
		service.imageCover = url;
		await service.save({ validateBeforeSave: false });
	}
}

await mongoose.disconnect();
console.log(dry ? 'Dry run finished.' : 'Done.');
