import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gachamerch/main.dart';

void main() {
  testWidgets('GachaMerch App initial load login screen test',
      (WidgetTester tester) async {
    // 1. Build our GachaMerchApp and trigger a frame.
    await tester.pumpWidget(const GachaMerchApp());

    // 2. Clear any active microtask queues or timers from the initial frame
    await tester.pumpAndSettle();

    // 3. Verify that our Login Screen title and main inputs render correctly.
    expect(find.text('GachaMerch Hub'), findsOneWidget);
    expect(find.text('COSC6094 Mobile Solution'), findsOneWidget);
    expect(find.text('AUTHENTICATE SESSION'), findsOneWidget);

    // 4. Verify input fields exist as expected
    expect(find.byIcon(Icons.person_outline), findsOneWidget); // Username Icon
    expect(find.byIcon(Icons.lock_outline), findsOneWidget); // Password Icon
  });
}
