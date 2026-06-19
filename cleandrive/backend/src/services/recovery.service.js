const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '../../storage');
const STORAGE_FILE = path.join(STORAGE_DIR, 'recoveryStore.json');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Helper to read storage file
function readStore() {
  if (!fs.existsSync(STORAGE_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading recovery store:', err);
    return [];
  }
}

// Helper to write storage file
function writeStore(data) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to recovery store:', err);
  }
}

class RecoveryService {
  static registerFile(file) {
    const store = readStore();
    const retentionDays = parseInt(process.env.RECOVERY_RETENTION_DAYS || '7', 10);
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + retentionDays);

    const newRecord = {
      id: file.id || Date.now().toString(),
      deviceId: file.deviceId || 'default_device',
      originalFileName: file.originalFileName,
      originalPath: file.originalPath,
      mimeType: file.mimeType,
      sizeBytes: parseInt(file.sizeBytes || '0', 10),
      deletedAt: Date.now(),
      cloudinaryPublicId: file.cloudinaryPublicId,
      cloudinarySecureUrl: file.cloudinarySecureUrl,
      resourceType: file.resourceType || 'image',
      restoreStatus: 'backed_up',
      expiryDate: expiryDate.getTime(),
    };

    store.push(newRecord);
    writeStore(store);
    return newRecord;
  }

  static getFiles(deviceId) {
    const store = readStore();
    const now = Date.now();

    // Filter out expired items and return active ones
    const activeFiles = store.filter(file => {
      // If expired, we keep it in store but maybe mark it or delete it later. Let's filter it out.
      return file.deviceId === deviceId && file.expiryDate > now;
    });

    return activeFiles;
  }

  static deleteFile(deviceId, cloudinaryPublicId) {
    let store = readStore();
    const initialLength = store.length;
    store = store.filter(file => !(file.deviceId === deviceId && file.cloudinaryPublicId === cloudinaryPublicId));
    
    writeStore(store);
    return store.length < initialLength;
  }

  static purgeExpired() {
    let store = readStore();
    const now = Date.now();
    const initialLength = store.length;
    const expired = store.filter(file => file.expiryDate <= now);
    store = store.filter(file => file.expiryDate > now);
    
    if (store.length < initialLength) {
      writeStore(store);
      console.log(`Purged ${initialLength - store.length} expired recovery files.`);
    }
    return expired;
  }
}

module.exports = RecoveryService;
