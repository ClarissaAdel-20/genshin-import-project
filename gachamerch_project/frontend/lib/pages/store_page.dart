import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme.dart';
import 'product_detail_page.dart';
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
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text("GachaMerch Shop",
            style: TextStyle(
                fontWeight: FontWeight.bold, color: AppColors.textDark)),
        backgroundColor: AppColors.surface,
        elevation: 0,
        actions: [
          // Admin panel direct link trigger if isAdmin
          if (isAdmin)
            IconButton(
              icon: const Icon(Icons.admin_panel_settings,
                  color: Color.fromARGB(255, 180, 147, 108)),
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
                icon: const Icon(Icons.shopping_cart, color: AppColors.primary),
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
              icon: const Icon(Icons.logout,
                  color: Color.fromARGB(255, 56, 34, 8)),
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
            color: AppColors.surface,
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppColors.primary,
                  child: Text(
                    ApiService.currentSession?.username
                            .substring(0, 1)
                            .toUpperCase() ??
                        "U",
                    style: const TextStyle(
                        color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Welcome, ${ApiService.currentSession?.username ?? 'Visitor'}",
                      style: const TextStyle(
                          color: AppColors.textDark,
                          fontWeight: FontWeight.bold,
                          fontSize: 16),
                    ),
                    Text(
                      "Privilege: ${ApiService.currentSession?.role.toUpperCase() ?? 'USER'}",
                      style: const TextStyle(
                          color: Color.fromARGB(255, 246, 190, 121),
                          fontSize: 12),
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
                          ? const Color.fromARGB(255, 246, 222, 165)
                          : const Color.fromARGB(255, 236, 199, 147),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected
                            ? const Color.fromARGB(255, 171, 128, 49)
                            : AppColors.border,
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
                    child: CircularProgressIndicator(color: AppColors.primary))
                : filteredWeapons.isEmpty
                    ? const Center(
                        child: Text("No weapon commodities found in inventory.",
                            style: TextStyle(
                                color: Color.fromARGB(255, 146, 89, 19))))
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
                              await Navigator.push<bool>(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ProductDetailPage(
                                    weapons: filteredWeapons,
                                    initialIndex: index,
                                    onAddToCart: () => _onAddToCart(weapon),
                                  ),
                                ),
                              );
                            },
                            child: Card(
                              color: const Color.fromARGB(255, 225, 179, 113),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: const BorderSide(color: AppColors.border),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  // Product Image Asset Placeholder
                                  Expanded(
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: const Color.fromARGB(
                                            255, 243, 227, 204),
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
                                              color: AppColors.textMuted,
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
                                              color: AppColors.textDark,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        Text(
                                          weapon.type,
                                          style: const TextStyle(
                                              color: AppColors.highlight,
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
                                                  color: AppColors.primary,
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
                                                    : AppColors.textDark,
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
                                        style: ButtonStyle(
                                          backgroundColor:
                                              MaterialStateProperty.resolveWith(
                                                  (states) {
                                            if (states.contains(
                                                MaterialState.hovered)) {
                                              return Colors.green[700];
                                            }
                                            if (states.contains(
                                                MaterialState.disabled)) {
                                              return AppColors.border
                                                  .withOpacity(0.4);
                                            }
                                            return AppColors.border;
                                          }),
                                          foregroundColor:
                                              MaterialStateProperty.all(
                                                  Colors.white),
                                          shape: MaterialStateProperty.all(
                                            RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(6),
                                            ),
                                          ),
                                          padding: MaterialStateProperty.all(
                                              EdgeInsets.zero),
                                        ),
                                        child: const Text("QUICK ADD",
                                            style: TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.bold)),
                                      ),
                                    ),
                                  ),

                                  // View full details button
                                  Padding(
                                    padding: const EdgeInsets.only(
                                        left: 12, right: 12, bottom: 12),
                                    child: SizedBox(
                                      height: 32,
                                      child: OutlinedButton(
                                        onPressed: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) =>
                                                  ProductDetailPage(
                                                weapons: filteredWeapons,
                                                initialIndex: index,
                                                onAddToCart: () =>
                                                    _onAddToCart(weapon),
                                              ),
                                            ),
                                          );
                                        },
                                        style: ButtonStyle(
                                          foregroundColor:
                                              MaterialStateProperty.all(
                                                  AppColors.primary),
                                          side:
                                              MaterialStateProperty.resolveWith(
                                                  (states) {
                                            if (states.contains(
                                                MaterialState.hovered)) {
                                              return const BorderSide(
                                                  color: Color(0xFF8B3F2F),
                                                  width: 1.5);
                                            }
                                            return const BorderSide(
                                                color: AppColors.primary);
                                          }),
                                          overlayColor:
                                              MaterialStateProperty.resolveWith(
                                                  (states) {
                                            if (states.contains(
                                                MaterialState.hovered)) {
                                              return AppColors.primary
                                                  .withOpacity(0.15);
                                            }
                                            return null;
                                          }),
                                          shape: MaterialStateProperty.all(
                                            RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(6),
                                            ),
                                          ),
                                          padding: MaterialStateProperty.all(
                                              EdgeInsets.zero),
                                        ),
                                        child: const Text("DESCRIPTION",
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
