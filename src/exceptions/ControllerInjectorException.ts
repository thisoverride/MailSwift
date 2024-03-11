export default class ControllerInjectorException extends Error {
    constructor(message: string, public status: number) {
      super(message);
    }
  }