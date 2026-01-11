
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    // Narrow the request type so `user` can be optional and use optional chaining
    const request = ctx.switchToHttp().getRequest<{ user?: Record<string, any> }>();

    if (data) {
      return request.user?.[data];
    }

    return request.user;
  },
);
