import { HttpResponse } from "../../adapter/controller/ControllerInterface";
import nodemailer, { createTransport } from 'nodemailer';
import type { EmailPayload } from '../../@types/Service';
import fs from 'fs';

export default class EmailSenderService {
  private transporter: nodemailer.Transporter | null = null;
      
  public async pushEmail(payload: EmailPayload): Promise<HttpResponse> {
    const { appId, channel, message , receiver } = payload;

    if(!appId || !channel || !message || ! receiver){
      throw new Error('error payload')
    }

    const app = this.findApplication(appId)

    const channelProperties = app.channels[channel];
    if(channelProperties.parameter === '!def.parameter') {
      channelProperties.parameter = app.parameter;
    }

    this.transporter = nodemailer.createTransport({
      host: channelProperties.parameter.smtp,
      port: channelProperties.parameter.port,
      secure: channelProperties.parameter.secure,
      auth: {
        user: channelProperties.email,
        pass: channelProperties.password,
      },
    });

    const info = await this.transporter.sendMail({
      from: channelProperties.email, 
      to: receiver,
      subject: channelProperties.subject,
      html: message,
    });
   
    return { message: info.messageId ,status: 200 }
    
  }
  private findApplication(appName: string) {
    const rawData: string = fs.readFileSync('template.json', 'utf8');
    const jsonData = JSON.parse(rawData);

    if (!jsonData || !jsonData.applications) {
      throw new Error("Invalid JSON data or missing 'applications' key.");
    }

    const applications = jsonData.applications;

    for (const application of applications) {
      if (application.name === appName) {
        return application;
      }
    }

    throw new Error(`Application with name '${appName}' not found.`);
  }
}
