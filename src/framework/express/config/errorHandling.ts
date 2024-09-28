import type { Request, Response, NextFunction, Application } from 'express';

export const configureErrorHandling = (app: Application): void => {
  app.use((req: Request, res: Response) => {
    res.status(404).send('');
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError) {
      res.status(400).json({ message: 'Bad request: the format body is incorrect.' });
    } else {
      next(err);
    }
  });
};
