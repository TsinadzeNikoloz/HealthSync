import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

import chalk from 'chalk';
import mongoose from 'mongoose';
import app from './app.js';
import { startScheduler } from './utils/scheduler.js';

process.on('uncaughtException', (err) => {
	console.log(chalk.bold.redBright('Uncaught Exception! Shutting Down...'));
	console.log(chalk.bold.redBright(`${err.name}: ${err.message}`));
	process.exit(1);
});

const DB = (process.env.DATABASE as string).replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD as string,
);

mongoose
	.connect(DB)
	.then(() => {
		console.log(chalk.bold.cyanBright('DATABASE connection successful..'));
		startScheduler();
	})
	.catch((err: Error) => {
		console.log(chalk.bold.redBright('DATABASE connection failed!'));
		console.log(chalk.bold.redBright(`${err.name}: ${err.message}`));
		process.exit(1);
	});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(
		chalk.bold.yellow(
			`Server running in ${process.env.NODE_ENV} mode on port: ${process.env.PORT}`,
		),
	);
});

process.on('unhandledRejection', (err: Error) => {
	console.log(
		chalk.bold.redBright('UNHANDLED REJECTION! Shutting Down...'),
	);
	console.log(chalk.bold.redBright(`${err.name}: ${err.message}`));
	server.close(() => {
		process.exit(1);
	});
});
