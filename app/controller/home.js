"use strict";

const Controller = require("egg").Controller;

class HomeController extends Controller {
  // async index() {
  //   const { ctx } = this;
  //   const { id } = ctx.query; // 查询字符串
  //   // ctx.body = "hi, egg";
  //   ctx.body = id;
  // }

  async index() {
    const { ctx } = this;
    // ctx.render 默认会去 view 文件夹下寻找 index.html
    await ctx.render("index.html", {
      title: "hello egg.js", // 将 title 注入 index.html
    });
  }

  async upload() {
    const { ctx } = this;
    await ctx.render("upload.html");
  }

  // async user() {
  //   const { ctx } = this;
  //   const { id } = ctx.params; // 动态路由参数
  //   ctx.body = id;
  // }

  // 查
  async user() {
    const { ctx } = this;
    const result = await ctx.service.home.user();
    ctx.body = result;
  }

  async add() {
    const { ctx } = this;
    const { title } = ctx.request.body; // post 请求体
    ctx.body = { title };
  }

  // 增
  async addUser() {
    const { ctx } = this;
    const { name } = ctx.request.body;

    try {
      const result = await ctx.service.home.addUser(name);
      ctx.body = {
        code: 200,
        msg: "insert successfully",
        data: null,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: "insert failed",
        data: null,
      };
    }
  }

  // 改
  async editUser() {
    const { ctx } = this;
    const { id, name } = ctx.request.body;

    try {
      const result = await ctx.service.home.editUser(id, name);
      ctx.body = {
        code: 200,
        msg: "update successfully",
        data: null,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: "update failed",
        data: null,
      };
    }
  }

  // 删
  async deleteUser() {
    const { ctx } = this;
    const { id } = ctx.request.body;

    try {
      const result = await ctx.service.home.deleteUser(id);
      ctx.body = {
        code: 200,
        msg: "delete successfully",
        data: null,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: "delete failed",
        data: null,
      };
    }
  }
}

module.exports = HomeController;
