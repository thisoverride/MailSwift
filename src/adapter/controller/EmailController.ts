import { Request, Response } from 'express';
import EmailService from '../services/EmailService';
import { POST } from '../../framework/express/hotspring/hotSpring';
import { inject, injectable } from 'inversify';

@injectable()
export default class EmailController {
  private emailService: EmailService;

  constructor(@inject(EmailService) emailService: EmailService) {
    this.emailService = emailService;
  }

  @POST('/sendmessage')
  public async sendEmail(request: Request, response: Response): Promise<void> {
    try {
      const { status, data } = await this.emailService.sendEmail(request.body);
      response.status(status).json(data);
    } catch (error: any) {
      console.error(error);
      response.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }
}
