import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { injectable } from 'inversify';
import { type EmailMessagePayload } from '../@type/Global';
import type Mail from 'nodemailer/lib/mailer';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export default class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor () {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  private _loadTemplate (templateName: string, context: Record<string, any>): string {
    const filePath: string = path.resolve(process.cwd(), 'templates', `${templateName}.hbs`);
    const source: string = fs.readFileSync(filePath, 'utf-8');
    const template: HandlebarsTemplateDelegate = Handlebars.compile(source);
    return template(context);
  }

  public async sendEmail (options: EmailMessagePayload): Promise<any> {
    try {
      let html: string;
      let subject: string;

      // Case 1 & 3: Sending an email with a template
      const { TemplateConfiguration } = options.MessageRequest.MessageConfiguration;
      if (TemplateConfiguration) {
        const context = options.MessageRequest.MessageConfiguration.EmailMessage.Substitutions ?? {};
        html = this._loadTemplate(TemplateConfiguration.TemplateId, context);
        subject = TemplateConfiguration.SubjectOverride ?? 'Default Template Subject';

        // Case 3: Override the template content
        if (TemplateConfiguration.BodyOverride) {
          html = TemplateConfiguration.BodyOverride;
        }
      } else if (options.MessageRequest.MessageConfiguration.EmailMessage.RawEmail) {
        // Case 2: Sending an email without a template
        const rawEmail = options.MessageRequest.MessageConfiguration.EmailMessage.RawEmail;
        subject = rawEmail.Subject;
        html = rawEmail.Body;
      } else {
        throw new Error('Invalid email options: please provide either a template or raw email content.');
      }

      const trackingId: string = uuidv4();
      console.log(trackingId)
      html += `<img src="https://localhost:7500/track/open/${trackingId}" style="display:none;" alt="tracking pixel" />`;

      const mailOptions: Mail.Options = {
        from: options.MessageRequest.MessageConfiguration.EmailMessage.FromAddress,
        to: options.MessageRequest.MessageConfiguration.EmailMessage.Recipients.join(', '),
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { data: { message: `Email sent successfully: ${result.messageId}` }, status: 200 };
    } catch (error: any) {
      console.error('Error sending email:', error.message);
      return this.handleError(error);
    }
  }

  private handleError (error: any): any {
    return { data: { message: `Failed to send email: ${error.message}` }, status: 500 };
  }
}
