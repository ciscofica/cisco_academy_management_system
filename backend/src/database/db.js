import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  'utn_cms',
  'root',
  'ServBay.dev',
  {
    host: '127.0.0.1',
    port: 3306,
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


