import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Interface pour les documents EmailTemplate
export interface IEmailTemplate extends Document {
  name: string;
  subject: string;
  htmlContent: string;
  plainTextContent?: string;
  category?: string;
  tags?: string[];
  createdBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  variables?: string[];
  description?: string;
  previewText?: string;
  version?: number;
}

// Schéma pour les templates d'email
const emailTemplateSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  plainTextContent: {
    type: String
  },
  category: {
    type: String,
    trim: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  variables: [{
    type: String,
    trim: true
  }],
  description: {
    type: String
  },
  previewText: {
    type: String
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  versionKey: false
});

// Ajout d'index pour améliorer les performances de recherche
emailTemplateSchema.index({ name: 1 });
emailTemplateSchema.index({ category: 1, isActive: 1 });
emailTemplateSchema.index({ tags: 1 });

// Méthode pour trouver les templates actifs
emailTemplateSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Création et export du modèle
const EmailTemplate: Model<IEmailTemplate> = mongoose.model<IEmailTemplate>('EmailTemplate', emailTemplateSchema);

export default EmailTemplate;
