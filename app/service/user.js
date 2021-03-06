"use strict";

const Service = require("egg").Service;

class UserService extends Service {
  // 通过用户名获取用户信息
  async getUserByName(username) {
    const { app } = this;

    try {
      const result = await app.mysql.get("user", { username });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 添加注册用户
  async register(userInfo) {
    const { app } = this;

    try {
      const result = await app.mysql.insert("user", userInfo);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 修改用户信息
  async editUserInfo(userInfo) {
    const { ctx, app } = this;

    try {
      const result = await app.mysql.update("user", userInfo, {
        id: userInfo.id,
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = UserService;
