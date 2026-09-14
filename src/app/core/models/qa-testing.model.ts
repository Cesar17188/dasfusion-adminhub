export type TestType = 'unit' | 'integration' | 'e2e' | 'uat' | 'security' | 'performance';
export type BugSeverity = 'critical' | 'high' | 'medium' | 'low';
export type BugStatus = 'open' | 'investigating' | 'fixing' | 'in_retest' | 'resolved' | 'closed';

export interface TestCase {
  id: string;
  projectId: string;
  title: string;
  type: TestType;
  suite: string;
  expectedResult: string;
  status: 'passed' | 'failed' | 'blocked' | 'untested';
  lastRun?: string;
  tester: string;
}

export interface BugReport {
  id: string;
  projectId: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  severity: BugSeverity;
  status: BugStatus;
  reportedBy: string;
  assignedDev: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface QAStats {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  openBugs: number;
  criticalBugs: number;
  coveragePercentage: number;
}
