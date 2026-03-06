import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import mongoose from 'mongoose';
import Service from '../../models/service.model.js';
import User from '../../models/user.model.js';
import Review from '../../models/review.model.js';
import Appointment from '../../models/appointment.model.js';
import MedicalRecord from '../../models/medicalRecord.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './config.env' });

const DB = (process.env.DATABASE as string).replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD as string,
);

mongoose.connect(DB).then(() => {
	console.log('DATABASE connection successful..');
});

// READ JSON FILE
const services = JSON.parse(
	fs.readFileSync(`${__dirname}/services.json`, 'utf-8'),
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
	fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);
const appointments = JSON.parse(
	fs.readFileSync(`${__dirname}/appointments.json`, 'utf-8'),
);
const medicalRecords = JSON.parse(
	fs.readFileSync(`${__dirname}/medical-records.json`, 'utf-8'),
);

// IMPORT DATA INTO DATABASE
const importData = async () => {
	try {
		await User.create(users, { validateBeforeSave: false });
		await Service.create(services);
		await Review.create(reviews);
		await Appointment.create(appointments);
		await MedicalRecord.create(medicalRecords);
		console.log('Data Successfully loaded');
		process.exit();
	} catch (err) {
		console.log(err);
	}
};

// DELETE ALL DATA FROM DATABASE
const deleteData = async () => {
	try {
		await MedicalRecord.deleteMany();
		await Appointment.deleteMany();
		await Review.deleteMany();
		await Service.deleteMany();
		await User.deleteMany();
		console.log('Data Deleted Successfully');
		process.exit();
	} catch (err) {
		console.log(err);
	}
};

if (process.argv[2] === '--import') {
	importData();
} else if (process.argv[2] === '--delete') {
	deleteData();
}
