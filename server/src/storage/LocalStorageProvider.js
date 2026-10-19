import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultUploadDir = path.resolve(__dirname, '../../uploads');

export class LocalStorageProvider {
  constructor(uploadDir) {
    this.uploadDir = uploadDir || defaultUploadDir;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file) {
    return {
      storedFilename: file.filename,
      originalFilename: file.originalname,
      filePath: path.join(this.uploadDir, file.filename),
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  async saveBuffer(buffer, originalFilename, mimeType) {
    const ext = path.extname(originalFilename);
    const storedFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(this.uploadDir, storedFilename);

    await fs.promises.writeFile(filePath, buffer);

    return {
      storedFilename,
      originalFilename,
      filePath,
      fileSize: buffer.length,
      mimeType,
    };
  }

  getFilePath(storedFilename) {
    return path.join(this.uploadDir, storedFilename);
  }

  async fileExists(storedFilename) {
    const filePath = this.getFilePath(storedFilename);
    return fs.existsSync(filePath);
  }

  async getFileStream(storedFilename) {
    const filePath = this.getFilePath(storedFilename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${storedFilename}`);
    }
    return fs.createReadStream(filePath);
  }

  async deleteFile(storedFilename) {
    const filePath = this.getFilePath(storedFilename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  }
}

let storageInstance = null;

export const getStorageProvider = () => {
  if (!storageInstance) {
    storageInstance = new LocalStorageProvider();
  }
  return storageInstance;
};
