import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';
import validator from 'validator';

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: { token: string }[];
}

const tokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
}, { _id: false });

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
    default: 'Ё-мое',
  },
  email: {
    type: String,
    required: [true, 'Поле "email" должно быть заполнено'],
    unique: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: 'Поле "email" должно быть валидным email',
    },
  },
  password: {
    type: String,
    required: [true, 'Поле "password" должно быть заполнено'],
    minlength: [6, 'Минимальная длина поля "password" - 6'],
    select: false,
  },
  tokens: {
    type: [tokenSchema],
    default: [],
    select: false,
  },
}, { versionKey: false });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model<IUser>('user', userSchema);
