import fs from 'fs';
import path from 'path';
import { UPLOAD_PATH, UPLOAD_PATH_TEMP } from '../config';

const publicDir = path.resolve(__dirname, '..', 'public');
const rootDir = path.resolve(__dirname, '..', '..');

const imagesDir = path.join(publicDir, UPLOAD_PATH);
const tempDir = path.join(rootDir, UPLOAD_PATH_TEMP);

const ensureUploadDirs = () => {
  fs.mkdirSync(imagesDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });
};

const fileExists = async (filePath: string) => {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch (_error) {
    return false;
  }
};

const moveImageToPublic = async (fileName: string) => {
  const baseName = path.basename(fileName);
  if (!baseName || baseName === '.' || baseName === '..') {
    return;
  }

  const from = path.join(tempDir, baseName);
  if (!(await fileExists(from))) {
    return;
  }

  await fs.promises.copyFile(from, path.join(imagesDir, baseName));
  await fs.promises.unlink(from);
};

const removePublicImage = async (fileName: string) => {
  const filePath = path.join(imagesDir, path.basename(fileName));
  await fs.promises.unlink(filePath).catch(() => undefined);
};

export {
  ensureUploadDirs,
  moveImageToPublic,
  removePublicImage,
  tempDir,
};
