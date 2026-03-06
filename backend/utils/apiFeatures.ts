import type { Query } from 'mongoose';

interface QueryString {
	search?: string;
	page?: string | number;
	sort?: string;
	limit?: string | number;
	fields?: string;
	[key: string]: unknown;
}

class APIFeatures<T> {
	query: Query<T[], T>;
	queryString: QueryString;

	constructor(query: Query<T[], T>, queryString: QueryString) {
		this.query = query;
		this.queryString = queryString;
	}

	search(fields: string[] = ['name', 'email']): this {
		if (this.queryString.search) {
			const escaped = this.queryString.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const searchRegex = new RegExp(escaped, 'i');
			this.query = this.query.find({
				$or: fields.map((f) => ({ [f]: searchRegex })),
			} as Record<string, unknown>);
		}
		return this;
	}

	filter(): this {
		// 1A)Filtering
		const queryObj = { ...this.queryString };
		const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
		excludedFields.forEach((el) => delete queryObj[el]);
		// 1B) Advanced Filtering
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

		this.query = this.query.find(JSON.parse(queryStr));
		return this;
	}

	sort(): this {
		// 2) Sorting
		if (this.queryString.sort) {
			const sortBy = (this.queryString.sort as string).split(',').join(' ');
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort('-createdAt');
		}
		return this;
	}

	limitFields(): this {
		// 3) Field Limiting
		if (this.queryString.fields) {
			const fields = (this.queryString.fields as string).split(',').join(' ');
			this.query = this.query.select(fields);
		} else {
			this.query = this.query.select('-__v');
		}
		return this;
	}

	paginate(): this {
		// 4) Pagination
		const page = Number(this.queryString.page) || 1;
		const limit = Math.min(Number(this.queryString.limit) || 100, 200);
		const skip = (page - 1) * limit;

		this.query = this.query.skip(skip).limit(limit);
		return this;
	}
}

export default APIFeatures;
