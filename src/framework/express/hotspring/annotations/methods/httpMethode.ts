import 'reflect-metadata';
import { Request, Response, NextFunction, RequestHandler } from 'express';

function createMethodDecorator(method: string) {
  return (path: string): MethodDecorator => {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
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

export const POST = createMethodDecorator('post');
export const GET = createMethodDecorator('get');
export const PUT = createMethodDecorator('put');
export const DELETE = createMethodDecorator('delete');
export const PATCH = createMethodDecorator('patch');
export const HEAD = createMethodDecorator('head');
export const OPTIONS = createMethodDecorator('options');

