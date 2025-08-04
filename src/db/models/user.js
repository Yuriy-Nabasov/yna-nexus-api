// src/db/models/user.js

import { model, Schema } from 'mongoose';
import { ROLES } from '../../constants/index.js';

const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    collectedStamps: {
      type: [{ type: Schema.Types.ObjectId, ref: 'stamps' }],
      default: [],
    },
    desiredStamps: {
      type: [{ type: Schema.Types.ObjectId, ref: 'stamps' }],
      default: [],
    },
    role: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.USER],
      default: ROLES.USER,
    },
  },
  { timestamps: true, versionKey: false },
);

usersSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const UsersCollection = model('users', usersSchema);
