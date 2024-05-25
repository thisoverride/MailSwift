import { HttpResponse } from "../../adapter/controller/ControllerInterface";
import ApplicationDataDto from "../../dto/ApplicationDataDto";
import ApplicationRepository from "../../repository/ApplicationRepository";
import ValidatorHelper from "../../helper/ValidatorHelper";


export default class ChannelSettingService {
  private _applicationRepository: ApplicationRepository;

  constructor(applicationRepository: ApplicationRepository){
    this._applicationRepository = applicationRepository;
  }

  public async createApplication(appPayload: any): Promise<HttpResponse> {
    try {
      const appDto = await this._validateApplicationData(appPayload)
      await this._applicationRepository.create(appDto);

      return { message: 'Application created successfully', status: 200 };
    } catch (error) {
      console.error('Error creating application:', error);
      return { message: 'Error creating application', status: 500 };
    }
  }

  private _validateSMTPFormat(smtpAddress: string): boolean {
    const smtpRegex: RegExp = /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/;
    return smtpRegex.test(smtpAddress);
}

private async _validateApplicationData(appPayload: any): Promise<ApplicationDataDto> {
  try {
      const { appName, parameters, channels } = appPayload;

      if (!appName || !parameters) {
          throw new Error('appName and parameters are required');
      }

      if (typeof appName !== 'string' || appName.trim().length < 2) {
          throw new Error('Invalid appName');
      }

      const { smtp, port, secure } = parameters;

      if (typeof smtp !== 'string' || typeof port !== 'number' || typeof secure !== 'boolean') {
          throw new Error('Invalid parameters');
      }

      if (smtp.trim().length === 0 || port < 1 || port > 65535) {
          throw new Error('Invalid SMTP or port');
      }

      if (!this._validateSMTPFormat(smtp)) {
          throw new Error('Invalid SMTP format');
      }

      const existingApp = await this._applicationRepository.findByName(appName);
      if (existingApp) {
          throw new Error('An application with the same name already exists');
      }

      const appDto = new ApplicationDataDto(appName, { smtp, port, secure });

      if (channels) {
          for (const channel of channels) {
              if (!channel.name || typeof channel.name !== 'string' || channel.name.trim() === '') {
                  throw new Error('Invalid channel name');
              }

              if (!channel.subject || typeof channel.subject !== 'string' || channel.subject.trim() === '') {
                  throw new Error('Invalid channel subject');
              }

              if (!channel.email || typeof channel.email !== 'string' || channel.email.trim() === '') {
                  throw new Error('Invalid channel email');
              }

              if (!channel.password || typeof channel.password !== 'string' || channel.password.trim() === '') {
                  throw new Error('Invalid channel password');
              }

              if (channel.parameter) {
                  if (typeof channel.parameter === 'string' && channel.parameter === '!def.parameter') {
                    delete channel.parameter
                      appDto.setChannels(channel);
                      // console.log('aamd =>',appDto)
                  } else if (typeof channel.parameter === 'object') {
                      appDto.setChannels(channel);
                  } else {
                      throw new Error('Invalid parameter');
                  }
              }
          }
      }

      return appDto;
  } catch (error) {
      console.error('Error validating application data:', error);
      throw new Error('Validation error: ' + error);
  }
}



}
