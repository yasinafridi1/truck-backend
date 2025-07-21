import { Sequelize } from "sequelize";
import envVariables from "./Constants.js";
const { dbUserName, dbPassword, dbHostName, dbName } = envVariables;

export const sequelizeInstance = new Sequelize(dbName, dbUserName, dbPassword, {
  host: dbHostName,
  // port: dbPort,
  dialect: "mysql",
  logging: false,
});
// Create a connection to the database
const dbConnection = async () => {
  try {
    await sequelizeInstance.authenticate();
    await sequelizeInstance.query("SET foreign_key_checks = 0;"); // remove this line after development is complete
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default dbConnection;
