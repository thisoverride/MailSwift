import express, { Application } from 'express';
import { Container } from 'inversify';
import HotSpring from './hotspring/core/HotSpring';
import mongoose, { ConnectOptions } from 'mongoose';
import EmailService from '../../adapter/services/EmailService';
import EmailController from '../../adapter/controller/EmailController';
import { configureMiddleware } from './config/middleware';
import { configureErrorHandling } from './config/errorHandling';


export default class ExpressApp {
  private app: Application;
  private IoCContainer: Container;

  constructor() {
    this.app = express();
    this.IoCContainer = new Container();
    this._initializeIoCContainer();
    this._configureApp();
  }

  private _initializeIoCContainer(): void {
    this.IoCContainer.bind<EmailService>(EmailService).toSelf();
    this.IoCContainer.bind<EmailController>(EmailController).toSelf();
  }

  private _configureApp(): void {
    configureMiddleware(this.app)
    HotSpring.bind(this.app, this.IoCContainer, EmailController)
    configureErrorHandling(this.app)
  }

  public async run(port: number): Promise<void> {
    try {
      this.app.listen(port, async () => {
        await mongoose.connect(process.env.MONGODB_URI as string, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        } as ConnectOptions );
        console.info('Connected to MongoDB');
        console.info('\x1b[1m\x1b[36m%s\x1b[0m', `User Service on http://localhost:${port}`);
      });
    } catch (error) {
      throw new Error(`Connection to database failed: ${String(error)}`);
    }
  }
}



