"use strict";

const Controller = require("egg").Controller;

const defaultAvatar =
  "http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png";

class UserController extends Controller {
  // 注册接口
  async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;

    // 判断用户名或密码是否为空
    if (!username || !password) {
      ctx.body = {
        code: 500,
        msg: "用户名和密码不能为空！",
        data: null,
      };
      return;
    }

    // 获取用户信息
    const userInfo = await ctx.service.user.getUserByName(username);

    console.log("xxxxxxxxxxxxxxx");
    console.log(username);
    console.log(userInfo);

    // 判断用户名是否已经存在
    if (userInfo && userInfo.id) {
      ctx.body = {
        code: 500,
        msg: "用户名已存在，请重新输入！",
        data: null,
      };
      return;
    }

    // 将用户信息添加到数据库
    const result = await ctx.service.user.register({
      username,
      password,
      signature: "小丑竟是我自己",
      avatar: defaultAvatar,
      ctime: Date.now(),
    });

    if (result) {
      ctx.body = {
        code: 200,
        msg: "注册成功",
        data: null,
      };
    } else {
      ctx.body = {
        code: 500,
        msg: "注册失败",
        data: null,
      };
    }
  }

  // 登录接口
  async login() {
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;

    // 根据用户名查找用户
    const userInfo = await ctx.service.user.getUserByName(username);

    // 没找到，用户不存在
    if (!userInfo || !userInfo.id) {
      ctx.body = {
        code: 500,
        msg: "用户名不存在！",
        data: null,
      };
      return;
    }

    // 找到了，但密码错误
    if (userInfo && userInfo.password !== password) {
      ctx.body = {
        code: 500,
        msg: "密码错误！",
        data: null,
      };
      return;
    }

    // 生成 token 加盐
    const token = app.jwt.sign(
      {
        id: userInfo.id,
        username: userInfo.username,
        // token 有效期为 24h
        exp: Math.floor(Date.now() / 1000 + 24 * 60 * 60),
      },
      app.config.jwt.secret
    );

    ctx.body = {
      code: 200,
      msg: "登录成功",
      data: {
        token,
      },
    };
  }

  // 解析 token
  async parse() {
    const { ctx, app } = this;

    // 请求头 authorization 属性获取 token
    const token = ctx.request.header.authorization;

    // 通过 app.jwt.verify() 解析 token
    const decode = await app.jwt.verify(token, app.config.jwt.secret);

    ctx.body = {
      code: 200,
      msg: "获取成功",
      data: {
        ...decode,
      },
    };
  }

  // 获取用户信息
  async getUserInfo() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;

    // 根据 token 解析出 username
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    // 根据 username 找到用户信息
    const userInfo = await ctx.service.user.getUserByName(decode.username);

    ctx.body = {
      code: 200,
      msg: "请求成功",
      data: {
        id: userInfo.id,
        username: userInfo.username,
        signature: userInfo.signature || "",
        avatar: userInfo.avatar || defaultAvatar,
      },
    };
  }

  // 修改用户信息（个性签名）
  async editUserInfo() {
    const { ctx, app } = this;

    // 在 post 请求体中获取个性签名
    const { signature = "", avatar = "" } = ctx.request.body;

    try {
      // 解析 token，获取用户的 username
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);

      // 根据 username 找到用户信息
      const userInfo = await ctx.service.user.getUserByName(decode.username);
      // 修改用户信息
      const result = await ctx.service.user.editUserInfo({
        ...userInfo,
        avatar,
        signature,
      });

      ctx.body = {
        code: 200,
        msg: "修改成功",
        data: {
          id: userInfo.id,
          username: userInfo.username,
          signature,
          avatar,
        },
      };
    } catch (error) {
      console.log(error);
    }
  }

  async modifyPass() {
    const { ctx, app } = this;
    const { oldpass, newpass, newpass2 } = ctx.request.body;

    try {
      // 解析 token，获取用户的 username
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);

      // 根据 username 找到用户信息
      const userInfo = await ctx.service.user.getUserByName(decode.username);

      if (oldpass !== userInfo.password) {
        ctx.body = {
          code: 500,
          msg: "原密码错误",
          data: null,
        };
        return;
      }

      if (newpass !== newpass2) {
        ctx.body = {
          code: 500,
          msg: "新密码输入不一致",
          data: null,
        };
        return;
      }

      const result = await ctx.service.user.editUserInfo({
        ...userInfo,
        password: newpass,
      });

      if (result) {
        ctx.body = {
          code: 200,
          msg: "重置密码成功",
          data: null,
        };
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = UserController;
