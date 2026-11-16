import { Sequelize } from "sequelize";

const databaseName = process.env.DB_NAME || "utn_cms";
const databaseUser = process.env.DB_USER || "root";
// Configure DB_PASSWORD en el archivo .env con la contraseña que muestra ServBay para MySQL.
const databasePassword = process.env.DB_PASSWORD;

if (!databasePassword) {
  throw new Error("Falta DB_PASSWORD. Configure la contraseña de MySQL en el archivo .env del proyecto.");
}

const sequelize = new Sequelize(
  databaseName,
  databaseUser,
  databasePassword,
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida exitosamente');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

export default { sequelize, connectDB };


