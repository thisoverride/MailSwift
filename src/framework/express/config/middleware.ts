import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import express, { Application } from 'express';

export const configureMiddleware = (app: Application): void => {
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(express.json({ limit: '50mb' }));
  app.use(morgan('dev'));
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }));
};
