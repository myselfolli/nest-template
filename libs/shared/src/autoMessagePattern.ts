import { MessagePattern } from '@nestjs/microservices';

export const AutoMessagePattern = (): MethodDecorator => {
  return (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
    // Use the bse64 encoded method name as the pattern
    const pattern = Buffer.from(key.toString()).toString('base64');
    // Apply the original MessagePattern decorator
    MessagePattern(pattern)(target, key, descriptor);

    return descriptor;
  };
};
