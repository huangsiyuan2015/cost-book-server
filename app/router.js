"use strict";

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller, middleware } = app;
  const _jwt = middleware.jwtErr(app.config.jwt.secret);

  router.get("/", controller.home.index);
  router.get("/upload", controller.home.upload);

  // user
  router.post("/api/user/register", controller.user.register);
  router.post("/api/user/login", controller.user.login);
  router.get("/api/user/parse", _jwt, controller.user.parse);
  router.get("/api/user/get_userinfo", _jwt, controller.user.getUserInfo);
  router.post("/api/user/edit_userinfo", _jwt, controller.user.editUserInfo);
  router.post("/api/user/modify_pass", _jwt, controller.user.modifyPass);

  // upload
  router.post("/api/upload", controller.upload.uploadAvatar);

  // bill
  router.post("/api/bill/add", _jwt, controller.bill.add);
  router.get("/api/bill/list", _jwt, controller.bill.list);
  router.get("/api/bill/detail", _jwt, controller.bill.detail);
  router.post("/api/bill/update", _jwt, controller.bill.update);
  router.post("/api/bill/delete", _jwt, controller.bill.delete);
  router.get("/api/bill/data", _jwt, controller.bill.data);

  // type
  router.get("/api/type/list", _jwt, controller.type.list);
};
