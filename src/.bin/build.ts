import fs from 'fs';
import path from 'path';


const filePath = path.resolve(process.cwd(), 'src', 'Main.ts');

async function readFileAsync() {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    console.log('Contenu du fichier (méthode async/await):');
    console.log(data);
  } catch (err) {
    console.error('Erreur lors de la lecture du fichier:', err);
  }
}

readFileAsync();