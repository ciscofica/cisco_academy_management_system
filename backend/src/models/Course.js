import { DataTypes } from "sequelize";
import User from "./User.js";
import db from "../database/db.js"; // Importa todo el objeto

const { sequelize } = db; // Extrae sequelize del objeto

const Course = sequelize.define(
  "Course",
  {
    course_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "course_id",
    },
    course_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    start_registration_date: {
      type: DataTypes.DATE,
    },
    end_registration_date: {
      type: DataTypes.DATE,
    },
    start_enrollment_date: {
      type: DataTypes.DATE,
    },
    end_enrollment_date: {
      type: DataTypes.DATE,
    },
    start_date: {
      type: DataTypes.DATE,
    },
    end_date: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.STRING(100),
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
      field: "updated_at",
    },
    createdBy: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      field: "created_by",
    },
    detail_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Detail",
        key: "detail_id",
      },
      field: "detail_id",
    },
    template_course_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "course",
        key: "course_id",
      },
      field: "template_course_id",
    },
  },
  {
    tableName: "course",
    timestamps: false,
  }
);

export default Course;
