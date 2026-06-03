import 'package:flutter/material.dart';
import 'pages/login_page.dart';
import 'theme.dart';

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
      theme: AppTheme.theme,
      debugShowCheckedModeBanner: false,
      home: const LoginPage(),
    );
  }
}
