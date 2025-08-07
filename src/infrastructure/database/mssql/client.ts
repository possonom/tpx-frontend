import { Connection, Request, TYPES } from "tedious";

const mssqlConfig = {
  server: process.env.MSSQL_SERVER!,
  authentication: {
    type: "default",
    options: {
      userName: process.env.MSSQL_USER,
      password: process.env.MSSQL_PASSWORD,
    },
  },
  options: {
    database: process.env.MSSQL_DATABASE,
    encrypt: true,
    trustServerCertificate: false,
  },
};

export function createMSSQLConnection(): Promise<Connection> {
  return new Promise((resolve, reject) => {
    const connection = new Connection(mssqlConfig);
    connection.on("connect", (err) => {
      if (err) reject(err);
      else resolve(connection);
    });
    connection.connect();
  });
}
