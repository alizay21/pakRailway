import 'package:flutter/material.dart';
import '../features/onboarding/onboarding_screen.dart';
import '../features/dashboard/dashboard_nav_container.dart';
import '../features/scanner/scan_progress_screen.dart';
import '../features/duplicates/duplicate_groups_screen.dart';
import '../features/duplicates/duplicate_group_detail_screen.dart';
import '../features/smart_search/smart_search_screen.dart';
import '../features/settings/settings_screen.dart';
import '../features/recovery/recovery_dashboard_screen.dart';

class AppRouter {
  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String dashboard = '/dashboard';
  static const String scanProgress = '/scan-progress';
  static const String duplicateGroups = '/duplicate-groups';
  static const String duplicateGroupDetail = '/duplicate-group-detail';
  static const String smartSearch = '/smart-search';
  static const String settings = '/settings';
  static const String recovery = '/recovery';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splash:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      case onboarding:
        return MaterialPageRoute(builder: (_) => const OnboardingScreen());
      case dashboard:
        return MaterialPageRoute(builder: (_) => const DashboardNavContainer());
      case scanProgress:
        final args = settings.arguments as Map<String, dynamic>?;
        return MaterialPageRoute(
          builder: (_) => ScanProgressScreen(
            scanMode: args?['scanMode'] ?? 'quick',
          ),
        );
      case duplicateGroups:
        return MaterialPageRoute(builder: (_) => const DuplicateGroupsScreen());
      case duplicateGroupDetail:
        final groupId = settings.arguments as String;
        return MaterialPageRoute(
          builder: (_) => DuplicateGroupDetailScreen(groupId: groupId),
        );
      case smartSearch:
        return MaterialPageRoute(builder: (_) => const SmartSearchScreen());
      case settings:
        return MaterialPageRoute(builder: (_) => const SettingsScreen());
      case recovery:
        return MaterialPageRoute(builder: (_) => const RecoveryDashboardScreen());
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
        );
    }
  }
}

// Temporary SplashScreen inline to avoid extra file overhead.
// We will transition into onboarding or home based on first run.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkFirstRun();
  }

  Future<void> _checkFirstRun() async {
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    
    // In a real app we read shared preferences to check if onboarding is complete.
    // For now we just route to onboarding.
    Navigator.pushReplacementNamed(context, AppRouter.onboarding);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F111E),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Glowing dynamic logo
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)],
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF3B82F6).withOpacity(0.5),
                    blurRadius: 30,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const Icon(
                Icons.cleaning_services_rounded,
                size: 72,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'CLEANDRIVE',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: 4,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'AI Smart Cleaner System',
              style: TextStyle(
                fontSize: 14,
                color: Colors.white.withOpacity(0.6),
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 48),
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF06B6D4)),
            ),
          ],
        ),
      ),
    );
  }
}
