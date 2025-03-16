import 'reflect-metadata';
import type { RequestHandler } from 'express';

function createMethodDecorator (method: string) {
  return (path: string): MethodDecorator => {
    return (target: any, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
      const existingRoutes = Reflect.getMetadata('routes', target.constructor) || [];
      existingRoutes.push({
        method,
        path,
        handler: target[propertyKey] as RequestHandler,
        middlewares: Reflect.getMetadata('middlewares', target, propertyKey) || []
      });
      Reflect.defineMetadata('routes', existingRoutes, target.constructor);
    };
  };
}

function createListenerDecorator(event: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const wsEvents = Reflect.getMetadata('wsEvents', target.constructor) || [];
    wsEvents.push({ event, handler: target[propertyKey] });
    Reflect.defineMetadata('wsEvents', wsEvents, target.constructor);
  };
}

export const OnDisconnect = () => createListenerDecorator('disconnect');
export const OnConnect = () => createListenerDecorator('connection');
export const Channel = (event: string) => createListenerDecorator(event);
export const POST = createMethodDecorator('post');
export const GET = createMethodDecorator('get');
export const PUT = createMethodDecorator('put');
export const DELETE = createMethodDecorator('delete');
export const PATCH = createMethodDecorator('patch');
export const HEAD = createMethodDecorator('head');
export const OPTIONS = createMethodDecorator('options');
