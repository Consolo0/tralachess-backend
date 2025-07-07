const {DataTypes, literal, Op, or} = require("sequelize");
const sequelize = require("../../db/index.js");

const User = sequelize.define("User", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  auth0_id:{
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
  username: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  description: {
    defaultValue: "Si pienso, juego mal",
    type: DataTypes.STRING,
  },
  wins: {
    defaultValue: 0,
    type: DataTypes.INTEGER,
  },
  draws: {
    defaultValue: 0,
    type: DataTypes.INTEGER,
  },
  loss: {
    defaultValue: 0,
    type: DataTypes.INTEGER,
  },
  profileImage: {
    type: DataTypes.BLOB("long"),
    allowNull: true,
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: literal("CURRENT_TIMESTAMP"),
  },
});

const CreateUser = async (auth0_id, username, description, profileImage) => {

  const user = await User.create({
    auth0_id,
    username,
    description,     // opcional
    profileImage,    // opcional
    // wins, draws, loss, createdAt y updatedAt se autocompletan
  });

  return user;
};

const GetUserByAuth0Id = async (auth0_id) => {
  const user = await User.findOne({
    where: {
      auth0_id: auth0_id,
    }
  });

  return user;
};

const DeleteUserByAuth0Id = async (auth0_id) => {

  const userDeleted = await GetUserByAuth0Id(auth0_id);

  if (!userDeleted) return null;

  await User.destroy({
    where:{
      auth0_id: auth0_id,
    }
  });

  return userDeleted;
};

const PatchUserByAuth0Id = async (auth0_id, parametersToBeChanged) => {
  await User.update(
    parametersToBeChanged,
    {
      where:{
        auth0_id: auth0_id,
      }
    }
  );

  return GetUserByAuth0Id(auth0_id);
};

const UpdateAdminByAuth0Id = async (auth0_id, {isAdmin}) => {
  const user = await GetUserByAuth0Id(auth0_id);

  if (!user) return null;

  user.isAdmin = isAdmin;
  await user.save();

  return user;
};

const GetAllUsers = async (auth0_id) => {
  const users = await User.findAll({
    where: {
      auth0_id: {
        [Op.ne]: auth0_id,
      },
    },
    attributes: {
      exclude: ["profileImage"],
    },
    order: [["wins", "DESC"], ["loss", "ASC"], ["draws", "DESC"]],
  });

  return users;
};


module.exports = {
  CreateUser,
  GetUserByAuth0Id,
  DeleteUserByAuth0Id,
  PatchUserByAuth0Id,
  UpdateAdminByAuth0Id,
  GetAllUsers,
};