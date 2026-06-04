import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme.dart';

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

  // Generic form handler that adapts labels for both Weapons and Artifacts
  void _openItemFormDialog(
      [Weapon? existingWeapon, bool forceIsArtifact = false]) {
    final isEditing = existingWeapon != null;

    // Detect if this item is an Artifact based on its ID prefix ('A') or the button clicked
    final isArtifact = forceIsArtifact ||
        (isEditing && existingWeapon.id.toUpperCase().startsWith('A'));
    final itemLabel = isArtifact ? "Artifact" : "Weapon";

    final idController = TextEditingController(text: existingWeapon?.id ?? "");
    final nameController =
        TextEditingController(text: existingWeapon?.name ?? "");
    final typeController = TextEditingController(
        text:
            existingWeapon?.type ?? (isArtifact ? "Flower of Life" : "Sword"));
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
              backgroundColor: AppColors.surface,
              scrollable: true,
              title: Text(
                isEditing
                    ? "Modify $itemLabel Profile"
                    : "Add Legendary Commodity",
                style: const TextStyle(
                    color: AppColors.primary, fontWeight: FontWeight.bold),
              ),
              content: SizedBox(
                width: 400,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Dynamic ID Input Label
                    TextField(
                      controller: idController,
                      enabled: !isEditing,
                      style: const TextStyle(color: Colors.black),
                      decoration: InputDecoration(
                        labelText:
                            "Unique $itemLabel Code ID (e.g. ${isArtifact ? 'A01' : 'W06'})",
                        labelStyle: const TextStyle(color: AppColors.primary),
                        enabledBorder: const UnderlineInputBorder(
                            borderSide: BorderSide(color: AppColors.border)),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Dynamic Name Input Label
                    TextField(
                      controller: nameController,
                      style: const TextStyle(color: Colors.black),
                      decoration: InputDecoration(
                        labelText: "$itemLabel Name",
                        labelStyle: const TextStyle(color: AppColors.primary),
                        enabledBorder: const UnderlineInputBorder(
                            borderSide: BorderSide(color: AppColors.border)),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Category dropdown
                    DropdownButtonFormField<String>(
                      value: typeController.text,
                      dropdownColor: AppColors.surface,
                      style: const TextStyle(color: AppColors.textDark),
                      decoration: const InputDecoration(
                        labelText: "Commodity Classification Category",
                        labelStyle: TextStyle(color: AppColors.primary),
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
                      style: const TextStyle(color: AppColors.textDark),
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: "Historical Description Lore",
                        labelStyle: TextStyle(color: AppColors.primary),
                        enabledBorder: UnderlineInputBorder(
                            borderSide: BorderSide(color: AppColors.border)),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Stock level
                    TextField(
                      controller: stockController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.black),
                      decoration: const InputDecoration(
                        labelText: "Available Stock Amount",
                        labelStyle: TextStyle(color: AppColors.primary),
                        enabledBorder: UnderlineInputBorder(
                            borderSide: BorderSide(color: AppColors.border)),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Price
                    TextField(
                      controller: priceController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.black),
                      decoration: const InputDecoration(
                        labelText: "Value Price in Primogems",
                        labelStyle: TextStyle(color: AppColors.primary),
                        enabledBorder: UnderlineInputBorder(
                            borderSide: BorderSide(color: AppColors.border)),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Image Url
                    TextField(
                      controller: imageController,
                      style: const TextStyle(color: Colors.black),
                      decoration: const InputDecoration(
                        labelText: "Remote Image URL Link",
                        labelStyle: TextStyle(color: AppColors.primary),
                        enabledBorder: UnderlineInputBorder(
                            borderSide: BorderSide(color: AppColors.border)),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text("CANCEL",
                      style:
                          TextStyle(color: Color.fromARGB(255, 222, 154, 71))),
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
                        SnackBar(
                            content: Text(
                                "Error saving ${itemLabel.toLowerCase()}: $e")),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                  ),
                  child: Text(isEditing
                      ? "SAVE CHANGES"
                      : "PROVISION ${itemLabel.toUpperCase()}"),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _deleteWeapon(String id) async {
    final isArtifact = id.toUpperCase().startsWith('A');
    final itemLabel = isArtifact ? "Artifact" : "Weapon";

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: Text("Purge $itemLabel",
            style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
            "Are you absolutely certain you want to purge this $context from the database completely? This action is irreversible."),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text("CANCEL",
                style: TextStyle(color: Color.fromARGB(255, 222, 154, 71))),
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
            SnackBar(content: Text("Error deleting $itemLabel: $e")),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text("GachaMerch Database CRUD Panel"),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textDark,
        actions: [
          // Text Button to add weapon
          TextButton.icon(
            onPressed: () => _openItemFormDialog(),
            icon: const Icon(Icons.add, color: AppColors.primary, size: 18),
            label: const Text(
              "ADD WEAPON",
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Text Button to add artifact (passes true to force artifact labels)
          TextButton.icon(
            onPressed: () => _openItemFormDialog(null, true),
            icon: const Icon(Icons.auto_awesome,
                color: AppColors.primary, size: 18),
            label: const Text(
              "ADD ARTIFACT",
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : _weaponsList.isEmpty
              ? const Center(
                  child: Text("No items in inventory database.",
                      style:
                          TextStyle(color: Color.fromARGB(255, 222, 154, 71))))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _weaponsList.length,
                  itemBuilder: (context, index) {
                    final item = _weaponsList[index];
                    return Card(
                      color: AppColors.surface,
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: const BorderSide(color: AppColors.border),
                      ),
                      child: ListTile(
                        leading: Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            color: AppColors.background,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: item.image.isNotEmpty
                              ? Image.asset(item.getAssetPath(),
                                  fit: BoxFit.contain)
                              : const Icon(Icons.shield,
                                  color: AppColors.textMuted),
                        ),
                        title: Text(item.name,
                            style: const TextStyle(
                                color: AppColors.textDark,
                                fontWeight: FontWeight.bold)),
                        subtitle: Text(
                          "ID: ${item.id}  |  Type: ${item.type}  |  Stock: ${item.stock}",
                          style: const TextStyle(
                              color: AppColors.textMuted, fontSize: 12),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.edit,
                                  color: Color.fromARGB(255, 141, 102, 55)),
                              onPressed: () => _openItemFormDialog(item),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline,
                                  color: Color.fromARGB(255, 237, 14, 14)),
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
