const dotenv = require("dotenv");
dotenv.config();

const user = process.env.POSTGRES_USER;
const password = process.env.POSTGRES_PASSWORD;
const db = process.env.POSTGRES_DB;
const port = process.env.DB_PORT;
const host = process.env.DB_HOST;

const config =
{
  "development": {
    "username": user,
    "password": password,
    "database": db,
    "port": port,
    "host": host,
    "dialect": "postgres"
  },
  "test": {
    "username": user,
    "password": password,
    "database": db,
    "port": port,
    "host": host,
    "dialect": "postgres"
  },
  "production": {
    "username": user,
    "password": password,
    "database": db,
    "port": port,
    "host": host,
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
};

module.exports=config;