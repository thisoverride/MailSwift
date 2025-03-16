import { promises as fs } from 'fs';

export default class DirManager {
  public static async folderExists(folderPath: string): Promise<boolean> {
    try {
      await fs.access(folderPath);
      return true;
    } catch {
      return false;
    }
  }

  public static async readfile(templatePath: string): Promise<string | null> {
    try {
      const data = await fs.readFile(templatePath, 'utf8');
      return data;
    } catch (error) {
      return null;
    }
  }

  public static replaceTemplateFlags(template: string, replacements: { [key: string]: string }): string {
    return template.replace(/%\{([^}]+)\}/g, (match, p1) => {
      return replacements.hasOwnProperty(match) ? replacements[match] : match;
    });
  }

 

  public static async writeFile(filePath: string, data: string): Promise<boolean> {
    try {
      await fs.writeFile(filePath, data, 'utf8');
      return true;
    } catch {
      return false;
    }
  }

  public static async createDir(folderPath: string): Promise<boolean> {
    try {
      await fs.mkdir(folderPath, { recursive: true });
      return true;
    } catch {
      return false;
    }
  }

  public static async deleteDir(folderPath: string): Promise<boolean> {
    try {
      await fs.rm(folderPath, { recursive: true, force: true });
      return true;
    } catch {
      return false;
    }
  }

  public static async verifyFilePermission(filePath: string, permission: number): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath); // Récupère les informations du fichier
      const filePermission = stats.mode & 0o777; // Extrait les permissions du fichier
      return filePermission === permission; // Vérifie si les permissions correspondent
    } catch {
      return false;
    }
  }

  public static async changeFilePermission(filePath: string, permission: number): Promise<boolean> {
    try {
      await fs.chmod(filePath, permission);
      return true;
    } catch {
      return false;
    }
  }

  public static async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error: any) {
      return false;
    }
  }

  public static async copyFile(source: string, destination: string): Promise<boolean> {
    try {
      await fs.copyFile(source, destination);
      return true;
    } catch {
      return false;
    }
  }

  public static async createFile(file: string, data: string): Promise<boolean> {
    try {
      await fs.writeFile(file, data, 'utf8');
      return true;
    } catch {
      return false;
    }
  }
}