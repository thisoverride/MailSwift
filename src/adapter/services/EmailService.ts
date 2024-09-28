import nodemailer, { createTransport } from 'nodemailer';
import type { EmailPayload } from '../../@types/Service';
import { HttpResponse } from '../controller/interfaces/ControllerInterface';
import { injectable } from 'inversify';

interface applicationMail {
  smtpServer: string;
  port:  number;
  useSSl: boolean;
  email: string;
  password: string;
}

@injectable()
export default class EmailService {
  private transporter: nodemailer.Transporter | null = null;
      
  public async sendEmail(payload: EmailPayload): Promise<HttpResponse> {
    const { body , receiver } = payload;

    if(!body || ! receiver){
      throw new Error('error payload')
    }

    this.transporter = nodemailer.createTransport({
      host: '',
      port: 465,
      secure: true,
      auth: {
        user: '',
        pass: '',
      },
    });

    const info = await this.transporter.sendMail({
      from: '', 
      to: receiver,
      subject: payload.subject || '',
      html: body,
    });
   
    return { data: info.messageId ,status: 200 }
    
  }

}
