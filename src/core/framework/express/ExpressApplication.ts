import express, { type Application } from 'express';
import { Container } from 'inversify';
import { configureMiddleware } from './config/middleware';
import { configureErrorHandling } from './config/errorHandling';
import { HotSpring } from './hotspring';
import { HotSpringConfig, UserConfig } from './hotspring/core/Configurator';
import { Logger } from '../utils/logger/Logger'
import path from 'path';
import mongoose, { ConnectOptions } from 'mongoose';

export class ExpressApplication {
  private readonly _app: Application;
  private readonly _IoCContainer: Container;
  private readonly _userConfig: HotSpringConfig;
  private readonly _controllersClass: any[] = [];
  private readonly _logger: Logger;
  private _isInitialized: boolean = false;

  constructor(config: HotSpringConfig, logger: Logger) {
    this._logger = logger;
    this._app = express();
    this._userConfig = config;
    this._IoCContainer = new Container();
  }

  public async initialize(): Promise<void> {
    try {
      await this._initializeIoCContainer();
      this._configureApp();
      this._isInitialized = true;
      this._logger.info('Application initialization completed');
    } catch (error: unknown) {
      this._logger.error('Failed to initialize application:', error);
      throw error;
    }
  }

  private async _initializeIoCContainer(): Promise<void> {
    this._logger.info('Starting IoC container initialization...');
    
    if (this._userConfig._controllerFiles && this._userConfig._controllerFiles.length > 0) {

      this._logger.info(`${this._userConfig._controllerFiles.length} Controller${this._userConfig._controllerFiles.length !== 1 ? 's' : ''} found`);
      
      await Promise.all(
        this._userConfig._controllerFiles.map(async (controllerPath: string) => {
          try {
            const controllerModule = await import(path.resolve(process.cwd(), controllerPath));
            const controllerClass = this._findControllerClass(controllerModule);

            if (controllerClass) {
              this._controllersClass.push(controllerClass);
              this._logger.info(`Binding controller: ${controllerClass.name}`);
              this._IoCContainer.bind(controllerClass).toSelf();
            }
          } catch (error: unknown) {
            this._logger.error(`Error importing controller ${controllerPath}:`, error);
          }
        })
      );
    } else {
      this._logger.warn('No controllers found');
    }

    if (this._userConfig._serviceFiles && this._userConfig._serviceFiles.length > 0) {
      this._logger.info(`${this._userConfig._serviceFiles.length} Service${this._userConfig._serviceFiles.length !== 1 ? 's' : ''} found`);

      await Promise.all(
        this._userConfig._serviceFiles.map(async (servicePath: string) => {
          try {
            const serviceModule: object = await import(path.resolve(process.cwd(), servicePath));
            const serviceClass: Function | null = this._findServiceClass(serviceModule);

            if (serviceClass) {
              this._logger.info(`Binding service: ${serviceClass.name}`);
              this._IoCContainer.bind(serviceClass).toSelf();
            }
          } catch (error: unknown) {
            this._logger.error(`Error importing service ${servicePath}:`, error);
          }
        })
      );
    } else {
      this._logger.warn('No services found');
    }
    
    this._logger.info('IoC container initialization completed');
  }

  private _findControllerClass(module: any): any {
    for (const key in module) {
      const exportedItem: Function | null = module[key];
      if (
        typeof exportedItem === 'function' &&
        exportedItem.name &&
        exportedItem.name.endsWith('Controller')
      ) {
        return exportedItem;
      }
    }
    return null;
  }

  private _findServiceClass(module: any): Function | null {
    for (const key in module) {
      const exportedItem: Function | null = module[key];
      if (
        typeof exportedItem === 'function' &&
        exportedItem.name &&
        exportedItem.name.endsWith('Service')
      ) {
        return exportedItem;
      }
    }
    return null;
  }

  private _configureApp(): void {
    this._logger.info('Configuring Express application...');
    configureMiddleware(this._app,this._logger);
    
    if (this._controllersClass.length > 0) {
      this._controllersClass.forEach((controller) => {
        this._logger.info(`Binding routes for controller: ${controller.name}`);
        HotSpring.bind(this._app, this._IoCContainer, controller);
      });
    } else {
      this._logger.warn('No controllers to bind to routes');
    }
    
    configureErrorHandling(this._app);
    this._logger.info('Express application configuration completed');
  }

  public async run(port: number): Promise<void> {
    if (!this._isInitialized) {
      this._logger.info('Initializing...');
      await this.initialize();
    }
    
    return new Promise<void>((resolve, reject) => {
      try {
        const server = this._app.listen(port, async() => {
           await mongoose.connect(process.env.MONGODB_URI as string, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        } as ConnectOptions );
        this._logger.info('Connected to MongoDB');
        this._logger.info(`<%app_name%> running on http://localhost:${port}`);
          resolve();
        });
        
        server.on('error', (error) => {
          this._logger.error(`Failed to start server: ${error.message}`);
          reject(error);
        });
      } catch (error: unknown) {
        this._logger.error(`Fatal error starting server: ${error}`);
        reject(new Error(`Failed to start server: ${String(error)}`));
      }
    });
  }
}
