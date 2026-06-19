# CleanDrive Backend Server

This is the lightweight Express backend that manages signed Cloudinary uploads and recovery file metadata mapping for the CleanDrive Flutter app.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the sample environment file and configure variables:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and fill in your Cloudinary API key, secret, and cloud name (available for free on [Cloudinary](https://cloudinary.com/)):
   ```env
   PORT=8080
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   JWT_SECRET=your_jwt_secret
   RECOVERY_RETENTION_DAYS=7
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will bind to port `8080` (accessible on `0.0.0.0`) so that a physical Android device on the same local network can connect by using the computer's local IP address (e.g. `http://192.168.1.100:8080`).

## Endpoints

* **Health**: `GET /health`
* **Cloudinary**:
  * `POST /cloudinary/sign-upload` - Generate a secure signed payload for raw, image, or video file uploads.
* **Recovery**:
  * `GET /recovery/files?deviceId=<id>` - Get list of active files backed up for a device.
  * `POST /recovery/register` - Save backup record details.
  * `POST /recovery/delete` - Permanently delete file from Cloudinary and recovery registry.
  * `POST /recovery/restore-token` - Generate verification token for restoring file.
