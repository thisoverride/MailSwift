import { Request, Response } from 'express';
import EmailService from '../services/EmailService';
import { POST } from '../../framework/express/hotspring/hotSpring'; 
import { inject, injectable } from 'inversify';

@injectable()
export default class EmailController {
  private emailService: EmailService;

  constructor(@inject(EmailService) emailService : EmailService) {
    this.emailService = new EmailService();
  }

  @POST('/send')
  public async sendEmail(request: Request, response: Response): Promise<void> {
    try {
      const serviceResponse = await this.emailService.sendEmail(request.body);
      response.status(serviceResponse.status).json({ message: serviceResponse.data });
    } catch (error: any) {
      console.error(error);
      response.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }
}
