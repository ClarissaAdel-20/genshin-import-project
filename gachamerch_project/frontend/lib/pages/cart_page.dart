import 'package:flutter/material.dart';
import '../services/api_service.dart';

class CartPage extends StatefulWidget {
  final List<Weapon> initialCart;

  const CartPage({super.key, required this.initialCart});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  bool _isProcessing = false;

  // Aggregate items by ID to handle counts gracefully
  Map<String, Map<String, dynamic>> _getGroupedCart() {
    final Map<String, Map<String, dynamic>> grouped = {};
    for (var weapon in widget.initialCart) {
      if (grouped.containsKey(weapon.id)) {
        grouped[weapon.id]!['quantity'] = grouped[weapon.id]!['quantity'] + 1;
      } else {
        grouped[weapon.id] = {
          'id': weapon.id,
          'name': weapon.name,
          'weapon': weapon,
          'quantity': 1,
        };
      }
    }
    return grouped;
  }

  void _removeItem(String weaponId) {
    setState(() {
      widget.initialCart.removeWhere((item) => item.id == weaponId);
    });
  }

  double _calculateTotalSum() {
    double sum = 0.0;
    for (var item in widget.initialCart) {
      sum += item.price;
    }
    return sum;
  }

  Future<void> _processCheckout() async {
    final grouped = _getGroupedCart();
    if (grouped.isEmpty) return;

    setState(() {
      _isProcessing = true;
    });

    // Prepare JSON payload: list of items with their dynamic quantities
    final List<Map<String, dynamic>> itemsPayload = grouped.values
        .map((v) => {
              'id': v['id'],
              'name': v['name'],
              'quantity': v['quantity'],
            })
        .toList();

    try {
      await ApiService.checkoutOrder(itemsPayload);

      // Clear Cart state upon success
      setState(() {
        widget.initialCart.clear();
      });

      if (mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: const Color(0xFF1E293B),
            title: const Text("Order Completed",
                style: TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold)),
            content: const Text(
              "Your checkout transaction was successfully processed and logged to the central database. Stock amounts have been updated safely.",
              style: TextStyle(color: Color(0xFFE2E8F0)),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Navigator.pop(context); // Pop cart page
                },
                child: const Text("EXCELLENT",
                    style: TextStyle(
                        color: Color(0xFFF59E0B), fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.redAccent,
            content: Text(
                "Checkout Declined: ${e.toString().replaceFirst("Exception: ", "")}"),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final groupedCart = _getGroupedCart().values.toList();
    final double totalPrice = _calculateTotalSum();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text("Checkout Cart",
            style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1E293B),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: groupedCart.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.shopping_cart_outlined,
                            size: 64, color: Color(0xFF334155)),
                        SizedBox(height: 16),
                        Text("Your shopping cart is currently empty.",
                            style: TextStyle(color: Color(0xFF94A3B8))),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: groupedCart.length,
                    itemBuilder: (context, index) {
                      final item = groupedCart[index];
                      final Weapon weapon = item['weapon'];
                      final int quantity = item['quantity'];

                      return Card(
                        color: const Color(0xFF1E293B),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                          side: const BorderSide(color: Color(0xFF334155)),
                        ),
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: weapon.image.isNotEmpty
                                ? Image.asset(weapon.getAssetPath(), fit: BoxFit.contain)
                                : const Icon(Icons.shield,
                                    color: Color(0xFF475569)),
                          ),
                          title: Text(weapon.name,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold)),
                          subtitle: Text(
                            "${weapon.price.toStringAsFixed(0)} Primogems x $quantity",
                            style: const TextStyle(color: Color(0xFF94A3B8)),
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                "${(weapon.price * quantity).toStringAsFixed(0)} Primogems",
                                style: const TextStyle(
                                    color: Color(0xFFF59E0B),
                                    fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(width: 8),
                              IconButton(
                                icon: const Icon(Icons.delete_outline,
                                    color: Colors.redAccent),
                                onPressed: () => _removeItem(weapon.id),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),

          // Checkout Summary Drawer
          if (groupedCart.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(24.0),
              decoration: const BoxDecoration(
                color: Color(0xFF1E293B),
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("SUBTOTAL SUM",
                          style: TextStyle(
                              color: Color(0xFF94A3B8),
                              fontWeight: FontWeight.bold)),
                      Text(
                        "${totalPrice.toStringAsFixed(0)} Primogems",
                        style: const TextStyle(
                            color: Color(0xFFF59E0B),
                            fontSize: 20,
                            fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _isProcessing ? null : _processCheckout,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF59E0B),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: _isProcessing
                          ? const CircularProgressIndicator(color: Colors.black)
                          : const Text("PROCEED SECURE CHECKOUT",
                              style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
