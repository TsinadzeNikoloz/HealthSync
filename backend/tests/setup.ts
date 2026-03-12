import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), 'config.env') });

// Ensure required env vars are set for tests
process.env.JWT_SECRET_KEY ??= 'test-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN ??= '1d';
process.env.JWT_COOKIE_EXPIRES_IN ??= '1';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

let mongod: MongoMemoryServer;

beforeAll(async () => {
	mongod = await MongoMemoryServer.create();
	const uri = mongod.getUri();
	await mongoose.connect(uri);
});

afterEach(async () => {
	// Clear all collections between tests
	const collections = mongoose.connection.collections;
	for (const key in collections) {
		await collections[key].deleteMany({});
	}
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongod.stop();
});
