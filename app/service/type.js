"use strict";

const Service = require("egg").Service;

class TypeService extends Service {
  // 获取所有的类型标签
  async list(user_id) {
    const { ctx, app } = this;
    const QUERY_STR = "id, name, type";
    let sql = `select ${QUERY_STR} from type where user_id=${0} UNION select ${QUERY_STR} from type where user_id=${user_id}`;

    try {
      const result = await app.mysql.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = TypeService;
