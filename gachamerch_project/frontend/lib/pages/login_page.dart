import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'store_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  // Navigates directly to the store page silently storing the token in the background
  void _navigateToStore() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const StorePage()),
    );
  }

  // 1. Regular Database Login (Checks admin/user with password123)
  void _handleStandardLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      await ApiService.login(
        _usernameController.text.trim(),
        _passwordController.text,
      );
      setState(() => _isLoading = false);
      _navigateToStore(); // Seamless transition to store page
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(
                'Login Error: ${e.toString().replaceAll('Exception:', '')}')),
      );
    }
  }

  // 2. Realistic Google Account Selector Modal (External OAuth Simulation)
  void _showGoogleAccountSelector() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Image.network(
                      'https://cdnjs.cloudflare.com/ajax/libs/gapi-signer/0.0.1/google.png',
                      height: 24,
                      width: 24,
                      errorBuilder: (context, error, stackTrace) =>
                          const Icon(Icons.g_mobiledata, color: Colors.blue),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'Sign in with Google',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Choose an account to continue to Genshin Import',
                  style: TextStyle(color: Colors.grey, fontSize: 14),
                ),
                const SizedBox(height: 16),
                const Divider(),
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Colors.deepPurple,
                    child: Text('T', style: TextStyle(color: Colors.white)),
                  ),
                  title: const Text('Traveler Aether'),
                  subtitle: const Text('traveler.genshin@gmail.com'),
                  onTap: () => _executeOAuthLogin('traveler.genshin@gmail.com'),
                ),
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Colors.blue,
                    child: Text('P', style: TextStyle(color: Colors.white)),
                  ),
                  title: const Text('Paimon Emergency'),
                  subtitle: const Text('paimon.food@gmail.com'),
                  onTap: () => _executeOAuthLogin('paimon.food@gmail.com'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // Completes the backend API login route handshake following account selection
  void _executeOAuthLogin(String email) async {
    Navigator.pop(context); // Close the selector sheet
    setState(() => _isLoading = true);
    try {
      await ApiService.loginWithOAuth(email, "google");
      setState(() => _isLoading = false);
      _navigateToStore(); // Silently log in and open the shop page
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('OAuth Error: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Card(
              elevation: 8,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(32.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Visual icon logo removed as requested
                      const SizedBox(height: 16),
                      const Text(
                        'Genshin Import', // Updated heading text
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 28, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Genshin Impact Imports Hub',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey),
                      ),
                      const SizedBox(height: 32),
                      TextFormField(
                        controller: _usernameController,
                        decoration: const InputDecoration(
                          labelText: 'Username',
                          prefixIcon: Icon(Icons.person),
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Please enter your account username';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: true,
                        decoration: const InputDecoration(
                          labelText: 'Password',
                          prefixIcon: Icon(Icons.lock),
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your account password';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 24),
                      _isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              onPressed: _handleStandardLogin,
                              child: const Text('Sign In',
                                  style: TextStyle(fontSize: 16)),
                            ),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Expanded(child: Divider(thickness: 1)),
                          Padding(
                            padding: EdgeInsets.symmetric(horizontal: 16),
                            child: Text('OR',
                                style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold)),
                          ),
                          Expanded(child: Divider(thickness: 1)),
                        ],
                      ),
                      const SizedBox(height: 24),
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          side: const BorderSide(color: Colors.grey),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        icon: Image.network(
                          'https://cdnjs.cloudflare.com/ajax/libs/gapi-signer/0.0.1/google.png',
                          height: 20,
                          width: 20,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(Icons.g_mobiledata,
                                  color: Colors.blue, size: 20),
                        ),
                        label: const Text(
                          'Sign In with Google',
                          style: TextStyle(
                              color: Colors.black87,
                              fontWeight: FontWeight.w600),
                        ),
                        onPressed:
                            _isLoading ? null : _showGoogleAccountSelector,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
