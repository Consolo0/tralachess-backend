const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
const config = require("../api/config/config.js");

dotenv.config();

let sequelizeInstance = null;

const getSequelize = () => {
  if (!sequelizeInstance){
    const environment = process.env.NODE_ENV || "development";
    const dbConfig = config[environment];

    sequelizeInstance = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {	
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging:false,
        ...(dbConfig.dialectOptions && { dialectOptions: dbConfig.dialectOptions }),
      }
    );
  }

  return sequelizeInstance;
};

const sequelize = getSequelize();

module.exports=sequelize;