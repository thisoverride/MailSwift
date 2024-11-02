// EmailMessagePayload.ts

/**
 * Main payload interface for sending an email.
 */
export interface EmailMessagePayload {
  /** Unique identifier of the application */
  ApplicationId: string;
  
  /** Message request containing message configuration */
  MessageRequest: MessageRequest;
  
  /** List of email recipients */
  // Recipients: string[];
}

/**
 * Interface for the message request, including configuration details.
 */
export interface MessageRequest {
  /** Full message configuration, including email and optional template settings */
  MessageConfiguration: MessageConfiguration;
}

/**
 * Configuration for the email message, including template configuration if a template is used.
 */
export interface MessageConfiguration {
  /** Email details like sender, recipients, and optional raw content */
  EmailMessage: EmailMessageConfig;
  
  /** Optional template configuration, allowing subject and body overrides */
  TemplateConfiguration?: TemplateConfiguration;
}

/**
 * Configuration for the email details, specifying sender, recipients, dynamic substitutions,
 * and optional raw email content when no template is used.
 */
export interface EmailMessageConfig {
  /** Sender's email address */
  FromAddress: string;
  
  /** List of recipient email addresses */
  Recipients: string[];
  
  /** Key-value pairs for dynamic substitutions in the email content */
  Substitutions?: Record<string, string>;
  
  /** Raw email content to be used when no template is applied */
  RawEmail?: RawEmailContent;
}

/**
 * Content for a raw email (without a template), including subject and body.
 */
export interface RawEmailContent {
  /** Subject line of the email */
  Subject: string;
  
  /** Body content of the email */
  Body: string;
}

/**
 * Configuration for using an email template, with optional overrides for subject and body.
 */
export interface TemplateConfiguration {
  /** Identifier for the template to be used */
  TemplateId: string;
  
  /** Optional override for the subject line of the template */
  SubjectOverride?: string;
  
  /** Optional override for the body content of the template */
  BodyOverride?: string;
}
