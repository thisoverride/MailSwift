export interface EmailPayload {
  subject?: string;
  body: string;
  receiver: string[];
  receiverCc?: string[]
}