import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AdminCrudPage extends StatefulWidget {
  const AdminCrudPage({super.key});

  @override
  State<AdminCrudPage> createState() => _AdminCrudPageState();
}

class _AdminCrudPageState extends State<AdminCrudPage> {
  List<Weapon> _weaponsList = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _refreshWeapons();
  }

  Future<void> _refreshWeapons() async {
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

  void _openWeaponFormDialog([Weapon? existingWeapon]) {
    final isEditing = existingWeapon != null;

    final idController = TextEditingController(text: existingWeapon?.id ?? "");
    final nameController =
        TextEditingController(text: existingWeapon?.name ?? "");
    final typeController =
        TextEditingController(text: existingWeapon?.type ?? "Sword");
    final descriptionController =
        TextEditingController(text: existingWeapon?.description ?? "");
    final stockController =
        TextEditingController(text: existingWeapon?.stock.toString() ?? "10");
    final imageController =
        TextEditingController(text: existingWeapon?.image ?? "");
    final priceController = TextEditingController(
        text: existingWeapon?.price.toString() ?? "648000");

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: const Color(0xFF1E293B),
              scrollable: true,
              title: Text(
                isEditing ? "Modify Weapon Profile" : "Add Legendary Commodity",
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold),
              ),
              content: SizedBox(
                width: 400,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Weapon ID Input (Read-only during edit)
                    TextField(
                      controller: idController,
                      enabled: !isEditing,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: "Unique Weapon Code ID (e.g. W06)",
                        labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                        enabledBorder: const UnderlineInputBorder(
                            borderSide: BorderSide(color: Color(0xFF334155))),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Weapon Name Input
                    TextField(
                      controller: nameController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: "Weapon Name",
                        labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                        enabledBorder: UnderlineInputBorder(
                            borderSide: BorderSide(color: Color(0xFF334155))),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Category dropdown
                    DropdownButtonFormField<String>(
                      value: typeController.text,
                      dropdownColor: const Color(0xFF1E293B),
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: "Commodity Classification Category",
                        labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                      ),
                      items: () {
                        final dropdownItems = [
                          "Sword",
                          "Claymore",
                          "Bow",
                          "Polearm",
                          "Catalyst",
                          "Flower of Life",
                          "Plume of Death",
                          "Sands of Eon",
                          "Goblet of Eonothem",
                          "Circlet of Logos",
                          "Flower",
                          "Plume",
                          "Sands",
                          "Goblet",
                          "Circlet"
                        ];
                        final currentVal = typeController.text.trim();
                        if (currentVal.isNotEmpty &&
                            !dropdownItems.contains(currentVal)) {
                          dropdownItems.add(currentVal);
                        }
                        return dropdownItems.map((t) {
                          return DropdownMenuItem<String>(
                            value: t,
                            child: Text(t),
                          );
                        }).toList();
                      }(),
                      onChanged: (val) {
                        if (val != null) {
                          setDialogState(() {
                            typeController.text = val;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 12),

                    // Description text box
                    TextField(
                      controller: descriptionController,
                      style: const TextStyle(color: Colors.white),
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: "Historical Description Lore",
                        labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                        enabledBorder: UnderlineInputBorder(
                            borderSide: BorderSide(color: Color(0xFF334155))),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Stock level
                    TextField(
                      controller: stockController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: "Available Stock Amount",
                        labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                        enabledBorder: UnderlineInputBorder(
                            borderSide: BorderSide(color: Color(0xFF334155))),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Price
                    TextField(
                      controller: priceController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: "Value Price in Primogems",
                        labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                        enabledBorder: UnderlineInputBorder(
                            borderSide: BorderSide(color: Color(0xFF334155))),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Image Url
                    TextField(
                      controller: imageController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: "Remote Image URL Link",
                        labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                        enabledBorder: UnderlineInputBorder(
                            borderSide: BorderSide(color: Color(0xFF334155))),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text("CANCEL",
                      style: TextStyle(color: Color(0xFF64748B))),
                ),
                ElevatedButton(
                  onPressed: () async {
                    final double price =
                        double.tryParse(priceController.text) ?? 0.0;
                    final int stock = int.tryParse(stockController.text) ?? 0;

                    final item = Weapon(
                      id: idController.text.trim(),
                      name: nameController.text.trim(),
                      type: typeController.text.trim(),
                      description: descriptionController.text.trim(),
                      stock: stock,
                      image: imageController.text.trim(),
                      price: price,
                    );

                    try {
                      if (isEditing) {
                        await ApiService.updateWeapon(item);
                      } else {
                        await ApiService.createWeapon(item);
                      }
                      if (context.mounted) {
                        Navigator.pop(context);
                        _refreshWeapons();
                      }
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text("Error saving weapon: $e")),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF59E0B),
                    foregroundColor: Colors.black,
                  ),
                  child: Text(isEditing ? "SAVE CHANGES" : "PROVISION WEAPON"),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _deleteWeapon(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text("Purge Weapon",
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: const Text(
            "Are you absolutely certain you want to purge this weapon from the database completely? This action is irreversible."),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text("CANCEL",
                style: TextStyle(color: Color(0xFF94A3B8))),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text("YES, PURGE"),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await ApiService.deleteWeapon(id);
        _refreshWeapons();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Error deleting weapon: $e")),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text("GachaMerch Database CRUD Panel"),
        backgroundColor: const Color(0xFF1E293B),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Color(0xFF10B981), size: 28),
            onPressed: () => _openWeaponFormDialog(),
            tooltip: "Add Weapon",
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
          : _weaponsList.isEmpty
              ? const Center(
                  child: Text("No items in inventory database.",
                      style: TextStyle(color: Color(0xFF94A3B8))))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _weaponsList.length,
                  itemBuilder: (context, index) {
                    final item = _weaponsList[index];
                    return Card(
                      color: const Color(0xFF1E293B),
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: const BorderSide(color: Color(0xFF334155)),
                      ),
                      child: ListTile(
                        leading: Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: item.image.isNotEmpty
                              ? Image.asset(item.getAssetPath(),
                                  fit: BoxFit.contain)
                              : const Icon(Icons.shield,
                                  color: Color(0xFF475569)),
                        ),
                        title: Text(item.name,
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold)),
                        subtitle: Text(
                          "ID: ${item.id}  |  Type: ${item.type}  |  Stock: ${item.stock}",
                          style: const TextStyle(
                              color: Color(0xFF94A3B8), fontSize: 12),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.edit,
                                  color: Color(0xFF60A5FA)),
                              onPressed: () => _openWeaponFormDialog(item),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline,
                                  color: Colors.redAccent),
                              onPressed: () => _deleteWeapon(item.id),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
