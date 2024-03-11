import express, { Request, Response } from 'express';
import { ControllerImpl, HttpResponse } from './ControllerInterface';
import type EmailSenderService from '../../usecases/services/EmailSenderService';

/**
 * Controller for handling email sending operations.
 * @class
 */
export default class EmailSenderController implements ControllerImpl {
  public readonly ROUTE: Array<string>;
  public readonly BASE: string = '/api/v1';
  private emailSenderService: EmailSenderService;

  /**
   * Creates an instance of EmailSenderController.
   * @param {EmailSenderService} emailSenderService - An instance of EmailSenderService.
   * @constructor
   */
  public constructor(emailSenderService: EmailSenderService) {
    this.ROUTE = [`@POST(${this.BASE}/sendemail,sendNotification)`];
    this.emailSenderService = emailSenderService;
  }

  /**
   * Handles the sendNotification route.
   * @async
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @returns {Promise<void>} - A Promise resolving to void.
   */
  public async sendNotification(request: Request, response: Response): Promise<void> {
    try {
      const serviceResponse: HttpResponse = await this.emailSenderService.pushEmail(request.body);
      response.status(serviceResponse.status).json({ message: serviceResponse.message });

    } catch (error: any) {
      console.error(error);
      response.status(error.status || 500).json({ message: error.message });
    }
  }
}
