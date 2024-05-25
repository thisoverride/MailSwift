import helmet from 'helmet';
import morgan from 'morgan';
import express, { Application ,Request, Response,NextFunction } from 'express';
import PathValidator from '../validator/PathValidator';
import EmailSenderController from '../../adapter/controller/EmailSenderController';
import EmailSenderService from '../../usecases/services/EmailSenderService';
import ApplicationController from '../../adapter/controller/ApplicationController';
import ChannelSettingService from '../../usecases/services/ChannelSettingService';
import mongoose, { ConnectOptions } from 'mongoose';

import 'dotenv/config';
import ApplicationRepository from '../../repository/ApplicationRepository';

export default class ExpressApp {
  public app: Application;
  public controller: Array<any>;
  public PathValidator: PathValidator;

  /**
   * Creates an instance of ExpressApp.
   * Initializes middleware and sets up error handling.
   * @memberof ExpressApp
   */
  public constructor() {
    this.app = express();
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(morgan('dev'));
    this.PathValidator = new PathValidator();
    this.controller = [
      new EmailSenderController(new EmailSenderService()),
      new ApplicationController(new ChannelSettingService(new ApplicationRepository()))
    ];
    this.injectControllers();
    this.setupErrorHandling();
  }

  /**
   *
   * Injects controller routes into the Express.
   * @private
   * @memberof ExpressApp
   */
  private injectControllers(): void {
    this.controller.forEach((controllerObject) => {
      controllerObject.ROUTE.forEach((controllerProperties: string) => {
        const [method, path, controller] = this.PathValidator.checkPath(controllerProperties);
        if (!(controller in controllerObject) || typeof controllerObject[controller] !== 'function') {
          throw new Error(`The function ${controller} is not a valid controller in the provided object.`);
        }        
        (this.app as unknown as { [key: string]: Function })[method](path, (req: Request, res: Response) =>
          controllerObject[controller](req, res));
      });
    });
  }

  /**
   *
   * Sets up error handling middleware.
   * @private
   * @memberof ExpressApp
   */
   private setupErrorHandling(): void {
    this.app.use((req: Request, res: Response) => {
      res.status(404).send('')
    });
    
    this.app.use((err: Error, request: Request, response: Response ,next: NextFunction) => {
      if (err instanceof SyntaxError) {
        response.status(400).json({message: 'Bad request: the format body is incorrect.'});
      } else {
        next(err);
      }
    });
  }

  /**
   *
   * Starts the Express application on the specified port.
   * @param {number} port
   * @memberof ExpressApp
   */
  public async startEngine(port: number) {
    try {
      await mongoose.connect(process.env.MONGODB_URI as string, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions );
    
    console.info('Connected to MongoDB');
      this.app.listen(port, () => {
          console.info(`Service running on http://localhost:${port}`);
        });
    } catch (error) {
      console.error(error);
    }

  }
}

 