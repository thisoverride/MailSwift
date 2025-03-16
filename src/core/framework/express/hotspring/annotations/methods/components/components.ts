import 'reflect-metadata';

type ClassType = 'controller' | 'service' | 'repository';

function Component(type: ClassType): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata('componentType', type, target);
  };
}

export const Controller = () => Component('controller');
export const Service = () => Component('service');
export const Repository = () => Component('repository');

// Récupérer les classes marquées comme "Service", "Controller" ou "Repository"
export function getComponentsByType(type: ClassType, modules: any[]) {
  return modules.filter(module => Reflect.getMetadata('componentType', module) === type);
}
