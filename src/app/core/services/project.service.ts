import { Injectable, computed, inject, signal } from '@angular/core';
import { Project, ProjectCategory, ProjectPriority, ProjectRequirement, ProjectStatus, SupabaseProjectDb } from '../models/project.model';
import { SupabaseService } from './supabase.service';
import { INITIAL_PROJECTS } from './mock-data';

const STORAGE_KEY_PROJECTS = 'df_crm_projects';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly supabaseService = inject(SupabaseService);

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

  constructor() {
    this.syncWithSupabase();
  }

  async syncWithSupabase() {
    try {
      const dbProjects = await this.supabaseService.fetchProjects();
      if (dbProjects) {
        const mapped: Project[] = dbProjects.map(p => {
          const existing = this.projects().find(x => x.id === p.id);
          const validStatuses: ProjectStatus[] = ['lead', 'architecture', 'development', 'testing', 'delivery', 'completed'];
          const status = (validStatuses.includes(p.status as ProjectStatus)) ? (p.status as ProjectStatus) : (existing?.status || 'architecture');
          const priority = (p.priority === 'low' || p.priority === 'high' || p.priority === 'critical') ? p.priority : (existing?.priority || 'medium');

          return {
            id: p.id,
            clientId: p.lead_id || existing?.clientId || 'lead-auto',
            clientName: existing?.clientName || 'Cliente DASFusion',
            clientCompany: existing?.clientCompany || 'DASFusion Hub Client',
            title: p.title,
            description: p.description,
            category: existing?.category || 'Fullstack Web',
            status,
            priority,
            budget: Number(p.budget) || existing?.budget || 15000,
            currency: 'USD',
            startDate: p.start_date || existing?.startDate || new Date().toISOString().substring(0, 10),
            targetDeliveryDate: p.target_delivery_date || existing?.targetDeliveryDate || new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
            techStack: p.tech_stack || existing?.techStack || ['Angular', 'Supabase', 'Node.js'],
            requirements: existing?.requirements || [
              { id: 'req-1', title: 'Diseño de Arquitectura y Modelo DB', isCompleted: true, priority: 'must_have' },
              { id: 'req-2', title: 'Integración Supabase RLS y API', isCompleted: false, priority: 'must_have' }
            ],
            progressPercentage: p.progress_percentage ?? existing?.progressPercentage ?? 35,
            leadScore: existing?.leadScore || 85,
            assignedLeadDev: existing?.assignedLeadDev || 'César Morales',
            assignedQALead: existing?.assignedQALead || 'QA Team',
            createdAt: p.created_at || new Date().toISOString(),
            liveUrl: p.live_url || undefined
          };
        });

        this.saveProjects(mapped);
      }
    } catch (err) {
      console.warn('Could not sync projects with Supabase:', err);
    }
  }

  private loadProjects(): Project[] {
    const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (saved) {
      try {
        const parsed: Project[] = JSON.parse(saved);
        // Clean out legacy mock data with prj-0x ids
        const cleaned = parsed.filter(p => !p.id.startsWith('prj-0'));
        return cleaned;
      } catch {
        // fallback
      }
    }
    return [];
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

  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'progressPercentage'>): Promise<Project> {
    const tempId = 'prj-' + Date.now().toString(36);
    const newProject: Project = {
      ...data,
      id: tempId,
      progressPercentage: 0,
      createdAt: new Date().toISOString()
    };

    const updated = [newProject, ...this.projects()];
    this.saveProjects(updated);

    // Persist to Supabase if connected
    try {
      const { data: dbData, error } = await this.supabaseService.insertProject({
        title: data.title,
        description: data.description,
        lead_id: data.clientId && !data.clientId.startsWith('lead-') ? data.clientId : null,
        status: data.status,
        priority: data.priority,
        budget: data.budget,
        start_date: data.startDate,
        target_delivery_date: data.targetDeliveryDate,
        tech_stack: data.techStack,
        progress_percentage: 0
      });

      if (dbData && dbData.id) {
        this.updateProject(tempId, { id: dbData.id });
        newProject.id = dbData.id;
      }
    } catch (err) {
      console.warn('Saved project locally');
    }

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

    // Sync to Supabase if UUID
    if (id && !id.startsWith('prj-')) {
      const dbUpdates: Partial<SupabaseProjectDb> = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
      if (updates.progressPercentage !== undefined) dbUpdates.progress_percentage = updates.progressPercentage;
      if (updates.startDate) dbUpdates.start_date = updates.startDate;
      if (updates.targetDeliveryDate) dbUpdates.target_delivery_date = updates.targetDeliveryDate;
      if (updates.techStack) dbUpdates.tech_stack = updates.techStack;

      this.supabaseService.updateProject(id, dbUpdates).catch(() => {});
    }
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
