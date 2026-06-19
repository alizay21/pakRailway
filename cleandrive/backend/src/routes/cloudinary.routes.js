const express = require('express');
const CloudinaryService = require('../services/cloudinary.service');
const router = express.Router();

router.post('/sign-upload', (req, res) => {
  try {
    const { folder = 'cleandrive', resource_type = 'auto' } = req.body;
    
    // Validate request
    if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ 
        error: 'Cloudinary configuration is missing on the server. Please check environment variables.' 
      });
    }

    // Parameters that Cloudinary signature verification requires
    const params = {
      folder,
    };

    const signatureData = CloudinaryService.generateSignature(params);

    res.json({
      success: true,
      ...signatureData,
      folder
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
