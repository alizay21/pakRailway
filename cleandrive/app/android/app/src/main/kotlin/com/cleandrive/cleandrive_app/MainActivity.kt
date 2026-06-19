package com.cleandrive.cleandrive_app

import android.media.MediaMetadataRetriever
import android.graphics.Bitmap
import android.graphics.Color
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.ByteArrayOutputStream
import java.io.File
import kotlin.math.roundToLong

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.cleandrive.app/video_util"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            if (call.method == "getVideoMetadata") {
                val path = call.argument<String>("path")
                if (path == null) {
                    result.error("INVALID_ARGUMENT", "Path is null", null)
                    return@setMethodCallHandler
                }
                val metadata = getVideoMetadata(path)
                if (metadata != null) {
                    result.success(metadata)
                } else {
                    result.error("METADATA_FAILED", "Failed to retrieve metadata", null)
                }
            } else if (call.method == "getVideoFrameHash") {
                val path = call.argument<String>("path")
                val percent = call.argument<Double>("percent") ?: 0.5
                if (path == null) {
                    result.error("INVALID_ARGUMENT", "Path is null", null)
                    return@setMethodCallHandler
                }
                val hash = getVideoFrameHash(path, percent)
                if (hash != null) {
                    result.success(hash)
                } else {
                    result.error("HASH_FAILED", "Failed to calculate frame hash", null)
                }
            } else {
                result.notImplemented()
            }
        }
    }

    private fun getVideoMetadata(path: String): Map<String, Any>? {
        val file = File(path)
        if (!file.exists()) return null

        val retriever = MediaMetadataRetriever()
        return try {
            retriever.setDataSource(path)
            val durationStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
            val widthStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)
            val heightStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)
            val bitrateStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_BITRATE)

            val durationMs = durationStr?.toLongOrNull() ?: 0L
            
            val meta = mutableMapOf<String, Any>()
            meta["durationMs"] = durationMs
            meta["width"] = widthStr?.toIntOrNull() ?: 0
            meta["height"] = heightStr?.toIntOrNull() ?: 0
            meta["bitrate"] = bitrateStr?.toLongOrNull() ?: 0L
            
            // Extract a thumbnail at 10% duration
            val frameTimeUs = (durationMs * 1000) / 10
            val bitmap = retriever.getFrameAtTime(frameTimeUs, MediaMetadataRetriever.OPTION_CLOSEST_SYNC)
            if (bitmap != null) {
                val scaled = Bitmap.createScaledBitmap(bitmap, 64, 64, true)
                val out = ByteArrayOutputStream()
                scaled.compress(Bitmap.CompressFormat.JPEG, 70, out)
                meta["thumbnailBytes"] = out.toByteArray()
            }
            meta
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            try {
                retriever.release()
            } catch (e: Exception) {
                // Ignore
            }
        }
    }

    private fun getVideoFrameHash(path: String, percent: Double): String? {
        val retriever = MediaMetadataRetriever()
        return try {
            retriever.setDataSource(path)
            val durationStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
            val durationMs = durationStr?.toLongOrNull() ?: 0L
            if (durationMs == 0L) return null

            val frameTimeUs = ((durationMs * percent) * 1000).roundToLong()
            val bitmap = retriever.getFrameAtTime(frameTimeUs, MediaMetadataRetriever.OPTION_CLOSEST_SYNC) ?: return null

            // Compute average hash (aHash) for the frame
            // 1. Scale down to 8x8
            val scaled = Bitmap.createScaledBitmap(bitmap, 8, 8, true)
            
            // 2. Grayscale & Average calculation
            var totalLuminance = 0
            val pixels = IntArray(64)
            scaled.getPixels(pixels, 0, 8, 0, 0, 8, 8)
            val grays = IntArray(64)
            for (i in 0 until 64) {
                val p = pixels[i]
                val r = Color.red(p)
                val g = Color.green(p)
                val b = Color.blue(p)
                val gray = (0.299 * r + 0.587 * g + 0.114 * b).toInt()
                grays[i] = gray
                totalLuminance += gray
            }

            val avgLuminance = totalLuminance / 64

            // 3. Generate binary string
            val sb = StringBuilder()
            for (i in 0 until 64) {
                if (grays[i] >= avgLuminance) {
                    sb.append("1")
                } else {
                    sb.append("0")
                }
            }
            sb.toString()
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            try {
                retriever.release()
            } catch (e: Exception) {
                // Ignore
            }
        }
    }
}
