import 'reflect-metadata';
import type { Application, RequestHandler } from 'express';
import type { Container } from 'inversify';

interface RouteMetadata {
  method: string;
  path: string;
  handler: Function;
  middlewares: RequestHandler[];
}

interface WsEventMetadata {
  event: string;
  handler: Function;
}

export default class HotSpring {
  public static bind (app: Application, ioContainer: Container, ControllerClass: any, io?: any): void {
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

    if (io) {
      const wsEvents: WsEventMetadata[] = Reflect.getMetadata('wsEvents', ControllerClass) || [];
      io.on('connection', (socket: any) => {
        wsEvents.forEach((event: WsEventMetadata) => {
          const handler = event.handler.bind(controllerInstance);
          if (event.event === 'connection') {
            handler(socket);
          } else {
            socket.on(event.event, (data: any) => handler(socket, data));
          }
        });
      });
    }
  }
}
