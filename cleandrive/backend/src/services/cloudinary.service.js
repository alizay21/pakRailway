const cloudinary = require('cloudinary').v2;

class CloudinaryService {
  static configure() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
  }

  static generateSignature(params) {
    this.configure();
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const paramsToSign = {
      ...params,
      timestamp: timestamp,
    };
    
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return {
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    };
  }

  static async deleteFile(publicId, resourceType = 'image') {
    this.configure();
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true
      });
      return result.result === 'ok';
    } catch (err) {
      console.error('Cloudinary deletion failed for ID:', publicId, err);
      return false;
    }
  }
}

module.exports = CloudinaryService;
