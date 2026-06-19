const express = require('express');
const RecoveryService = require('../services/recovery.service');
const CloudinaryService = require('../services/cloudinary.service');
const router = express.Router();

// Register a newly uploaded file for recovery
router.post('/register', (req, res) => {
  try {
    const { 
      id,
      deviceId,
      originalFileName,
      originalPath,
      mimeType,
      sizeBytes,
      cloudinaryPublicId,
      cloudinarySecureUrl,
      resourceType
    } = req.body;

    if (!originalFileName || !cloudinaryPublicId || !cloudinarySecureUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: originalFileName, cloudinaryPublicId, and cloudinarySecureUrl are required.' 
      });
    }

    const record = RecoveryService.registerFile({
      id,
      deviceId: deviceId || req.headers['x-device-id'] || 'default_device',
      originalFileName,
      originalPath,
      mimeType,
      sizeBytes,
      cloudinaryPublicId,
      cloudinarySecureUrl,
      resourceType
    });

    res.json({
      success: true,
      file: record
    });
  } catch (error) {
    console.error('Error registering recovery file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all active recovery files for a device
router.get('/files', (req, res) => {
  try {
    const deviceId = req.query.deviceId || req.headers['x-device-id'] || 'default_device';
    
    // Purge expired files automatically during retrieval
    RecoveryService.purgeExpired();

    const files = RecoveryService.getFiles(deviceId);
    res.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Error retrieving recovery files:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a recovery file permanently (deletes from Cloudinary and local database)
router.post('/delete', async (req, res) => {
  try {
    const { cloudinaryPublicId, resourceType = 'image' } = req.body;
    const deviceId = req.body.deviceId || req.headers['x-device-id'] || 'default_device';

    if (!cloudinaryPublicId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameter: cloudinaryPublicId' 
      });
    }

    // 1. Delete from Cloudinary
    const deletedFromCloud = await CloudinaryService.deleteFile(cloudinaryPublicId, resourceType);

    // 2. Delete from Local registry
    const deletedFromRegistry = RecoveryService.deleteFile(deviceId, cloudinaryPublicId);

    if (deletedFromRegistry) {
      res.json({
        success: true,
        message: 'File permanently deleted from recovery vault.',
        cloudDeletion: deletedFromCloud ? 'success' : 'failed'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'File not found in recovery vault.'
      });
    }
  } catch (error) {
    console.error('Error deleting recovery file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate download/restore token (for future verification/security implementation)
router.post('/restore-token', (req, res) => {
  try {
    const { id } = req.body;
    // Simple mock token generation
    const restoreToken = `rest_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    res.json({
      success: true,
      restoreToken,
      expiresIn: 3600 // 1 hour
    });
  } catch (error) {
    console.error('Error creating restore token:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
