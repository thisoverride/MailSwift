import Main from '../core/Main';

export const start =  (arg?: string) => {
  console.log(`Démarrage avec argument: ${arg || 'aucun'}`);
   Main.start(arg ?? '');
};

if (require.main === module) {
  start(process.argv[2]); 
}