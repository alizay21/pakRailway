import 'package:flutter/material.dart';

class AppTheme {
  // Futuristic Dark Theme Colors
  static const Color darkBackground = Color(0xFF0F111E);
  static const Color darkSurface = Color(0xFF161A2C);
  static const Color darkSurfaceCard = Color(0xFF1E233D);
  static const Color primaryBlue = Color(0xFF3B82F6);
  static const Color accentCyan = Color(0xFF06B6D4);
  static const Color accentPurple = Color(0xFF8B5CF6);
  static const Color textPrimaryDark = Color(0xFFF1F5F9);
  static const Color textSecondaryDark = Color(0xFF94A3B8);
  static const Color dangerRed = Color(0xFFEF4444);
  static const Color successGreen = Color(0xFF10B981);
  static const Color warningOrange = Color(0xFFF59E0B);

  // Futuristic Light Theme Colors
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceCard = Color(0xFFF1F5F9);
  static const Color textPrimaryLight = Color(0xFF0F172A);
  static const Color textSecondaryLight = Color(0xFF475569);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkBackground,
      colorScheme: const ColorScheme.dark(
        primary: primaryBlue,
        secondary: accentCyan,
        tertiary: accentPurple,
        surface: darkSurface,
        onSurface: textPrimaryDark,
        error: dangerRed,
      ),
      cardTheme: CardTheme(
        color: darkSurfaceCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.white.withOpacity(0.05), width: 1),
        ),
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: textPrimaryDark),
        headlineMedium: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: textPrimaryDark),
        titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textPrimaryDark),
        bodyLarge: TextStyle(fontSize: 16, color: textPrimaryDark),
        bodyMedium: TextStyle(fontSize: 14, color: textSecondaryDark),
        labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: primaryBlue),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: darkSurface,
        selectedItemColor: accentCyan,
        unselectedItemColor: textSecondaryDark,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      dividerTheme: DividerThemeData(
        color: Colors.white.withOpacity(0.08),
        thickness: 1,
      ),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: lightBackground,
      colorScheme: const ColorScheme.light(
        primary: primaryBlue,
        secondary: accentCyan,
        tertiary: accentPurple,
        surface: lightSurface,
        onSurface: textPrimaryLight,
        error: dangerRed,
      ),
      cardTheme: CardTheme(
        color: lightSurfaceCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.black.withOpacity(0.05), width: 1),
        ),
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: textPrimaryLight),
        headlineMedium: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: textPrimaryLight),
        titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textPrimaryLight),
        bodyLarge: TextStyle(fontSize: 16, color: textPrimaryLight),
        bodyMedium: TextStyle(fontSize: 14, color: textSecondaryLight),
        labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: primaryBlue),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: lightSurface,
        selectedItemColor: primaryBlue,
        unselectedItemColor: textSecondaryLight,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      dividerTheme: DividerThemeData(
        color: Colors.black.withOpacity(0.08),
        thickness: 1,
      ),
    );
  }

  static LinearGradient get premiumGradient => const LinearGradient(
        colors: [primaryBlue, accentPurple],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );

  static LinearGradient get cyanGradient => const LinearGradient(
        colors: [accentCyan, primaryBlue],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );

  static LinearGradient get deleteGradient => const LinearGradient(
        colors: [dangerRed, accentPurple],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
}
