export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  tableNameClients: string;
  tableNameSubmissions: string;
  tableNameProjects: string;
  autoSyncIntervalMinutes: number;
  enableLiveSubscription: boolean;
  isConnected: boolean;
  lastSyncTimestamp?: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'manual' | 'auto' | 'realtime' | 'test_connection';
  status: 'success' | 'error' | 'warning';
  recordsSynced: number;
  message: string;
}
