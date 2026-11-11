// models/Payment.js
import { DataTypes } from 'sequelize';
import User from './User.js';
import db from '../database/db.js';

const { sequelize } = db;

const Payment = sequelize.define('Payment', {
    payment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    invoice_number: {
        type: DataTypes.STRING(50),
    },
    invoice_date: {
        type: DataTypes.DATEONLY,
    },
    payer_cid_ruc: {
        type: DataTypes.STRING(20),
    },
    payer_name: {
        type: DataTypes.STRING(255),
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
    },
    iva: {
        type: DataTypes.DECIMAL(10, 2),
    },
    description: {
        type: DataTypes.TEXT,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
    },
    project_code: {
        type: DataTypes.STRING(50),
        defaultValue: '0607',
    },
    course_id: {
        type: DataTypes.INTEGER,
    },
    payment_type_id: {
        type: DataTypes.INTEGER,
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
    tableName: 'payment',
    timestamps: false,
});

export default Payment;
