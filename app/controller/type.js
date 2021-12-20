"use strict";

const Controller = require("egg").Controller;

class TypeController extends Controller {
  async list() {
    const { ctx, app } = this;

    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      let user_id = decode.id;

      const list = await ctx.service.type.list(user_id);

      console.log(list);
      ctx.body = {
        code: 200,
        msg: "获取标签列表成功",
        data: { list },
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: "获取标签列表失败",
        data: null,
      };
    }
  }
}

module.exports = TypeController;
