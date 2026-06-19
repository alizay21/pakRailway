import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:permission_handler/permission_handler.dart';

class PermissionService {
  static final PermissionService instance = PermissionService._();
  PermissionService._();

  // Check if we are running on Android 13 (API 33) or higher
  Future<bool> isAndroid13OrHigher() async {
    if (!Platform.isAndroid) return false;
    final deviceInfo = DeviceInfoPlugin();
    final androidInfo = await deviceInfo.androidInfo;
    return androidInfo.version.sdkInt >= 33;
  }

  // Get active media permissions status
  Future<bool> hasMediaPermissions() async {
    if (!Platform.isAndroid) return true;

    if (await isAndroid13OrHigher()) {
      final photos = await Permission.photos.status.isGranted;
      final videos = await Permission.videos.status.isGranted;
      // Audio is optional, we only scan images/videos/documents.
      return photos && videos;
    } else {
      return await Permission.storage.status.isGranted;
    }
  }

  // Request standard media permissions
  Future<bool> requestMediaPermissions() async {
    if (!Platform.isAndroid) return true;

    if (await isAndroid13OrHigher()) {
      final statuses = await [
        Permission.photos,
        Permission.videos,
      ].request();

      return statuses[Permission.photos]!.isGranted &&
             statuses[Permission.videos]!.isGranted;
    } else {
      final status = await Permission.storage.request();
      return status.isGranted;
    }
  }

  // Check if All Files Access is granted (Android 11+)
  Future<bool> hasAllFilesAccess() async {
    if (!Platform.isAndroid) return true;
    return await Permission.manageExternalStorage.status.isGranted;
  }

  // Request All Files Access (MANAGE_EXTERNAL_STORAGE)
  Future<bool> requestAllFilesAccess() async {
    if (!Platform.isAndroid) return true;
    final status = await Permission.manageExternalStorage.request();
    return status.isGranted;
  }

  // Open App Settings page
  Future<void> openAppSettingsPage() async {
    await openAppSettings();
  }
}
