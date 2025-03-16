import { injectable } from 'inversify';
import EmailTemplate, { type IEmailTemplate } from './models/emailTemplate.model';
import mongoose from 'mongoose';

@injectable()
export class EmailTemplateRepository {
  private readonly model = EmailTemplate;

  /**
   * Valide un ID MongoDB
   * @param id ID à valider
   * @returns true si valide, sinon lance une exception
   * @private
   */
  private validateId (id: string): boolean {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error('ID de template invalide');
    }
    return true;
  }

  /**
   * Gère les erreurs MongoDB communes
   * @param error Erreur à traiter
   * @param entityName Nom de l'entité concernée
   * @private
   */
  private handleMongoError(error: any, entityName: string = 'template'): never {
    if (error.code === 11000) {
      throw new Error(`Un ${entityName} avec ce nom existe déjà`);
    }
    throw error;
  }

  /**
   * Crée un nouveau template d'email
   * @param templateData Les données du template à créer
   * @returns Le template créé
   */
  public async create (templateData: Partial<IEmailTemplate>): Promise<IEmailTemplate> {
    try {
      const newTemplate = new this.model(templateData);
      return await newTemplate.save();
    } catch (error) {
      this.handleMongoError(error);
    }
  }

  /**
   * Récupère tous les templates d'email
   * @param options Options de filtrage
   * @returns Liste des templates
   */
  public async findAll (options: {
    isActive?: boolean;
    category?: string;
    tags?: string[];
    skip?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
  } = {}): Promise<IEmailTemplate[]> {
    const { isActive, category, tags, skip = 0, limit = 50, sort = { createdAt: -1 } } = options;

    const query: any = {};
    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }
    if (category) {
      query.category = category;
    }
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    return await this.model.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  /**
   * Récupère un template par son ID
   * @param id ID du template
   * @returns Le template trouvé ou null
   */
  public async findById (id: string): Promise<IEmailTemplate | null> {
    this.validateId(id);
    return await EmailTemplate.findById(id);
  }

  /**
   * Récupère un template par son nom
   * @param name Nom du template
   * @returns Le template trouvé ou null
   */
  public async findByName (name: string): Promise<IEmailTemplate | null> {
    return await this.model.findOne({ name });
  }

  /**
   * Met à jour un template existant
   * @param id ID du template
   * @param updateData Données à mettre à jour
   * @returns Le template mis à jour
   */
  public async update (id: string, updateData: Partial<IEmailTemplate>): Promise<IEmailTemplate | null> {
    this.validateId(id);
    try {
      const updated = await this.model.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      return updated;
    } catch (error) {
      this.handleMongoError(error);
    }
  }

  /**
   * Supprime un template
   * @param id ID du template
   * @returns true si supprimé, false sinon
   */
  public async delete (id: string): Promise<boolean> {
    this.validateId(id);

    const result = await this.model.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  /**
   * Désactive un template sans le supprimer
   * @param id ID du template
   * @returns Le template désactivé
   */
  public async deactivate (id: string): Promise<IEmailTemplate | null> {
    return await this.update(id, { isActive: false });
  }

  /**
   * Active un template
   * @param id ID du template
   * @returns Le template activé
   */
  public async activate (id: string): Promise<IEmailTemplate | null> {
    return await this.update(id, { isActive: true });
  }

  /**
   * Recherche des templates par texte
   * @param searchText Texte à rechercher
   * @param limit Nombre maximum de résultats
   * @returns Liste des templates correspondants
   */
  public async search (searchText: string, limit: number = 10): Promise<IEmailTemplate[]> {
    // Créer une expression régulière insensible à la casse
    const regex = new RegExp(searchText, 'i');

    return await this.model.find({
      $or: [
        { name: regex },
        { subject: regex },
        { description: regex },
        { tags: regex },
        { category: regex }
      ]
    }).limit(limit);
  }

  /**
   * Crée une nouvelle version d'un template existant
   * @param id ID du template source
   * @param changes Modifications pour la nouvelle version
   * @returns La nouvelle version du template
   */
  public async createNewVersion (id: string, changes: Partial<IEmailTemplate>): Promise<IEmailTemplate> {
    const template = await this.findById(id);

    if (!template) {
      throw new Error('Template source introuvable');
    }

    // Créer un objet pour la nouvelle version
    const newVersionData: Partial<IEmailTemplate> = {
      ...template.toObject(),
      ...changes,
      _id: undefined,
      version: (template.version || 0) + 1,
      createdAt: undefined,
      updatedAt: undefined
    };

    // Si le nom n'est pas modifié, ajouter un suffixe de version
    if (!changes.name) {
      newVersionData.name = `${template.name} (v${newVersionData.version})`;
    }

    return await this.create(newVersionData);
  }

  /**
   * Compte les templates selon les critères spécifiés
   * @param criteria Critères de comptage
   * @returns Nombre de templates correspondants
   */
  public async count (criteria: {
    isActive?: boolean;
    category?: string;
    tags?: string[];
  } = {}): Promise<number> {
    const { isActive, category, tags } = criteria;

    const query: any = {};
    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }
    if (category) {
      query.category = category;
    }
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    return await this.model.countDocuments(query);
  }
}
