import { Request, Response } from 'express';
import EmailService from '../services/EmailService';
import { inject, injectable } from 'inversify';
import { POST } from '../core/';

@injectable()
export default class EmailController {
  private readonly _emailService: EmailService;

  constructor (@inject(EmailService) emailService: EmailService) {
    this._emailService = emailService;
  }

  @POST('/sendmessage')
  public async sendEmail (request: Request, response: Response): Promise<void> {
    try {
      const { status, data } = await this._emailService.sendEmail(request.body);
      response.status(status).json(data);
    } catch (error: any) {
      console.error(error);
      response.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }
}
