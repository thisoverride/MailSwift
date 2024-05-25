interface ApplicationParameter {
  smtp: string;
  port: number;
  secure: boolean;
}

export default class ValidatorHelper {
  public static validateSMTPParameters(parameters: ApplicationParameter): void {
      const { smtp, port, secure } = parameters;

      if (!smtp || typeof smtp !== 'string' || smtp.trim() === '') {
          throw new Error('Invalid SMTP');
      }

      if (!port || typeof port !== 'number' || port < 1 || port > 65535) {
          throw new Error('Invalid port');
      }

      if (secure === undefined || typeof secure !== 'boolean') {
          throw new Error('Invalid secure parameter');
      }
  }
}
