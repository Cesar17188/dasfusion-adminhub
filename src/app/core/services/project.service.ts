import { Injectable, computed, signal } from '@angular/core';
import { Project, ProjectCategory, ProjectPriority, ProjectRequirement, ProjectStatus } from '../models/project.model';
import { INITIAL_PROJECTS } from './mock-data';

const STORAGE_KEY_PROJECTS = 'df_crm_projects';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  readonly projects = signal<Project[]>(this.loadProjects());
  readonly selectedProjectId = signal<string | null>(null);
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<ProjectStatus | 'all'>('all');
  readonly categoryFilter = signal<ProjectCategory | 'all'>('all');
  readonly priorityFilter = signal<ProjectPriority | 'all'>('all');

  readonly selectedProject = computed(() => {
    const id = this.selectedProjectId();
    if (!id) return null;
    return this.projects().find(p => p.id === id) || null;
  });

  readonly filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const category = this.categoryFilter();
    const priority = this.priorityFilter();

    return this.projects().filter(project => {
      const matchesQuery = !query ||
        project.title.toLowerCase().includes(query) ||
        project.clientCompany.toLowerCase().includes(query) ||
        project.clientName.toLowerCase().includes(query) ||
        project.techStack.some(t => t.toLowerCase().includes(query));

      const matchesStatus = status === 'all' || project.status === status;
      const matchesCategory = category === 'all' || project.category === category;
      const matchesPriority = priority === 'all' || project.priority === priority;

      return matchesQuery && matchesStatus && matchesCategory && matchesPriority;
    });
  });

  // Kanban column groupings
  readonly projectsLead = computed(() => this.projects().filter(p => p.status === 'lead'));
  readonly projectsArchitecture = computed(() => this.projects().filter(p => p.status === 'architecture'));
  readonly projectsDevelopment = computed(() => this.projects().filter(p => p.status === 'development'));
  readonly projectsTesting = computed(() => this.projects().filter(p => p.status === 'testing'));
  readonly projectsDelivery = computed(() => this.projects().filter(p => p.status === 'delivery'));
  readonly projectsCompleted = computed(() => this.projects().filter(p => p.status === 'completed'));

  // Metrics
  readonly totalProjects = computed(() => this.projects().length);
  readonly activeProjectsCount = computed(() => 
    this.projects().filter(p => p.status !== 'completed' && p.status !== 'lead').length
  );
  readonly totalPipelineBudget = computed(() => 
    this.projects().reduce((acc, curr) => acc + (curr.budget || 0), 0)
  );
  readonly averageProgress = computed(() => {
    const active = this.projects().filter(p => p.status !== 'lead');
    if (!active.length) return 0;
    const sum = active.reduce((acc, p) => acc + (p.progressPercentage || 0), 0);
    return Math.round(sum / active.length);
  });

  private loadProjects(): Project[] {
    const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_PROJECTS;
  }

  private saveProjects(updated: Project[]) {
    this.projects.set(updated);
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(updated));
  }

  getProjectById(id: string): Project | undefined {
    return this.projects().find(p => p.id === id);
  }

  getProjectsByClientId(clientId: string): Project[] {
    return this.projects().filter(p => p.clientId === clientId);
  }

  selectProject(id: string | null) {
    this.selectedProjectId.set(id);
  }

  createProject(data: Omit<Project, 'id' | 'createdAt' | 'progressPercentage'>): Project {
    const newProject: Project = {
      ...data,
      id: 'prj-' + Date.now().toString(36),
      progressPercentage: 0,
      createdAt: new Date().toISOString()
    };

    const updated = [newProject, ...this.projects()];
    this.saveProjects(updated);
    return newProject;
  }

  updateProject(id: string, updates: Partial<Project>) {
    const current = this.projects();
    const updated = current.map(p => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    });
    this.saveProjects(updated);
  }

  updateProjectStatus(id: string, newStatus: ProjectStatus) {
    let progress = 0;
    switch (newStatus) {
      case 'lead': progress = 5; break;
      case 'architecture': progress = 25; break;
      case 'development': progress = 60; break;
      case 'testing': progress = 85; break;
      case 'delivery': progress = 95; break;
      case 'completed': progress = 100; break;
    }

    this.updateProject(id, {
      status: newStatus,
      progressPercentage: progress,
      ...(newStatus === 'completed' ? { actualDeliveryDate: new Date().toISOString().substring(0, 10) } : {})
    });
  }

  toggleRequirement(projectId: string, reqId: string) {
    const project = this.getProjectById(projectId);
    if (!project) return;

    const updatedRequirements = project.requirements.map(req => {
      if (req.id === reqId) {
        return { ...req, isCompleted: !req.isCompleted };
      }
      return req;
    });

    const completedCount = updatedRequirements.filter(r => r.isCompleted).length;
    const total = updatedRequirements.length;
    const autoProgress = total > 0 ? Math.round((completedCount / total) * 100) : project.progressPercentage;

    this.updateProject(projectId, {
      requirements: updatedRequirements,
      progressPercentage: autoProgress
    });
  }

  addRequirement(projectId: string, title: string, priority: 'must_have' | 'nice_to_have' = 'must_have') {
    const project = this.getProjectById(projectId);
    if (!project) return;

    const newReq: ProjectRequirement = {
      id: 'req-' + Date.now().toString(36),
      title,
      isCompleted: false,
      priority
    };

    const updatedRequirements = [...project.requirements, newReq];
    this.updateProject(projectId, { requirements: updatedRequirements });
  }

  deleteProject(id: string) {
    const updated = this.projects().filter(p => p.id !== id);
    this.saveProjects(updated);
    if (this.selectedProjectId() === id) {
      this.selectedProjectId.set(null);
    }
  }
}
