import BaseException from '../base/BaseException';

export default class DefaultException extends BaseException {
    constructor (message: string, status: number) {
      super(message,status);
    }
  }
