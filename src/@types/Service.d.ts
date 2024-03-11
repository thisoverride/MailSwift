export interface EmailPayload {
  appId: string;
  subject?: string;
  channel: string;
  message: string;
  receiver: string[];
  receiverCc?: string[]
}