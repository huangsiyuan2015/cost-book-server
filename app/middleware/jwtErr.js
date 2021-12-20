"use strict";

module.exports = (secret) => {
  return async function jwtErr(ctx, next) {
    // 获取 token
    const token = ctx.request.header.authorization;

    let decode;

    console.log('token xxxxxxxxxxxxxxxxxxxxx')

    if (token !== null && token) {
      try {
        decode = ctx.app.jwt.verify(token, secret);
        await next();
      } catch (error) {
        console.log(error);
        ctx.status = 200;
        ctx.body = {
          code: 401,
          msg: "token 已过期，请重新登录",
        };
        return;
      }
    } else {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        msg: "token 不存在",
      };
      return;
    }
  };
};
