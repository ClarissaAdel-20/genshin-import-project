import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme.dart';

class ProductDetailPage extends StatefulWidget {
  final List<Weapon> weapons;
  final int initialIndex;
  final VoidCallback? onAddToCart;

  const ProductDetailPage({
    super.key,
    required this.weapons,
    required this.initialIndex,
    this.onAddToCart,
  });

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  late int currentIndex;

  Weapon get weapon => widget.weapons[currentIndex];
  bool get outOfStock => weapon.stock <= 0;
  bool get hasPrevious => currentIndex > 0;
  bool get hasNext => currentIndex < widget.weapons.length - 1;

  @override
  void initState() {
    super.initState();
    currentIndex = widget.initialIndex;
  }

  void _goPrevious() {
    if (!hasPrevious) return;
    setState(() {
      currentIndex--;
    });
  }

  void _goNext() {
    if (!hasNext) return;
    setState(() {
      currentIndex++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(weapon.name,
            style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textDark,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Left Side: Product Image
            Expanded(
              flex: 1,
              child: Container(
                height: 500,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  border: Border.all(color: AppColors.border),
                ),
                child: Stack(
                  children: [
                    Center(
                      child: Hero(
                        tag: 'item-${weapon.id}',
                        child: weapon.imageFull.isNotEmpty
                            ? Image.asset(weapon.getAssetPath(weapon.imageFull),
                                fit: BoxFit.contain)
                            : const Icon(Icons.shield,
                                color: AppColors.textMuted, size: 120),
                      ),
                    ),
                    if (hasPrevious)
                      Positioned(
                        left: 8,
                        top: 0,
                        bottom: 0,
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: CircleAvatar(
                            radius: 22,
                            backgroundColor: AppColors.surface.withOpacity(0.9),
                            child: IconButton(
                              icon: const Icon(Icons.arrow_back_ios),
                              color: AppColors.textDark,
                              tooltip: 'Previous product',
                              onPressed: _goPrevious,
                            ),
                          ),
                        ),
                      ),
                    if (hasNext)
                      Positioned(
                        right: 8,
                        top: 0,
                        bottom: 0,
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: CircleAvatar(
                            radius: 22,
                            backgroundColor: AppColors.surface.withOpacity(0.9),
                            child: IconButton(
                              icon: const Icon(Icons.arrow_forward_ios),
                              color: AppColors.textDark,
                              tooltip: 'Next product',
                              onPressed: _goNext,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),

            // Right Side: Product Details
            Expanded(
              flex: 1,
              child: SingleChildScrollView(
                child: Padding(
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
                              color: AppColors.primary.withOpacity(0.15),
                              border: Border.all(color: AppColors.primary),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              weapon.type,
                              style: const TextStyle(
                                  color: AppColors.primary,
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
                                  outOfStock ? Colors.red : AppColors.highlight,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Title and Price
                      Text(
                        weapon.name,
                        style: const TextStyle(
                            color: AppColors.textDark,
                            fontSize: 26,
                            fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "${weapon.price.toStringAsFixed(0)} Primogems",
                        style: const TextStyle(
                            color: AppColors.primary,
                            fontSize: 22,
                            fontWeight: FontWeight.w600),
                      ),
                      const Divider(color: AppColors.border, height: 40),

                      // Description / Item Lore notes
                      const Text(
                        "ITEM DESCRIPTION",
                        style: TextStyle(
                            color: AppColors.textMuted,
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
                            color: AppColors.textMuted,
                            fontSize: 15,
                            height: 1.6),
                      ),
                      const SizedBox(height: 48),

                      // Action Button
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: ElevatedButton(
                          onPressed: outOfStock
                              ? null
                              : () {
                                  if (widget.onAddToCart != null) {
                                    widget.onAddToCart!();
                                  }
                                  Navigator.pop(context);
                                },
                          style: ButtonStyle(
                            backgroundColor:
                                MaterialStateProperty.resolveWith((states) {
                              if (states.contains(MaterialState.hovered)) {
                                return Colors.green[700];
                              }
                              if (states.contains(MaterialState.disabled)) {
                                return AppColors.primary.withOpacity(0.4);
                              }
                              return AppColors.primary;
                            }),
                            foregroundColor:
                                MaterialStateProperty.all(Colors.white),
                            shape: MaterialStateProperty.all(
                              RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
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
              ),
            ),
          ],
        ),
      ),
    );
  }
}
