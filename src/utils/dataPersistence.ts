/**
 * Advanced Data Persistence System
 * Comprehensive data management with migration, backup, export/import, and synchronization
 */

import { Trade, User, UserProgress, AppSettings } from '../types';

// =============================================================================
// DATA MIGRATION SYSTEM
// =============================================================================

export interface Migration {
  id: string;
  version: string;
  description: string;
  up: (data: any) => Promise<any>;
  down: (data: any) => Promise<any>;
  dependencies?: string[];
}

export interface MigrationResult {
  success: boolean;
  error?: string;
  data?: any;
  backup?: any;
}

export interface DatabaseVersion {
  current: string;
  appliedMigrations: string[];
  lastMigration: string;
  schemaVersion: string;
}

/**
 * Data Migration Manager
 */
export class MigrationManager {
  private migrations: Map<string, Migration> = new Map();
  private readonly VERSION_KEY = 'db_version';
  private readonly BACKUP_PREFIX = 'backup_';

  constructor(migrations: Migration[]) {
    migrations.forEach(migration => {
      this.migrations.set(migration.id, migration);
    });
  }

  /**
   * Register a new migration
   */
  registerMigration(migration: Migration): void {
    this.migrations.set(migration.id, migration);
  }

  /**
   * Get current database version
   */
  async getCurrentVersion(): Promise<DatabaseVersion> {
    try {
      const versionData = localStorage.getItem(this.VERSION_KEY);
      if (versionData) {
        return JSON.parse(versionData);
      }
    } catch (error) {
      console.error('Failed to load database version:', error);
    }

    return {
      current: '0.0.0',
      appliedMigrations: [],
      lastMigration: '',
      schemaVersion: '1.0.0'
    };
  }

  /**
   * Update database version
   */
  private async updateVersion(newVersion: DatabaseVersion): Promise<void> {
    try {
      localStorage.setItem(this.VERSION_KEY, JSON.stringify(newVersion));
    } catch (error) {
      console.error('Failed to update database version:', error);
      throw new Error('Failed to update database version');
    }
  }

  /**
   * Create backup of current data
   */
  private async createBackup(data: any, migrationId: string): Promise<string> {
    const backupId = `${this.BACKUP_PREFIX}${migrationId}_${Date.now()}`;
    const backupData = {
      id: backupId,
      migrationId,
      data: JSON.parse(JSON.stringify(data)),
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem(backupId, JSON.stringify(backupData));
      return backupId;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId: string): Promise<any> {
    try {
      const backupData = localStorage.getItem(backupId);
      if (!backupData) {
        throw new Error('Backup not found');
      }

      const backup = JSON.parse(backupData);
      return backup.data;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw new Error('Failed to restore from backup');
    }
  }

  /**
   * Get available backups
   */
  async getAvailableBackups(): Promise<Array<{ id: string; migrationId: string; timestamp: string }>> {
    const backups: Array<{ id: string; migrationId: string; timestamp: string }> = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.BACKUP_PREFIX)) {
        try {
          const backupData = localStorage.getItem(key);
          if (backupData) {
            const backup = JSON.parse(backupData);
            backups.push({
              id: backup.id,
              migrationId: backup.migrationId,
              timestamp: backup.timestamp
            });
          }
        } catch (error) {
          console.warn('Invalid backup data:', key);
        }
      }
    }

    return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Run migrations to target version
   */
  async migrateToVersion(targetVersion: string): Promise<MigrationResult> {
    const currentVersion = await this.getCurrentVersion();
    const sortedMigrations = this.getSortedMigrations();

    // Find migrations to apply
    const migrationsToApply = sortedMigrations.filter(migration =>
      this.shouldApplyMigration(migration, currentVersion, targetVersion)
    );

    if (migrationsToApply.length === 0) {
      return { success: true, data: null };
    }

    // Create backup before migration
    const backupId = await this.createBackup(currentVersion, migrationsToApply[0].id);

    try {
      let data = currentVersion;
      const appliedMigrations = [...currentVersion.appliedMigrations];

      for (const migration of migrationsToApply) {
        console.log(`Applying migration: ${migration.id} - ${migration.description}`);

        const result = await migration.up(data);

        if (result) {
          data = result;
        }

        appliedMigrations.push(migration.id);
      }

      // Update version
      const newVersion: DatabaseVersion = {
        ...currentVersion,
        current: targetVersion,
        appliedMigrations,
        lastMigration: migrationsToApply[migrationsToApply.length - 1].id
      };

      await this.updateVersion(newVersion);

      return {
        success: true,
        data: newVersion,
        backup: backupId
      };
    } catch (error) {
      console.error('Migration failed:', error);

      // Attempt to restore from backup
      try {
        await this.restoreFromBackup(backupId);
      } catch (restoreError) {
        console.error('Failed to restore from backup:', restoreError);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
        backup: backupId
      };
    }
  }

  /**
   * Rollback to previous version
   */
  async rollback(steps: number = 1): Promise<MigrationResult> {
    const currentVersion = await this.getCurrentVersion();
    const sortedMigrations = this.getSortedMigrations();

    const appliedMigrations = currentVersion.appliedMigrations;
    const rollbackMigrations = appliedMigrations.slice(-steps);

    if (rollbackMigrations.length === 0) {
      return { success: true, data: currentVersion };
    }

    // Create backup
    const backupId = await this.createBackup(currentVersion, 'rollback');

    try {
      let data = currentVersion;
      const newAppliedMigrations = appliedMigrations.slice(0, -steps);

      for (const migrationId of rollbackMigrations.reverse()) {
        const migration = this.migrations.get(migrationId);
        if (migration) {
          console.log(`Rolling back migration: ${migration.id}`);
          data = await migration.down(data);
        }
      }

      const newVersion: DatabaseVersion = {
        ...currentVersion,
        appliedMigrations: newAppliedMigrations,
        lastMigration: newAppliedMigrations[newAppliedMigrations.length - 1] || ''
      };

      await this.updateVersion(newVersion);

      return {
        success: true,
        data: newVersion,
        backup: backupId
      };
    } catch (error) {
      console.error('Rollback failed:', error);

      try {
        await this.restoreFromBackup(backupId);
      } catch (restoreError) {
        console.error('Failed to restore from backup:', restoreError);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Rollback failed',
        backup: backupId
      };
    }
  }

  private getSortedMigrations(): Migration[] {
    const migrations = Array.from(this.migrations.values());

    // Simple topological sort (assuming migrations are mostly linear)
    return migrations.sort((a, b) => {
      if (a.dependencies?.includes(b.id)) return 1;
      if (b.dependencies?.includes(a.id)) return -1;
      return a.id.localeCompare(b.id);
    });
  }

  private shouldApplyMigration(
    migration: Migration,
    currentVersion: DatabaseVersion,
    targetVersion: string
  ): boolean {
    // Check if migration has already been applied
    if (currentVersion.appliedMigrations.includes(migration.id)) {
      return false;
    }

    // Check dependencies
    if (migration.dependencies) {
      for (const dep of migration.dependencies) {
        if (!currentVersion.appliedMigrations.includes(dep)) {
          return false;
        }
      }
    }

    // Check version ordering (simplified)
    return migration.version <= targetVersion;
  }
}

// =============================================================================
// DATA BACKUP & RESTORE
// =============================================================================

export interface BackupData {
  id: string;
  timestamp: string;
  version: string;
  data: {
    trades: Trade[];
    user: User | null;
    progress: UserProgress | null;
    settings: AppSettings | null;
    customData?: Record<string, any>;
  };
  metadata: {
    appVersion: string;
    platform: string;
    userAgent: string;
    exportType: 'full' | 'partial';
  };
  checksum: string;
}

/**
 * Data Backup Manager
 */
export class BackupManager {
  private readonly BACKUP_KEY_PREFIX = 'backup_';
  private readonly MAX_BACKUPS = 10;

  /**
   * Create a full backup of all data
   */
  async createBackup(
    trades: Trade[],
    user: User | null,
    progress: UserProgress | null,
    settings: AppSettings | null,
    customData?: Record<string, any>
  ): Promise<string> {
    const backupData: BackupData = {
      id: `${this.BACKUP_KEY_PREFIX}${Date.now()}`,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        trades,
        user,
        progress,
        settings,
        customData
      },
      metadata: {
        appVersion: '1.0.0',
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        exportType: 'full'
      },
      checksum: this.calculateChecksum({ trades, user, progress, settings })
    };

    try {
      localStorage.setItem(backupData.id, JSON.stringify(backupData));
      await this.cleanupOldBackups();
      return backupData.id;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupId: string): Promise<BackupData['data']> {
    try {
      const backupData = localStorage.getItem(backupId);
      if (!backupData) {
        throw new Error('Backup not found');
      }

      const backup = JSON.parse(backupData) as BackupData;

      // Verify checksum
      const expectedChecksum = this.calculateChecksum(backup.data);
      if (backup.checksum !== expectedChecksum) {
        throw new Error('Backup integrity check failed');
      }

      return backup.data;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw new Error('Failed to restore backup');
    }
  }

  /**
   * Get available backups
   */
  async getAvailableBackups(): Promise<Array<{
    id: string;
    timestamp: string;
    size: number;
    version: string;
  }>> {
    const backups: Array<{
      id: string;
      timestamp: string;
      size: number;
      version: string;
    }> = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.BACKUP_KEY_PREFIX)) {
        try {
          const backupData = localStorage.getItem(key);
          if (backupData) {
            const backup = JSON.parse(backupData) as BackupData;
            backups.push({
              id: backup.id,
              timestamp: backup.timestamp,
              size: new Blob([backupData]).size,
              version: backup.version
            });
          }
        } catch (error) {
          console.warn('Invalid backup data:', key);
        }
      }
    }

    return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Delete backup
   */
  async deleteBackup(backupId: string): Promise<void> {
    try {
      localStorage.removeItem(backupId);
    } catch (error) {
      console.error('Failed to delete backup:', error);
      throw new Error('Failed to delete backup');
    }
  }

  private calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private async cleanupOldBackups(): Promise<void> {
    const backups = await this.getAvailableBackups();

    if (backups.length > this.MAX_BACKUPS) {
      const backupsToDelete = backups.slice(this.MAX_BACKUPS);

      for (const backup of backupsToDelete) {
        await this.deleteBackup(backup.id);
      }
    }
  }
}

// =============================================================================
// DATA EXPORT & IMPORT
// =============================================================================

export type ExportFormat = 'json' | 'csv' | 'excel' | 'pdf';
export type ExportScope = 'all' | 'trades' | 'settings' | 'progress';

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  includeMetadata: boolean;
  dateRange?: { start: Date; end: Date };
  filters?: Record<string, any>;
  password?: string; // For encrypted exports
}

/**
 * Data Export Manager
 */
export class ExportManager {
  /**
   * Export data in specified format
   */
  async exportData(
    trades: Trade[],
    user: User | null,
    progress: UserProgress | null,
    settings: AppSettings | null,
    options: ExportOptions
  ): Promise<Blob> {
    let data: any;

    switch (options.scope) {
      case 'all':
        data = { trades, user, progress, settings };
        break;
      case 'trades':
        data = { trades };
        break;
      case 'settings':
        data = { settings };
        break;
      case 'progress':
        data = { progress };
        break;
    }

    // Apply filters
    if (options.filters) {
      data = this.applyFilters(data, options.filters);
    }

    // Apply date range
    if (options.dateRange) {
      data = this.applyDateRange(data, options.dateRange);
    }

    // Add metadata
    if (options.includeMetadata) {
      data._metadata = {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        exportScope: options.scope,
        recordCount: this.getRecordCount(data)
      };
    }

    switch (options.format) {
      case 'json':
        return this.exportAsJSON(data, options.password);
      case 'csv':
        return this.exportAsCSV(data);
      case 'excel':
        return this.exportAsExcel(data);
      case 'pdf':
        return this.exportAsPDF(data);
      default:
        throw new Error('Unsupported export format');
    }
  }

  /**
   * Import data from file
   */
  async importData(file: File, password?: string): Promise<{
    trades: Trade[];
    user: User | null;
    progress: UserProgress | null;
    settings: AppSettings | null;
  }> {
    const fileContent = await this.readFileContent(file);

    switch (file.name.split('.').pop()?.toLowerCase()) {
      case 'json':
        return this.importFromJSON(fileContent, password);
      case 'csv':
        return this.importFromCSV(fileContent);
      default:
        throw new Error('Unsupported file format');
    }
  }

  private async exportAsJSON(data: any, password?: string): Promise<Blob> {
    let content = JSON.stringify(data, null, 2);

    if (password) {
      content = await this.encryptData(content, password);
    }

    return new Blob([content], { type: 'application/json' });
  }

  private async exportAsCSV(data: any): Promise<Blob> {
    if (!data.trades || !Array.isArray(data.trades)) {
      throw new Error('No trade data available for CSV export');
    }

    const headers = [
      'Date', 'Symbol', 'Type', 'Entry Price', 'Exit Price', 'Quantity',
      'P&L', 'P&L %', 'Target', 'Stop', 'Rule Compliant', 'Emotions', 'Notes'
    ];

    const rows = data.trades.map((trade: Trade) => [
      trade.entryDate,
      trade.symbol,
      trade.type,
      trade.entryPrice,
      trade.exitPrice || '',
      trade.quantity,
      trade.profitLoss || 0,
      trade.profitLossPercent || 0,
      trade.target || '',
      trade.stop || '',
      trade.ruleCompliant ? 'Yes' : 'No',
      (trade.emotions || []).join(', '),
      trade.notes || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  }

  private async exportAsExcel(data: any): Promise<Blob> {
    // This would integrate with a library like xlsx
    // For now, return JSON as placeholder
    console.warn('Excel export not fully implemented, using JSON format');
    return this.exportAsJSON(data);
  }

  private async exportAsPDF(data: any): Promise<Blob> {
    // This would integrate with a PDF library
    // For now, return JSON as placeholder
    console.warn('PDF export not fully implemented, using JSON format');
    return this.exportAsJSON(data);
  }

  private async importFromJSON(content: string, password?: string): Promise<any> {
    let data = content;

    if (password) {
      data = await this.decryptData(content, password);
    }

    const parsed = JSON.parse(data);

    // Validate imported data structure
    this.validateImportData(parsed);

    return parsed;
  }

  private async importFromCSV(content: string): Promise<any> {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));

    const trades: Partial<Trade>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, ''));

      if (values.length >= headers.length) {
        trades.push({
          symbol: values[headers.indexOf('Symbol')],
          type: values[headers.indexOf('Type')],
          entryPrice: parseFloat(values[headers.indexOf('Entry Price')]),
          exitPrice: values[headers.indexOf('Exit Price')] ? parseFloat(values[headers.indexOf('Exit Price')]) : undefined,
          quantity: parseInt(values[headers.indexOf('Quantity')]),
          entryDate: new Date(values[headers.indexOf('Date')]),
          profitLoss: parseFloat(values[headers.indexOf('P&L')]),
          profitLossPercent: parseFloat(values[headers.indexOf('P&L %')]),
          target: values[headers.indexOf('Target')] ? parseFloat(values[headers.indexOf('Target')]) : undefined,
          stop: values[headers.indexOf('Stop')] ? parseFloat(values[headers.indexOf('Stop')]) : undefined,
          ruleCompliant: values[headers.indexOf('Rule Compliant')] === 'Yes',
          emotions: values[headers.indexOf('Emotions')].split(',').filter(Boolean),
          notes: values[headers.indexOf('Notes')]
        });
      }
    }

    return { trades };
  }

  private applyFilters(data: any, filters: Record<string, any>): any {
    // Apply custom filters to data
    // This is a simplified implementation
    return data;
  }

  private applyDateRange(data: any, dateRange: { start: Date; end: Date }): any {
    if (data.trades && Array.isArray(data.trades)) {
      data.trades = data.trades.filter((trade: Trade) => {
        const tradeDate = new Date(trade.entryDate);
        return tradeDate >= dateRange.start && tradeDate <= dateRange.end;
      });
    }

    return data;
  }

  private getRecordCount(data: any): number {
    let count = 0;

    if (data.trades && Array.isArray(data.trades)) count += data.trades.length;
    if (data.user) count++;
    if (data.progress) count++;
    if (data.settings) count++;

    return count;
  }

  private validateImportData(data: any): void {
    const errors: string[] = [];

    if (data.trades && Array.isArray(data.trades)) {
      data.trades.forEach((trade: any, index: number) => {
        if (!trade.symbol || !trade.type || !trade.entryPrice || !trade.quantity || !trade.entryDate) {
          errors.push(`Invalid trade data at index ${index}`);
        }
      });
    }

    if (errors.length > 0) {
      throw new Error(`Import validation failed: ${errors.join(', ')}`);
    }
  }

  private async encryptData(data: string, password: string): Promise<string> {
    // Simple encryption placeholder - in production, use proper encryption
    return btoa(data);
  }

  private async decryptData(data: string, password: string): Promise<string> {
    // Simple decryption placeholder - in production, use proper decryption
    return atob(data);
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }
}

// =============================================================================
// DATA VALIDATION & INTEGRITY
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
  value: any;
  rule: string;
}

export interface DataValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  summary: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    warningRecords: number;
  };
}

/**
 * Data Validation Manager
 */
export class ValidationManager {
  /**
   * Validate trades data
   */
  validateTrades(trades: Trade[]): DataValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let validCount = 0;
    let warningCount = 0;

    trades.forEach((trade, index) => {
      // Required fields validation
      if (!trade.symbol) {
        errors.push({
          field: 'symbol',
          message: 'Symbol is required',
          value: trade.symbol,
          rule: 'required'
        });
      }

      if (!trade.entryPrice || trade.entryPrice <= 0) {
        errors.push({
          field: 'entryPrice',
          message: 'Entry price must be greater than 0',
          value: trade.entryPrice,
          rule: 'positive_number'
        });
      }

      if (!trade.quantity || trade.quantity <= 0) {
        errors.push({
          field: 'quantity',
          message: 'Quantity must be greater than 0',
          value: trade.quantity,
          rule: 'positive_integer'
        });
      }

      // Date validation
      if (trade.entryDate) {
        const entryDate = new Date(trade.entryDate);
        if (isNaN(entryDate.getTime())) {
          errors.push({
            field: 'entryDate',
            message: 'Invalid entry date format',
            value: trade.entryDate,
            rule: 'valid_date'
          });
        }
      }

      // Exit date validation
      if (trade.exitDate) {
        const exitDate = new Date(trade.exitDate);
        if (isNaN(exitDate.getTime())) {
          errors.push({
            field: 'exitDate',
            message: 'Invalid exit date format',
            value: trade.exitDate,
            rule: 'valid_date'
          });
        }

        if (trade.entryDate && exitDate < new Date(trade.entryDate)) {
          errors.push({
            field: 'exitDate',
            message: 'Exit date cannot be before entry date',
            value: trade.exitDate,
            rule: 'date_order'
          });
        }
      }

      // P&L calculation validation
      if (trade.entryPrice && trade.exitPrice) {
        const calculatedPnL = (trade.exitPrice - trade.entryPrice) * trade.quantity;
        if (trade.profitLoss && Math.abs(trade.profitLoss - calculatedPnL) > 0.01) {
          warnings.push({
            field: 'profitLoss',
            message: 'P&L does not match calculated value',
            value: trade.profitLoss,
            rule: 'pnl_calculation'
          });
          warningCount++;
        }
      }

      if (errors.length === 0) {
        validCount++;
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalRecords: trades.length,
        validRecords: validCount,
        invalidRecords: errors.length,
        warningRecords: warningCount
      }
    };
  }

  /**
   * Validate user data
   */
  validateUser(user: User): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!user.email || !this.isValidEmail(user.email)) {
      errors.push({
        field: 'email',
        message: 'Valid email is required',
        value: user.email,
        rule: 'email_format'
      });
    }

    if (!user.displayName || user.displayName.trim().length < 2) {
      errors.push({
        field: 'displayName',
        message: 'Display name must be at least 2 characters',
        value: user.displayName,
        rule: 'min_length'
      });
    }

    return errors;
  }

  /**
   * Validate settings data
   */
  validateSettings(settings: AppSettings): ValidationError[] {
    const errors: ValidationError[] = [];

    if (settings.startingPortfolio < 0) {
      errors.push({
        field: 'startingPortfolio',
        message: 'Starting portfolio cannot be negative',
        value: settings.startingPortfolio,
        rule: 'non_negative'
      });
    }

    if (settings.targetCompletions < 0) {
      errors.push({
        field: 'targetCompletions',
        message: 'Target completions cannot be negative',
        value: settings.targetCompletions,
        rule: 'non_negative'
      });
    }

    return errors;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// =============================================================================
// DATA SYNCHRONIZATION
// =============================================================================

export interface SyncResult {
  success: boolean;
  syncedRecords: number;
  conflicts: number;
  errors: string[];
  timestamp: Date;
}

export interface SyncConflict {
  id: string;
  localData: any;
  remoteData: any;
  resolution: 'local' | 'remote' | 'merge' | 'skip';
}

/**
 * Data Synchronization Manager
 */
export class SyncManager {
  private readonly SYNC_ENDPOINT = '/api/sync';
  private lastSyncTime: Date | null = null;
  private syncQueue: Array<{ type: string; data: any }> = [];

  /**
   * Synchronize data with remote server
   */
  async syncWithServer(
    trades: Trade[],
    user: User | null,
    progress: UserProgress | null,
    settings: AppSettings | null
  ): Promise<SyncResult> {
    const syncData = {
      trades,
      user,
      progress,
      settings,
      lastSyncTime: this.lastSyncTime,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(this.SYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(syncData)
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();

      this.lastSyncTime = new Date();
      this.clearSyncQueue();

      return {
        success: true,
        syncedRecords: result.syncedRecords || 0,
        conflicts: result.conflicts?.length || 0,
        errors: result.errors || [],
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Sync failed:', error);

      // Queue for retry
      this.queueForSync('full', syncData);

      return {
        success: false,
        syncedRecords: 0,
        conflicts: 0,
        errors: [error instanceof Error ? error.message : 'Unknown sync error'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Resolve sync conflicts
   */
  async resolveConflicts(conflicts: SyncConflict[]): Promise<void> {
    for (const conflict of conflicts) {
      // Auto-resolve based on timestamp
      const localTime = new Date(conflict.localData.updatedAt || 0);
      const remoteTime = new Date(conflict.remoteData.updatedAt || 0);

      if (localTime > remoteTime) {
        conflict.resolution = 'local';
      } else {
        conflict.resolution = 'remote';
      }
    }

    // Send resolution back to server
    await fetch(`${this.SYNC_ENDPOINT}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ conflicts })
    });
  }

  /**
   * Queue data for sync
   */
  queueForSync(type: string, data: any): void {
    this.syncQueue.push({ type, data });

    // Limit queue size
    if (this.syncQueue.length > 100) {
      this.syncQueue.shift();
    }
  }

  /**
   * Process sync queue
   */
  async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    const queueItem = this.syncQueue.shift();
    if (queueItem) {
      console.log('Processing queued sync:', queueItem.type);
      // Process the queued item
    }
  }

  private getAuthToken(): string {
    // Get authentication token from secure storage
    return localStorage.getItem('auth_token') || '';
  }

  private clearSyncQueue(): void {
    this.syncQueue = [];
  }
}

// =============================================================================
// GLOBAL INSTANCES
// =============================================================================

export const migrationManager = new MigrationManager([]);
export const backupManager = new BackupManager();
export const exportManager = new ExportManager();
export const validationManager = new ValidationManager();
export const syncManager = new SyncManager();
