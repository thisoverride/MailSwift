import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplication extends Document {
    name: string;
    defaultParameter: {
        smtp: string;
        port: number;
        secure: boolean;
    };
}

const applicationSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true } ,
    defaultParameter: {
        smtp: { type: String, required: true }, 
        port: { type: Number, required: true },
        secure: { type: Boolean, required: true }
    }
});


const ApplicationModel = mongoose.model<IApplication>('Application', applicationSchema);

export { ApplicationModel };
