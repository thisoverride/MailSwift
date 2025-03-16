import { inject, injectable } from 'inversify';
import { EmailTemplateRepository } from '../repository/EmailTemplateRepository';
import { type IEmailTemplate } from '../repository/models/emailTemplate.model';

@injectable()
export class EmailTemplateService {
  private readonly repository: EmailTemplateRepository;

  constructor (@inject(EmailTemplateRepository) repository: EmailTemplateRepository) {
    this.repository = repository;
  }

  public async createTemplate (templateData: Partial<IEmailTemplate>): Promise<IEmailTemplate> {
    this.validateTemplateData(templateData);
    const normalizedData = this.normalizeTemplateData(templateData);
    return await this.repository.create(normalizedData);
  }

  /**
   * Récupère tous les templates avec filtrage
   * @param filter Options de filtrage
   * @returns Liste paginée de templates
   */
  public async getTemplates (filter: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    category?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
      templates: IEmailTemplate[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }> {
    const {
      page = 1,
      limit = 10,
      isActive,
      category,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filter;

    const skip = (page - 1) * limit;

    // Création du tri
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1
    };

    // Récupération des templates avec pagination
    const templates = await this.repository.findAll({
      isActive,
      category,
      tags,
      skip,
      limit,
      sort
    });

    // Comptage du total pour la pagination
    const total = await this.repository.count({
      isActive,
      category,
      tags
    });

    return {
      templates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Récupère un template par son ID
   * @param id ID du template
   * @returns Template ou null si non trouvé
   */
  public async getTemplateById(id: string): Promise<IEmailTemplate | null> {
    return this.repository.findById(id);
  }

  /**
   * Met à jour un template existant
   * @param id ID du template
   * @param updateData Données à mettre à jour
   * @returns Template mis à jour ou null
   */
  public async updateTemplate (id: string, updateData: Partial<IEmailTemplate>): Promise<IEmailTemplate | null> {
    // Vérification de l'existence du template
    const existingTemplate = await this.repository.findById(id);
    if (!existingTemplate) {
      throw new Error(`Template avec l'ID ${id} introuvable`);
    }

    // Validation et normalisation des données
    if (Object.keys(updateData).length > 0) {
      this.validateTemplateData(updateData, false);
      const normalizedData = this.normalizeTemplateData(updateData);
      return this.repository.update(id, normalizedData);
    }

    return existingTemplate;
  }

  /**
   * Supprime un template
   * @param id ID du template
   * @returns true si supprimé, false sinon
   */
  public async deleteTemplate(id: string): Promise<boolean> {
    // Vérification de l'existence du template
    const existingTemplate = await this.repository.findById(id);
    if (!existingTemplate) {
      throw new Error(`Template avec l'ID ${id} introuvable`);
    }

    return this.repository.delete(id);
  }

  /**
   * Recherche des templates par texte
   * @param query Texte à rechercher
   * @param limit Limite de résultats
   * @returns Templates correspondants
   */
  public async searchTemplates (query: string, limit: number = 10): Promise<IEmailTemplate[]> {
    if (!query || query.trim().length < 2) {
      throw new Error('Le terme de recherche doit contenir au moins 2 caractères');
    }

    return this.repository.search(query.trim(), limit);
  }

  /**
   * Compile un template avec des variables
   * @param templateId ID du template
   * @param variables Variables à injecter
   * @returns Template compilé
   */
  public async compileTemplate (templateId: string, variables: Record<string, any>): Promise<{
    subject: string;
    html: string;
    text?: string;
  }> {
    const template = await this.repository.findById(templateId);
    if (!template) {
      throw new Error(`Template avec l'ID ${templateId} introuvable`);
    }

    if (!template.isActive) {
      throw new Error('Ce template est désactivé et ne peut pas être utilisé');
    }

    // Compilation du sujet et du contenu
    const subject = this.replaceVariables(template.subject, variables);
    const html = this.replaceVariables(template.htmlContent, variables);
    const text = template.plainTextContent
      ? this.replaceVariables(template.plainTextContent, variables)
      : undefined;

    return {
      subject,
      html,
      text
    };
  }

  /**
   * Duplique un template existant
   * @param id ID du template source
   * @param overrides Modifications pour le nouveau template
   * @returns Nouveau template créé
   */
  public async duplicateTemplate (id: string, overrides: Partial<IEmailTemplate> = {}): Promise<IEmailTemplate> {
    // Récupération du template source
    const sourceTemplate = await this.repository.findById(id);
    if (!sourceTemplate) {
      throw new Error(`Template source avec l'ID ${id} introuvable`);
    }

    // Création du nom par défaut pour la copie si non spécifié
    if (!overrides.name) {
      overrides.name = `${sourceTemplate.name} (copie)`;
    }

    return this.repository.createNewVersion(id, overrides);
  }

  /**
   * Récupère les statistiques des templates
   * @returns Statistiques des templates
   */
  public async getTemplateStats (): Promise<{
    total: number;
    active: number;
    inactive: number;
    byCategory: Record<string, number>;
  }> {
    const total = await this.repository.count();
    const active = await this.repository.count({ isActive: true });
    const inactive = await this.repository.count({ isActive: false });

    // Pour les catégories, on devrait faire une agrégation MongoDB,
    // mais ici on va simuler pour simplicité
    const allTemplates = await this.repository.findAll({ limit: 1000 });
    const categoryMap: Record<string, number> = {};

    allTemplates.forEach(template => {
      const category = template.category || 'Non catégorisé';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    return {
      total,
      active,
      inactive,
      byCategory: categoryMap
    };
  }

  /**
   * Extrait les variables d'un template
   * @param content Contenu du template
   * @returns Liste des variables trouvées
   */
  public extractTemplateVariables(content: string): string[] {
    // Recherche des motifs {{variable}} dans le contenu
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = content.match(variableRegex) || [];

    // Extraction et nettoyage des noms de variables
    return [...new Set(
      matches.map(match => match.replace(/\{\{|\}\}/g, '').trim())
    )].filter(Boolean);
  }

  // Méthodes privées

  /**
   * Valide les données du template
   * @param data Données à valider
   * @param isCreation Si c'est une création (plus stricte)
   * @private
   */
  private validateTemplateData (data: Partial<IEmailTemplate>, isCreation: boolean = true): void {
    // Validation des champs obligatoires pour la création
    if (isCreation) {
      if (!data.name || data.name.trim().length < 3) {
        throw new Error('Le nom du template doit contenir au moins 3 caractères');
      }

      if (!data.subject) {
        throw new Error('Le sujet du template est obligatoire');
      }

      if (!data.htmlContent) {
        throw new Error('Le contenu HTML du template est obligatoire');
      }
    } else {
      // Validation des champs optionnels pour la mise à jour
      if (data.name !== undefined && data.name.trim().length < 3) {
        throw new Error('Le nom du template doit contenir au moins 3 caractères');
      }
    }

    // Validation des tags (si présents)
    if (data.tags && !Array.isArray(data.tags)) {
      throw new Error('Les tags doivent être un tableau');
    }
  }

  /**
   * Normalise les données du template
   * @param data Données à normaliser
   * @private
   */
  private normalizeTemplateData(data: Partial<IEmailTemplate>): Partial<IEmailTemplate> {
    const normalized = { ...data };

    // Normalisation du nom
    if (normalized.name) {
      normalized.name = normalized.name.trim();
    }

    // Normalisation de la catégorie
    if (normalized.category) {
      normalized.category = normalized.category.trim();
    }

    // Normalisation des tags
    if (normalized.tags) {
      normalized.tags = normalized.tags
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }

    // Extraction des variables du contenu HTML
    if (normalized.htmlContent) {
      normalized.variables = this.extractTemplateVariables(normalized.htmlContent);

      // Si le sujet contient aussi des variables, les ajouter
      if (normalized.subject) {
        const subjectVars = this.extractTemplateVariables(normalized.subject);
        normalized.variables = [...new Set([...normalized.variables, ...subjectVars])];
      }
    }

    return normalized;
  }

  /**
   * Remplace les variables dans un texte
   * @param text Texte avec variables {{variable}}
   * @param variables Dictionnaire de variables
   * @private
   */
  private replaceVariables(text: string, variables: Record<string, any>): string {
    let result = text;

    // Remplacer chaque variable {{variable}} par sa valeur
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(regex, String(value));
    });

    return result;
  }
}
