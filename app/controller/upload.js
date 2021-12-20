"use strict";

const fs = require("fs");
const moment = require("moment");
const mkdirp = require("mkdirp");
const path = require("path");

const Controller = require("egg").Controller;

class UploadController extends Controller {
  async uploadAvatar() {
    const { ctx } = this;

    // ctx.request.files[0] 表示获取第一个文件，若前端上传多个文件就遍历这个数组对象
    let file = ctx.request.files[0];

    let uploadDir = "";

    try {
      let f = fs.readFileSync(file.filepath);
      // 获取当前日期
      let day = moment(new Date()).format("YYYYMMDD");
      // 创建图片保存的路径
      let dir = path.join(this.config.uploadDir, day);

      // 不存在就创建目录
      await mkdirp(dir);
      // 返回图片保存的路径
      uploadDir = path.join(dir, Date.now() + path.extname(file.filename));

      // 写入文件夹
      fs.writeFileSync(uploadDir, f);
    } catch (error) {
    } finally {
      // 清除临时文件
      ctx.cleanupRequestFiles();
    }

    ctx.body = {
      code: 200,
      msg: "上传成功",
      data: uploadDir.replace(/app/g, ""),
    };
  }
}

module.exports = UploadController;
