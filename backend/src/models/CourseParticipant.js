// models/CourseParticipant.js
import { DataTypes } from "sequelize";
import Course from './Course.js';
import User from './User.js';
import db from '../database/db.js';
import Participant from "./Participant.js";

const { sequelize } = db;

const CourseParticipant = sequelize.define(
  "CourseParticipant",
  {
    course_participant_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    course_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Course,
        key: "course_id",
      },
      allowNull: false,
    },
    participant_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Participant,
        key: "participant_id",
      },
      allowNull: false,
    },
    total_payment: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      field: "total_payment",
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "invoice_number",
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "payment_id",
    },
    validation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "validation_date",
    },
    enrolled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "enrolled",
    },
    approval: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "approval",
    },
    grade_final: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: "grade_final",
    },
    status_code: {
      type: DataTypes.STRING(10),
      defaultValue: "I",
      field: "status_code",
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
  },
  {
    tableName: "course_participant",
    timestamps: false,
  }
);

export default CourseParticipant;
