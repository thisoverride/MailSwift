import 'reflect-metadata';
import { Application, RequestHandler } from 'express';
import { Container } from 'inversify';


interface RouteMetadata {
  method: string;
  path: string;
  handler: Function;
  middlewares: RequestHandler[];
}

export default class HotSpring {
  public static bind(app: Application, ioContainer: Container, ControllerClass: any) {
    const controllerInstance = ioContainer.get(ControllerClass);
    const routes: RouteMetadata[] = Reflect.getMetadata('routes', ControllerClass) || [];

    routes.forEach((route: RouteMetadata) => {
      const handler = route.handler.bind(controllerInstance);
      const middlewares = route.middlewares || [];
      const method = route.method as keyof Application;

      if (typeof app[method] === 'function') {
        app[method](route.path, ...middlewares, handler);
      } else {
        throw new Error(`The function ${method as string} is not a valid`);
      }
    });
  }
}
