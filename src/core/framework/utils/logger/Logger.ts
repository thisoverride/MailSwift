import { injectable } from 'inversify';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import path from 'path';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Couleurs personnalisées style Spring Boot
const colors = {
  info: '\x1b[32m', // vert
  warn: '\x1b[33m', // jaune
  error: '\x1b[31m', // rouge
  debug: '\x1b[36m', // cyan
  reset: '\x1b[0m', // reset
  dim: '\x1b[2m',   // gris
  white: '\x1b[37m' // blanc
};

@injectable()
export class Logger {
  private logger: WinstonLogger;
  private appName: string = 'MyApp'; // Vous pouvez personnaliser le nom de l'application

  constructor() {
    this.logger = this.configureLogger('development');
  }

  private configureLogger(environment: string): WinstonLogger {
    // Format personnalisé style Spring Boot
    const springBootFormat = format.printf(({ timestamp, level, message, ...meta }) => {
      const upperLevel = level.toUpperCase().padEnd(5);
      const date = new Date(timestamp as any).toISOString();
      
      // Format: 2024-01-22 10:15:32.123  INFO 12345 --- [main] com.example.MyApp : Message
      let logMessage = `${colors.dim}${date}${colors.reset}  `;
      
      // Couleur selon le niveau
      const levelColor = colors[level as LogLevel] || colors.white;
      logMessage += `${levelColor}${upperLevel}${colors.reset} `;
      
      logMessage += `${colors.dim}${colors.reset} ${colors.dim}---${colors.reset} `;
      
      // Thread et nom de l'application
      // logMessage += `${colors.dim}[${colors.reset}${colors.white}main${colors.reset}${colors.dim}]${colors.reset} `;
      // logMessage += `${colors.white}${this.appName}${colors.reset}${colors.dim}:${colors.reset} `;
      
      // Message
      logMessage += `${message}`;

      // Métadonnées si présentes
      if (Object.keys(meta).length) {
        logMessage += ` ${colors.dim}${JSON.stringify(meta)}${colors.reset}`;
      }

      return logMessage;
    });

    const loggerTransports = [
      new transports.Console({
        level: environment === 'development' ? 'debug' : 'info',
        format: format.combine(
          format.timestamp(),
          springBootFormat
        )
      }),
      new transports.File({
        filename: path.join(__dirname, 'logs', 'application.log'),
        level: 'info',
        format: format.combine(
          format.timestamp(),
          format.json()
        )
      })
    ];

    return createLogger({
      level: environment === 'production' ? 'info' : 'debug',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true })
      ),
      transports: loggerTransports
    });
  }

  public setEnvironment(environment: string): void {
    this.logger = this.configureLogger(environment);
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    this.logger.log(level, message, meta || {});
  }

  public info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  public error(message: string, meta?: any): void {
    this.log('error', message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }
}