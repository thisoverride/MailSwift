export default class ApplicationDataDto {
  private _applicationName: string;
  private _defaultParameter: any
  private _channels?: any[] | null;

  constructor(applicationName: string, defaultParameter: { smtp: string; port: number; secure: boolean }, channels?: any[]) {
    this._applicationName = applicationName;
    this._defaultParameter = defaultParameter;
    this._channels = channels ?? [];
  }

  public getApplicationName(): string {
    return this._applicationName;
  }

  public getDefaultParameter(): { smtp: string; port: number; secure: boolean } {
    return this._defaultParameter;
  }

  public getChannels(): any[] | null {
    return this._channels ?? null;
  }

  public setApplicationName(name: string): void {
    this._applicationName = name;
  }

  public setDefaultParameter(parameter: { smtp: string; port: number; secure: boolean }): void {
    this._defaultParameter = parameter;
  }

  public setChannels(channels: any): void {
    this._channels?.push(channels)
  }
}