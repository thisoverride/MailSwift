import { Request, Response } from 'express';
import { injectable } from 'inversify';
import { GET } from '../core/';

@injectable()
export default class TrackingController {
  @GET('/track/open/:trackingId')
  public async trackEmailOpen (req: Request, res: Response): Promise<void> {
    const trackingId = req.params.trackingId;
    const userIp = req.ip; // todo gettings ip
    const timestamp = new Date();

    console.log(`Email opened with tracking ID: ${trackingId}, User IP: ${userIp}, Timestamp: ${timestamp}`);

    res.sendStatus(204);
  }
}
