import { Client } from '../models/client.model';
import { Project } from '../models/project.model';
import { DevPhase, TimeLogEntry } from '../models/development.model';
import { TestCase, BugReport } from '../models/qa-testing.model';
import { DeliveryMilestone } from '../models/delivery.model';
import { SyncLog } from '../models/supabase-config.model';

export const INITIAL_CLIENTS: Client[] = [];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_DEV_PHASES: DevPhase[] = [];

export const INITIAL_TIME_LOGS: TimeLogEntry[] = [];

export const INITIAL_TEST_CASES: TestCase[] = [];

export const INITIAL_BUG_REPORTS: BugReport[] = [];

export const INITIAL_DELIVERY_MILESTONES: DeliveryMilestone[] = [];

export const INITIAL_SYNC_LOGS: SyncLog[] = [];
