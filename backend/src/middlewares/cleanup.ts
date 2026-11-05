import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { tempDir } from '../utils/paths';

const MAX_TEMP_AGE = 60 * 60 * 1000;

const startTempCleanup = () => {
  cron.schedule('0 * * * *', async () => {
    const fileNames = await fs.promises.readdir(tempDir).catch(() => []);

    await Promise.all(fileNames.map(async (fileName) => {
      const filePath = path.join(tempDir, fileName);
      const stat = await fs.promises.stat(filePath);
      if (Date.now() - stat.mtimeMs > MAX_TEMP_AGE) {
        await fs.promises.unlink(filePath).catch(() => undefined);
      }
    }));
  });
};

export default startTempCleanup;
