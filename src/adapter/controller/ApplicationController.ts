import { Request, Response } from 'express';
import { ControllerImpl, HttpResponse } from './ControllerInterface';
import ChannelSettingService from '../../usecases/services/ChannelSettingService';

/**
 * Controller for handling email sending operations.
 * @class
 */
export default class ApplicationController implements ControllerImpl {
  public readonly ROUTE: Array<string>;
  public readonly BASE: string = '/api/v1';
  private channelSettingService: ChannelSettingService;

  public constructor(channelSettingService: ChannelSettingService) {
    this.ROUTE = [`@POST(${this.BASE}/addchanel,addingChannel)`];
    this.channelSettingService = channelSettingService;
  }

  /**
   * Handles the sendNotification route.
   * @async
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @returns {Promise<void>} - A Promise resolving to void.
   */
  public async addingChannel(request: Request, response: Response): Promise<void> {
    try {
      const serviceResponse: HttpResponse = await this.channelSettingService.createApplication(request.body);
      response.status(serviceResponse.status).json({ message: serviceResponse.message });

    } catch (error: any) {
      console.error(error);
      response.status(error.status || 500).json({ message: error.message });
    }
  }
}
