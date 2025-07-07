const express = require("express");
const {
  CreateUserController,
  GetUserByAuth0IdController, 
  DeleteUserByAuth0IdController, 
  PatchUserByAuth0IdController,
  SetAdminController,
  GetAllUsersController,
} = require("../controllers/UserController.js");

const UserRouter = express.Router();

UserRouter.get("/:auth0_id", GetUserByAuth0IdController);
UserRouter.delete("/:auth0_id", DeleteUserByAuth0IdController);
UserRouter.patch("/:auth0_id", PatchUserByAuth0IdController);
UserRouter.post("/create", CreateUserController);

//nueva ruta
UserRouter.post("/set/admin", SetAdminController);
//nueva ruta
UserRouter.get("/all/:auth0_id", GetAllUsersController);

module.exports=UserRouter;