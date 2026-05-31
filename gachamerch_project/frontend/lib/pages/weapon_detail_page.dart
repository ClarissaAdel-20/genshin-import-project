import 'package:flutter/material.dart';
import '../services/api_service.dart';

class WeaponDetailPage extends StatelessWidget {
  final Weapon weapon;

  const WeaponDetailPage({super.key, required this.weapon});

  @override
  Widget build(BuildContext context) {
    final bool outOfStock = weapon.stock <= 0;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Text(weapon.name,
            style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Core Display Illustration Panel
            Container(
              height: 300,
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                border: Border.all(color: const Color(0xFF334155)),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withOpacity(0.5),
                      blurRadius: 10,
                      offset: const Offset(0, 4)),
                ],
              ),
              child: Hero(
                tag: 'item-${weapon.id}',
                child: weapon.image.isNotEmpty
                    ? Image.asset(weapon.getAssetPath(), fit: BoxFit.contain)
                    : const Icon(Icons.shield,
                        color: Color(0xFF475569), size: 120),
              ),
            ),

            // Content metadata text block
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Meta Tags
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFD97706).withOpacity(0.15),
                          border: Border.all(color: const Color(0xFFD97706)),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          weapon.type,
                          style: const TextStyle(
                              color: Color(0xFFF59E0B),
                              fontWeight: FontWeight.bold,
                              fontSize: 12),
                        ),
                      ),
                      Text(
                        outOfStock
                            ? "OUT OF STOCK"
                            : "In Stock: ${weapon.stock}",
                        style: TextStyle(
                          color:
                              outOfStock ? Colors.red : const Color(0xFF10B981),
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Title and Price conversion
                  Text(
                    weapon.name,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 26,
                        fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "${weapon.price.toStringAsFixed(0)} Primogems",
                    style: const TextStyle(
                        color: Color(0xFFF59E0B),
                        fontSize: 22,
                        fontWeight: FontWeight.w600),
                  ),
                  const Divider(color: Color(0xFF334155), height: 40),

                  // Description / Item Lore notes
                  const Text(
                    "ITEM DESCRIPTION",
                    style: TextStyle(
                        color: Color(0xFF64748B),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        letterSpacing: 1),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    weapon.description.isNotEmpty
                        ? weapon.description
                        : "A mysterious and legendary Genshin weapon of exquisite craftsmanship. No further description is available from the high archives.",
                    style: const TextStyle(
                        color: Color(0xFFE2E8F0), fontSize: 15, height: 1.6),
                  ),
                  const SizedBox(height: 48),

                  // Action Interactive Trigger
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: outOfStock
                          ? null
                          : () {
                              Navigator.pop(context,
                                  true); // Return true to signal add to cart
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF59E0B),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: Text(
                        outOfStock ? "OUT OF STOCK" : "ADD TO ACTIVE CART",
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
