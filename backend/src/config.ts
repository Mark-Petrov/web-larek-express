import dotenv from 'dotenv';

dotenv.config();

const {
  PORT = '3000',
  DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek',
  ORIGIN_ALLOW = 'http://localhost:5173',
  UPLOAD_PATH = 'images',
  UPLOAD_PATH_TEMP = 'temp',
  AUTH_REFRESH_TOKEN_EXPIRY = '7d',
  AUTH_ACCESS_TOKEN_EXPIRY = '10m',
  AUTH_ACCESS_TOKEN_SECRET = 'weblarek-access-secret',
  AUTH_REFRESH_TOKEN_SECRET = 'weblarek-refresh-secret',
} = process.env;

export {
  PORT,
  DB_ADDRESS,
  ORIGIN_ALLOW,
  UPLOAD_PATH,
  UPLOAD_PATH_TEMP,
  AUTH_REFRESH_TOKEN_EXPIRY,
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_ACCESS_TOKEN_SECRET,
  AUTH_REFRESH_TOKEN_SECRET,
};
