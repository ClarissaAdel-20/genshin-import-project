import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'weapon_detail_page.dart';
import 'cart_page.dart';
import 'admin_crud_page.dart';
import 'login_page.dart';

class StorePage extends StatefulWidget {
  const StorePage({super.key});

  @override
  State<StorePage> createState() => _StorePageState();
}

class _StorePageState extends State<StorePage> {
  List<Weapon> _weaponsList = [];
  bool _isLoading = true;
  String _activeCategory = "All";
  final List<Weapon> _cart = [];

  @override
  void initState() {
    super.initState();
    _loadWeapons();
  }

  Future<void> _loadWeapons() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final list = await ApiService.fetchWeapons();
      setState(() {
        _weaponsList = list;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error fetching weapons: $e")),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _onAddToCart(Weapon weapon) {
    setState(() {
      _cart.add(weapon);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("${weapon.name} added to cart!"),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredWeapons = _activeCategory == "All"
        ? _weaponsList
        : _weaponsList.where((w) {
            final typeLower = w.type.toLowerCase();
            final categoryLower = _activeCategory.toLowerCase();
            return typeLower.contains(categoryLower);
          }).toList();

    final isAdmin = ApiService.currentSession?.role == "admin";

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text("GachaMerch Shop",
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        actions: [
          // Admin panel direct link trigger if isAdmin
          if (isAdmin)
            IconButton(
              icon: const Icon(Icons.admin_panel_settings,
                  color: Color(0xFF60A5FA)),
              tooltip: "Admin Hub",
              onPressed: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const AdminCrudPage()),
                );
                _loadWeapons(); // Reload in case admin changed any stocks
              },
            ),

          // Cart with Dynamic badge
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart, color: Color(0xFFF59E0B)),
                tooltip: "Shopping Cart",
                onPressed: () async {
                  await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => CartPage(initialCart: _cart),
                    ),
                  );
                  setState(() {}); // Repaint state to capture deleted items
                },
              ),
              if (_cart.isNotEmpty)
                Positioned(
                  right: 4,
                  top: 4,
                  child: IgnorePointer(
                    ignoring: true,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      constraints:
                          const BoxConstraints(minWidth: 16, minHeight: 16),
                      child: Text(
                        "${_cart.length}",
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                ),
            ],
          ),

          // Log out session
          Tooltip(
            message: "Logout",
            child: IconButton(
              icon: const Icon(Icons.logout, color: Color(0xFF94A3B8)),
              tooltip: "Logout",
              onPressed: () {
                ApiService.logout();
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginPage()),
                );
              },
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Banner Section
          Container(
            padding: const EdgeInsets.all(16.0),
            color: const Color(0xFF1E293B),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: const Color(0xFF0F172A),
                  child: Text(
                    ApiService.currentSession?.username
                            .substring(0, 1)
                            .toUpperCase() ??
                        "U",
                    style: const TextStyle(
                        color: Color(0xFFF59E0B), fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Welcome, ${ApiService.currentSession?.username ?? 'Visitor'}",
                      style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16),
                    ),
                    Text(
                      "Privilege: ${ApiService.currentSession?.role.toUpperCase() ?? 'USER'}",
                      style: const TextStyle(
                          color: Color(0xFF94A3B8), fontSize: 12),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Genre Tabs Filter List
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            height: 64,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                "All",
                "Sword",
                "Claymore",
                "Bow",
                "Polearm",
                "Catalyst",
                "Flower",
                "Plume",
                "Sands",
                "Goblet",
                "Circlet"
              ].map((category) {
                final isSelected = _activeCategory == category;
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _activeCategory = category;
                    });
                  },
                  child: Container(
                    margin: const EdgeInsets.only(right: 12),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFFF59E0B)
                          : const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected
                            ? const Color(0xFFF59E0B)
                            : const Color(0xFF334155),
                      ),
                    ),
                    child: Center(
                      child: Text(
                        category,
                        style: TextStyle(
                          color: isSelected ? Colors.black : Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // Product Inventory Mesh Grid
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
                : filteredWeapons.isEmpty
                    ? const Center(
                        child: Text("No weapon commodities found in inventory.",
                            style: TextStyle(color: Color(0xFF94A3B8))))
                    : GridView.builder(
                        padding: const EdgeInsets.all(16),
                        gridDelegate:
                            const SliverGridDelegateWithMaxCrossAxisExtent(
                          maxCrossAxisExtent: 220,
                          childAspectRatio: 0.75,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                        ),
                        itemCount: filteredWeapons.length,
                        itemBuilder: (context, index) {
                          final weapon = filteredWeapons[index];
                          final outOfStock = weapon.stock <= 0;

                          return GestureDetector(
                            onTap: () async {
                              final added = await Navigator.push<bool>(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      WeaponDetailPage(weapon: weapon),
                                ),
                              );
                              if (added == true) {
                                _onAddToCart(weapon);
                              }
                            },
                            child: Card(
                              color: const Color(0xFF1E293B),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side:
                                    const BorderSide(color: Color(0xFF334155)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  // Product Image Asset Placeholder
                                  Expanded(
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0F172A),
                                        borderRadius:
                                            const BorderRadius.vertical(
                                                top: Radius.circular(12)),
                                        image: weapon.image.isNotEmpty
                                            ? DecorationImage(
                                                image: AssetImage(
                                                    weapon.getAssetPath()),
                                                fit: BoxFit.contain,
                                              )
                                            : null,
                                      ),
                                      child: weapon.image.isEmpty
                                          ? const Icon(Icons.shield,
                                              color: Color(0xFF475569),
                                              size: 48)
                                          : null,
                                    ),
                                  ),

                                  // Merch details meta
                                  Padding(
                                    padding: const EdgeInsets.all(12.0),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          weapon.name,
                                          style: const TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        Text(
                                          weapon.type,
                                          style: const TextStyle(
                                              color: Color(0xFF94A3B8),
                                              fontSize: 11),
                                        ),
                                        const SizedBox(height: 6),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              "${weapon.price.toStringAsFixed(0)} Primogems",
                                              style: const TextStyle(
                                                  color: Color(0xFFF59E0B),
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 12),
                                            ),
                                            Text(
                                              outOfStock
                                                  ? "OUT OF STOCK"
                                                  : "Stock: ${weapon.stock}",
                                              style: TextStyle(
                                                color: outOfStock
                                                    ? Colors.red
                                                    : const Color(0xFF10B981),
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),

                                  // Fast checkout trigger action button
                                  Padding(
                                    padding: const EdgeInsets.only(
                                        left: 12, right: 12, bottom: 12),
                                    child: SizedBox(
                                      height: 32,
                                      child: ElevatedButton(
                                        onPressed: outOfStock
                                            ? null
                                            : () => _onAddToCart(weapon),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor:
                                              const Color(0xFF334155),
                                          foregroundColor: Colors.white,
                                          shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(6),
                                          ),
                                          padding: EdgeInsets.zero,
                                        ),
                                        child: const Text("QUICK ADD",
                                            style: TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.bold)),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
