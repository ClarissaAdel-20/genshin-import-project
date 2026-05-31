import 'package:flutter/material.dart';
import 'pages/login_page.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const GachaMerchApp());
}

class GachaMerchApp extends StatelessWidget {
  const GachaMerchApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GachaMerch Hub',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        primaryColor: const Color(0xFFF59E0B),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFF59E0B),
          secondary: Color(0xFF10B981),
          surface: Color(0xFF1E293B),
          background: const Color(0xFF0F172A),
        ),
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      debugShowCheckedModeBanner: false,
      home: const LoginPage(),
    );
  }
}
