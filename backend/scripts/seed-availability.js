import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../config.env') });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

await mongoose.connect(DB);
console.log('Connected to DB');

const result = await mongoose.connection.db
  .collection('users')
  .updateMany(
    { role: 'DOCTOR', availability: { $exists: false } },
    { $set: { availability: [] } },
  );

console.log(`Updated ${result.modifiedCount} doctors with empty availability`);

await mongoose.disconnect();
console.log('Done');
