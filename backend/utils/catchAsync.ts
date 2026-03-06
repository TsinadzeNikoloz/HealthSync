import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<unknown>;

const catchAsync = (fn: AsyncRequestHandler): RequestHandler => {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
};

export default catchAsync;
