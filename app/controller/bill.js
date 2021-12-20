"use strict";

const moment = require("moment");

const Controller = require("egg").Controller;

class BillController extends Controller {
  // 添加账单项
  async add() {
    const { ctx, app } = this;

    const {
      amount,
      type_id,
      type_name,
      date,
      pay_type,
      remark = "",
    } = ctx.request.body;

    if (!amount || !type_id || !type_name || !date || !pay_type) {
      ctx.body = {
        code: 400,
        msg: "账单参数错误",
        data: null,
      };
    }

    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      let user_id = decode.id;

      const result = await ctx.service.bill.add({
        amount,
        type_id,
        type_name,
        date,
        pay_type,
        remark,
        user_id,
      });

      ctx.body = {
        code: 200,
        msg: "添加账单成功",
        data: null,
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: "添加账单失败",
        data: null,
      };
    }
  }

  // 获取账单列表
  async list() {
    const { ctx, app } = this;

    // 获取 日期 date，分页数据，类型 type_id
    const { date, page = 1, page_size = 5, type_id = "all" } = ctx.query;

    try {
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      let user_id = decode.id;

      // 获取当前用户的账单列表
      const list = await ctx.service.bill.list(user_id);
      // 过滤出月份和类型所对应的账单列表
      const _list = list.filter((item) => {
        if (type_id != "all") {
          return (
            moment(Number(item.date)).format("YYYY-MM") == date &&
            type_id == item.type_id
          );
        }
        return moment(Number(item.date)).format("YYYY-MM") == date;
      });

      // 格式化数据
      let listMap = _list
        .reduce((cur, item) => {
          // 格式化账单项的时间
          const date = moment(Number(item.date)).format("YYYY-MM-DD");

          // 在累加数组中寻找当前日期的账单项
          const index = cur.findIndex((item) => item.date === date);

          // 找到了就放进去
          if (cur && cur.length && index > -1) {
            cur[index].bills.push(item);
          }

          // 没找到就新建一项
          if (cur && cur.length && index === -1) {
            cur.push({ date, bills: [item] });
          }

          // 空数组的话则默认添加第一个账单项
          if (!cur.length) {
            cur.push({ date, bills: [item] });
          }

          return cur;
        }, [])
        .sort((a, b) => moment(b.date) - moment(a.date)); // 时间越近，越排最上

      // 分页处理，listMap 为格式化后的全部数据，还未分页
      const filterListMap = listMap.slice(
        (page - 1) * page_size,
        page * page_size
      );

      // 计算当月总收入和支出
      // 首先获取当月所有账单列表
      let __list = list.filter(
        (item) => moment(Number(item.date)).format("YYYY-MM") === date
      );

      // 累加计算总支出
      let totalExpense = __list.reduce((cur, item) => {
        if (item.pay_type == 1) {
          cur += Number(item.amount);
          return cur;
        }
        return cur;
      }, 0);

      // 累加计算总收入
      let totalIncome = __list.reduce((cur, item) => {
        if (item.pay_type == 2) {
          cur += Number(item.amount);
          return cur;
        }
        return cur;
      }, 0);

      // 返回数据
      ctx.body = {
        code: 200,
        msg: "获取账单列表成功",
        data: {
          totalExpense, // 当月总支出
          totalIncome, // 当月总收入
          totalPage: Math.ceil(listMap.length / page_size), // 总分页
          list: filterListMap || [], // 格式化后，并且经过分页处理的账单列表
        },
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: "获取账单列表失败",
        data: null,
      };
    }
  }

  // 获取账单详情
  async detail() {
    const { ctx, app } = this;

    // 获取账单 id
    const { id = "" } = ctx.request.query;

    // 获取用户 id
    const token = ctx.request.header.authorization;
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    if (!decode) return;
    let user_id = decode.id;

    // 账单 id 为空返回错误信息
    if (!id) {
      ctx.body = {
        code: 500,
        msg: "账单 id 不能为空",
        data: null,
      };
      return;
    }

    try {
      // 从数据库获取账单详情
      const detail = await ctx.service.bill.detail(id, user_id);
      ctx.body = {
        code: 200,
        msg: "获取账单详情成功",
        data: detail,
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: "获取账单详情失败",
        data: null,
      };
    }
  }

  // 修改账单信息
  async update() {
    const { ctx, app } = this;

    // 获取账单的相关参数，这里的 id 是账单 id
    const {
      id,
      amount,
      type_id,
      type_name,
      date,
      pay_type,
      remark = "",
    } = ctx.request.body;

    if (!amount || !type_id || !type_name || !date || !pay_type) {
      ctx.body = {
        code: 500,
        msg: "账单相关参数不能为空",
        data: null,
      };
      return;
    }

    try {
      // 获取用户 id
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      let user_id = decode.id;

      // 根据用户 id 和账单 id 修改账单信息
      const bill_info = {
        id,
        amount,
        type_id,
        type_name,
        date,
        pay_type,
        remark,
        user_id,
      };
      const result = await ctx.service.bill.update(bill_info);

      ctx.body = {
        code: 200,
        msg: "账单信息修改成功",
        data: bill_info,
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: "账单信息修改失败",
        data: null,
      };
    }
  }

  // 删除账单项
  async delete() {
    const { ctx, app } = this;
    const { id } = ctx.request.body;

    if (!id) {
      ctx.body = {
        code: 400,
        msg: "账单 id 不能为空",
        data: null,
      };
      return;
    }

    try {
      // 获取用户 id
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      let user_id = decode.id;

      const result = await ctx.service.bill.delete(id, user_id);
      ctx.body = {
        code: 200,
        msg: "删除账单成功",
        data: null,
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: "删除账单失败",
        data: null,
      };
    }
  }

  // 获取账单表的相关数据
  async data() {
    const { ctx, app } = this;
    const { date = "" } = ctx.query;

    try {
      // 获取用户 id
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      let user_id = decode.id;

      // 获取账单列表中的账单数据
      const result = await ctx.service.bill.list(user_id);
      // 根据时间参数，筛选出当月所有的账单数据
      const start = moment(date).startOf("month").unix() * 1000; // 选择月份，月初时间
      const end = moment(date).endOf("month").unix() * 1000; // 选择月份，月末时间

      // data 是当月所有的账单项
      const _data = result.filter(
        (item) => Number(item.date) > start && Number(item.date) < end
      );

      // 计算总支出
      const total_expense = _data.reduce((pre, cur) => {
        if (cur.pay_type === 1) {
          pre += Number(cur.amount);
        }
        return pre;
      }, 0);

      // 计算总收入
      const total_income = _data.reduce((pre, cur) => {
        if (cur.pay_type === 2) {
          pre += Number(cur.amount);
        }
        return pre;
      }, 0);

      // 计算收支结构
      const total_data = _data
        .reduce((arr, cur) => {
          const index = arr.findIndex((item) => item.type_id === cur.type_id);

          if (index === -1) {
            arr.push({
              type_id: cur.type_id,
              type_name: cur.type_name,
              pay_type: cur.pay_type,
              number: Number(cur.amount),
            });
          }

          if (index > -1) {
            arr[index].number += Number(cur.amount);
          }

          return arr;
        }, [])
        .map((item) => {
          item.number = Number(Number(item.number).toFixed(2));
          return item;
        });

      ctx.body = {
        code: 200,
        msg: "获取账单表数据成功",
        data: {
          total_expense: Number(total_expense).toFixed(2),
          total_income: Number(total_income).toFixed(2),
          total_data: total_data || [],
        },
      };
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = BillController;
