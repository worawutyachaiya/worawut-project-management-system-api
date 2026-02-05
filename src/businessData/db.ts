import mysql, { Connection, ConnectionOptions } from "mysql2/promise";

const connection = async (configDb: string = ""): Promise<Connection> => {
  const access: ConnectionOptions = {
    multipleStatements: true,
    host: process.env[`${configDb ? `${configDb}_` : ""}HOST`],
    user: process.env[`${configDb ? `${configDb}_` : ""}USER_NAME`],
    password: process.env[`${configDb ? `${configDb}_` : ""}PASSWORD`],
    database: process.env[`${configDb ? `${configDb}_` : ""}DB`],
    decimalNumbers: true,
  };

  const con = await mysql.createConnection(access);
  return con;
};

export { connection };
