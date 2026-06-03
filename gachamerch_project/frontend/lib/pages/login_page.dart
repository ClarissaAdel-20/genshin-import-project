import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'store_page.dart';
import '../theme.dart';

// Custom scroll behavior to remove scrollbars and overscroll glow
class NoScrollbarBehavior extends MaterialScrollBehavior {
  @override
  Widget buildOverscrollIndicator(
      BuildContext context, Widget child, ScrollableDetails details) {
    return child;
  }

  @override
  Widget buildScrollbar(
      BuildContext context, Widget child, ScrollableDetails details) {
    return child;
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _usernameController =
      TextEditingController(text: 'user');
  final TextEditingController _passwordController =
      TextEditingController(text: 'password123');
  final TextEditingController _serverUrlController =
      TextEditingController(text: ApiService.baseUrl);
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _handleLogin() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Overwrite the dynamic API Server base URL if changed in the configuration settings
      ApiService.baseUrl = _serverUrlController.text.trim();

      await ApiService.login(
        _usernameController.text.trim(),
        _passwordController.text.trim(),
      );

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const StorePage()),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst("Exception: ", "");
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.background, AppColors.surface],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: ScrollConfiguration(
            behavior: NoScrollbarBehavior(),
            child: SingleChildScrollView(
              padding:
                  const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 24),
                  const Text(
                    "Genshin Import",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppColors.textDark,
                      fontSize: 46,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                      height: 1.05,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    "Log in below to access your import hub and manage assets securely.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 16,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 40),
                  Card(
                    color: AppColors.surface.withOpacity(0.95),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: const BorderSide(
                        color: AppColors.border,
                        width: 1.5,
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24.0, vertical: 32.0),
                      child: Container(
                        constraints: const BoxConstraints(maxWidth: 400),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Branding Core Logo
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                    color: AppColors.primary, width: 1.5),
                              ),
                              child: const Icon(
                                Icons.vpn_key,
                                color: AppColors.border,
                                size: 32,
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              "GachaMerch Hub",
                              style: TextStyle(
                                color: AppColors.textDark,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 24),

                            // API Host configuration
                            TextField(
                              controller: _serverUrlController,
                              style: const TextStyle(color: AppColors.textDark),
                              decoration: InputDecoration(
                                labelText: "Express Server Endpoint Base",
                                labelStyle:
                                    const TextStyle(color: AppColors.textMuted),
                                enabledBorder: OutlineInputBorder(
                                  borderSide:
                                      const BorderSide(color: AppColors.border),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderSide: const BorderSide(
                                      color: AppColors.primary),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                prefixIcon: const Icon(Icons.dns,
                                    color: AppColors.textMuted),
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Username field
                            TextField(
                              controller: _usernameController,
                              style: const TextStyle(color: AppColors.textDark),
                              decoration: InputDecoration(
                                labelText: "Username",
                                labelStyle:
                                    const TextStyle(color: AppColors.textMuted),
                                enabledBorder: OutlineInputBorder(
                                  borderSide:
                                      const BorderSide(color: AppColors.border),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderSide: const BorderSide(
                                      color: AppColors.primary),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                prefixIcon: const Icon(Icons.person_outline,
                                    color: AppColors.textMuted),
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Password field
                            TextField(
                              controller: _passwordController,
                              obscureText: true,
                              style: const TextStyle(color: AppColors.textDark),
                              decoration: InputDecoration(
                                labelText: "Password",
                                labelStyle:
                                    const TextStyle(color: AppColors.textMuted),
                                enabledBorder: OutlineInputBorder(
                                  borderSide:
                                      const BorderSide(color: AppColors.border),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderSide: const BorderSide(
                                      color: AppColors.primary),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                prefixIcon: const Icon(Icons.lock_outline,
                                    color: AppColors.textMuted),
                              ),
                            ),
                            const SizedBox(height: 12),

                            // Error Banner
                            if (_errorMessage != null)
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.redAccent.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                      color: Colors.redAccent.withOpacity(0.5)),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.error_outline,
                                        color: Colors.redAccent, size: 20),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        _errorMessage!,
                                        style: const TextStyle(
                                            color: Colors.redAccent,
                                            fontSize: 13),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            const SizedBox(height: 24),

                            // Submit trigger button
                            SizedBox(
                              width: double.infinity,
                              height: 48,
                              child: ElevatedButton(
                                onPressed: _isLoading ? null : _handleLogin,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                child: _isLoading
                                    ? const SizedBox(
                                        width: 24,
                                        height: 24,
                                        child: CircularProgressIndicator(
                                            color: Colors.black,
                                            strokeWidth: 2),
                                      )
                                    : const Text(
                                        "LOGIN",
                                        style: TextStyle(
                                            fontWeight: FontWeight.bold),
                                      ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
