import { DataTypes } from 'sequelize';
import User from './User.js';
import db from '../database/db.js';

const { sequelize } = db;

const Chapter = sequelize.define('Chapter', {
  chapter_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'chapter_id',
  },
  chapter_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  hours: {
    type: DataTypes.INTEGER,
  },
  main_topics: {
    type: DataTypes.TEXT,
    field: 'main_topics',
  },
  modality: {
    type: DataTypes.STRING(100),
    defaultValue: 'Virtual',
    field: 'modality',
  },
  activity: {
    type: DataTypes.STRING(255),
    field: 'activity',
  },
  start_date: {
    type: DataTypes.DATE,
  },
  end_date: {
    type: DataTypes.DATE,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    field: 'updated_at',
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    field: 'created_by',
  },
}, {
  tableName: 'chapter',
  timestamps: false,
});

export default Chapter;
