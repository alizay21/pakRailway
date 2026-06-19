import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;

class DbHelper {
  static const String _dbName = 'cleandrive.db';
  static const int _dbVersion = 1;

  static final DbHelper instance = DbHelper._privateConstructor();
  static Database? _database;

  DbHelper._privateConstructor();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = p.join(dbPath, _dbName);

    return await openDatabase(
      path,
      version: _dbVersion,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // Create files index table
    await db.execute('''
      CREATE TABLE files (
        id TEXT PRIMARY KEY,
        uri TEXT,
        path TEXT,
        displayName TEXT,
        extension TEXT,
        mimeType TEXT,
        sizeBytes INTEGER,
        createdAt INTEGER,
        modifiedAt INTEGER,
        folderPath TEXT,
        sha256Hash TEXT,
        partialHash TEXT,
        metadataJson TEXT,
        extractedText TEXT,
        keywords TEXT,
        manualTags TEXT,
        imageHash TEXT,
        videoFingerprintJson TEXT,
        duplicateGroupId TEXT,
        duplicateCategory TEXT,
        confidenceScore REAL,
        riskLevel TEXT,
        cloudinaryPublicId TEXT,
        cloudinarySecureUrl TEXT,
        recoveryStatus TEXT,
        deletedAt INTEGER,
        isIgnored INTEGER DEFAULT 0,
        isFavorite INTEGER DEFAULT 0
      )
    ''');

    // Create duplicate groups index table
    await db.execute('''
      CREATE TABLE duplicate_groups (
        id TEXT PRIMARY KEY,
        category TEXT,
        confidenceScore REAL,
        reason TEXT,
        evidence TEXT,
        savingsBytes INTEGER,
        ignored INTEGER DEFAULT 0
      )
    ''');

    // Create ignored paths table
    await db.execute('''
      CREATE TABLE ignored_paths (
        path TEXT PRIMARY KEY,
        addedAt INTEGER
      )
    ''');

    // Create recovery logs table
    await db.execute('''
      CREATE TABLE recovery_backups (
        id TEXT PRIMARY KEY,
        originalFileName TEXT,
        originalPath TEXT,
        mimeType TEXT,
        sizeBytes INTEGER,
        deletedAt INTEGER,
        cloudinaryPublicId TEXT,
        cloudinarySecureUrl TEXT,
        resourceType TEXT,
        restoreStatus TEXT,
        expiryDate INTEGER
      )
    ''');
  }

  // FILE OPERATIONS
  Future<int> insertFile(Map<String, dynamic> fileData) async {
    final db = await database;
    return await db.insert(
      'files',
      fileData,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<Map<String, dynamic>>> queryAllFiles() async {
    final db = await database;
    return await db.query('files', where: 'isIgnored = 0 AND deletedAt IS NULL');
  }

  Future<Map<String, dynamic>?> queryFileById(String id) async {
    final db = await database;
    final results = await db.query('files', where: 'id = ?',   limit: 1);
    if (results.isEmpty) return null;
    return results.first;
  }

  Future<int> updateFile(String id, Map<String, dynamic> data) async {
    final db = await database;
    return await db.update('files', data, where: 'id = ?',  );
  }

  Future<int> markFileDeleted(String id) async {
    final db = await database;
    return await db.update(
      'files',
      {
        'deletedAt': DateTime.now().millisecondsSinceEpoch,
        'recoveryStatus': 'deleted_locally'
      },
      where: 'id = ?',
      
    );
  }

  Future<int> deleteFilePermanently(String id) async {
    final db = await database;
    return await db.delete('files', where: 'id = ?',  );
  }

  // DUPLICATE GROUP OPERATIONS
  Future<int> insertDuplicateGroup(Map<String, dynamic> groupData) async {
    final db = await database;
    return await db.insert(
      'duplicate_groups',
      groupData,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<Map<String, dynamic>>> queryDuplicateGroups() async {
    final db = await database;
    return await db.query('duplicate_groups', where: 'ignored = 0');
  }

  Future<List<Map<String, dynamic>>> queryFilesByGroup(String groupId) async {
    final db = await database;
    return await db.query(
      'files',
      where: 'duplicateGroupId = ? AND deletedAt IS NULL AND isIgnored = 0',
      
    );
  }

  Future<int> ignoreDuplicateGroup(String groupId) async {
    final db = await database;
    // Update files in this group to be ignored
    await db.update(
      'files',
      {'isIgnored': 1},
      where: 'duplicateGroupId = ?',
      
    );
    return await db.update(
      'duplicate_groups',
      {'ignored': 1},
      where: 'id = ?',
      
    );
  }

  // IGNORED PATHS
  Future<int> addIgnoredPath(String path) async {
    final db = await database;
    return await db.insert(
      'ignored_paths',
      {
        'path': path,
        'addedAt': DateTime.now().millisecondsSinceEpoch,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<String>> queryIgnoredPaths() async {
    final db = await database;
    final results = await db.query('ignored_paths');
    return results.map((e) => e['path'] as String).toList();
  }

  Future<int> removeIgnoredPath(String path) async {
    final db = await database;
    return await db.delete('ignored_paths', where: 'path = ?',  );
  }

  // RECOVERY OPERATIONS
  Future<int> insertRecoveryBackup(Map<String, dynamic> backup) async {
    final db = await database;
    return await db.insert(
      'recovery_backups',
      backup,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<Map<String, dynamic>>> queryRecoveryBackups() async {
    final db = await database;
    return await db.query('recovery_backups', orderBy: 'deletedAt DESC');
  }

  Future<int> deleteRecoveryBackup(String id) async {
    final db = await database;
    return await db.delete('recovery_backups', where: 'id = ?',  );
  }

  Future<int> updateRecoveryStatus(String id, String status) async {
    final db = await database;
    return await db.update(
      'recovery_backups',
      {'restoreStatus': status},
      where: 'id = ?',
      
    );
  }

  // GENERAL DB MANAGEMENT
  Future<void> clearAllData() async {
    final db = await database;
    await db.delete('files');
    await db.delete('duplicate_groups');
    await db.delete('recovery_backups');
  }
}
