import { Injectable, computed, signal } from '@angular/core';
import { BugReport, BugSeverity, BugStatus, TestCase, TestType } from '../models/qa-testing.model';
import { INITIAL_BUG_REPORTS, INITIAL_TEST_CASES } from './mock-data';

const STORAGE_KEY_TEST_CASES = 'df_qa_test_cases';
const STORAGE_KEY_BUGS = 'df_qa_bugs';

@Injectable({
  providedIn: 'root'
})
export class QaService {
  readonly testCases = signal<TestCase[]>(this.loadTestCases());
  readonly bugReports = signal<BugReport[]>(this.loadBugReports());
  readonly selectedProjectId = signal<string>('all');
  readonly typeFilter = signal<TestType | 'all'>('all');
  readonly statusFilter = signal<'all' | 'passed' | 'failed' | 'blocked' | 'untested'>('all');

  readonly filteredTestCases = computed(() => {
    const prjId = this.selectedProjectId();
    const type = this.typeFilter();
    const status = this.statusFilter();

    return this.testCases().filter(tc => {
      const matchPrj = prjId === 'all' || tc.projectId === prjId;
      const matchType = type === 'all' || tc.type === type;
      const matchStatus = status === 'all' || tc.status === status;
      return matchPrj && matchType && matchStatus;
    });
  });

  readonly filteredBugs = computed(() => {
    const prjId = this.selectedProjectId();
    return this.bugReports().filter(bug => prjId === 'all' || bug.projectId === prjId);
  });

  readonly totalTestsCount = computed(() => this.testCases().length);
  readonly passedTestsCount = computed(() => this.testCases().filter(t => t.status === 'passed').length);
  readonly failedTestsCount = computed(() => this.testCases().filter(t => t.status === 'failed').length);
  readonly openBugsCount = computed(() => this.bugReports().filter(b => b.status !== 'resolved' && b.status !== 'closed').length);
  readonly criticalBugsCount = computed(() => 
    this.bugReports().filter(b => b.severity === 'critical' && b.status !== 'resolved' && b.status !== 'closed').length
  );

  readonly passRate = computed(() => {
    const total = this.testCases().length;
    if (!total) return 100;
    const passed = this.passedTestsCount();
    return Math.round((passed / total) * 100);
  });

  private loadTestCases(): TestCase[] {
    const saved = localStorage.getItem(STORAGE_KEY_TEST_CASES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_TEST_CASES;
  }

  private saveTestCases(updated: TestCase[]) {
    this.testCases.set(updated);
    localStorage.setItem(STORAGE_KEY_TEST_CASES, JSON.stringify(updated));
  }

  private loadBugReports(): BugReport[] {
    const saved = localStorage.getItem(STORAGE_KEY_BUGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_BUG_REPORTS;
  }

  private saveBugReports(updated: BugReport[]) {
    this.bugReports.set(updated);
    localStorage.setItem(STORAGE_KEY_BUGS, JSON.stringify(updated));
  }

  selectProject(projectId: string) {
    this.selectedProjectId.set(projectId);
  }

  createTestCase(testCase: Omit<TestCase, 'id'>): TestCase {
    const newTC: TestCase = {
      ...testCase,
      id: 'tc-' + Date.now().toString(36)
    };
    const updated = [newTC, ...this.testCases()];
    this.saveTestCases(updated);
    return newTC;
  }

  updateTestCaseStatus(id: string, status: TestCase['status']) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updated = this.testCases().map(tc => {
      if (tc.id === id) {
        return { ...tc, status, lastRun: now };
      }
      return tc;
    });
    this.saveTestCases(updated);
  }

  createBugReport(bug: Omit<BugReport, 'id' | 'createdAt'>): BugReport {
    const newBug: BugReport = {
      ...bug,
      id: 'bug-' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    const updated = [newBug, ...this.bugReports()];
    this.saveBugReports(updated);
    return newBug;
  }

  updateBugStatus(id: string, status: BugStatus) {
    const updated = this.bugReports().map(b => {
      if (b.id === id) {
        return {
          ...b,
          status,
          ...(status === 'resolved' || status === 'closed' ? { resolvedAt: new Date().toISOString() } : {})
        };
      }
      return b;
    });
    this.saveBugReports(updated);
  }
}
