import 'package:flutter/material.dart';

class AppColors {
  // Core palette (from provided screenshot)
  static const Color background = Color(0xFFF6EFE6); // cream
  static const Color surface = Color(0xFFF2EDE6); // card background
  static const Color primary = Color(0xFFD85A3F); // terracotta / accent
  static const Color highlight = Color(0xFFF7EBDC); // warm highlight
  static const Color border = Color(0xFF3B2F2A); // dark border
  static const Color textDark = Color(0xFF352923); // main readable text
  static const Color textMuted = Color(0xFF7A6D63); // secondary text
  static const Color accentGreen = Color(0xFF1F4B3A); // optional green accent
}

class AppTheme {
  static ThemeData get theme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.background,
      primaryColor: AppColors.primary,
      colorScheme: ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.highlight,
        surface: AppColors.surface,
        background: AppColors.background,
        onBackground: AppColors.textDark,
        onSurface: AppColors.textDark,
        onPrimary: Colors.white,
        onSecondary: AppColors.textDark,
      ),
      textTheme: TextTheme(
        headlineLarge: TextStyle(color: AppColors.textDark),
        titleLarge: TextStyle(color: AppColors.textDark),
        bodyMedium: TextStyle(color: AppColors.textDark),
      ),
      fontFamily: 'Inter',
      useMaterial3: true,
    );
  }
}
