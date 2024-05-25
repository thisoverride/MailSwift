import mongoose, { Schema, Document } from 'mongoose';



interface IChannel extends Document {
  applicationId: number;
  name: string;
  subject: string;
  email: string;
  password: string;
  useDefaultParameter: boolean;
  parameter?: {
      smtp: string;
      port: number;
      secure: boolean;
  };
}

const channelSchema: Schema = new Schema({
  applicationId: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  parameter: {
      smtp: { type: String },
      port: { type: Number },
      secure: { type: Boolean }
  }
});

const ChannelModel = mongoose.model<IChannel>('Channel', channelSchema);
 
export { ChannelModel };