import { Injectable, computed, inject, signal } from '@angular/core';
import { Client, ClientNote, ClientStatus, SupabaseLeadDb } from '../models/client.model';
import { SupabaseService } from './supabase.service';
import { INITIAL_CLIENTS } from './mock-data';

const STORAGE_KEY_CLIENTS = 'df_crm_clients';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly supabaseService = inject(SupabaseService);

  readonly clients = signal<Client[]>(this.loadClients());
  readonly selectedClientId = signal<string | null>(null);
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<ClientStatus | 'all'>('all');

  readonly selectedClient = computed(() => {
    const id = this.selectedClientId();
    if (!id) return null;
    return this.clients().find(c => c.id === id) || null;
  });

  readonly filteredClients = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();

    return this.clients().filter(client => {
      const matchesQuery = !query || 
        client.name.toLowerCase().includes(query) ||
        client.company.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.tags.some(t => t.toLowerCase().includes(query));

      const matchesStatus = status === 'all' || client.status === status;

      return matchesQuery && matchesStatus;
    });
  });

  readonly totalClients = computed(() => this.clients().length);
  
  readonly activeClientsCount = computed(() => 
    this.clients().filter(c => c.status === 'active').length
  );

  readonly leadsCount = computed(() => 
    this.clients().filter(c => c.status === 'lead' || c.status === 'negotiation' || c.status === 'contacted').length
  );

  readonly totalClientBudget = computed(() => 
    this.clients().reduce((acc, curr) => acc + (curr.totalBudget || 0), 0)
  );

  constructor() {
    this.syncWithSupabase();
  }

  private parseBudget(range?: string | null): number {
    if (!range) return 0;
    const clean = range.replace(/[^0-9]/g, ' ').trim().split(/\s+/).filter(Boolean);
    if (clean.length > 0) {
      const num = parseInt(clean[clean.length - 1], 10);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  async syncWithSupabase() {
    try {
      const leads = await this.supabaseService.fetchLeads();
      if (leads) {
        const mappedLeads: Client[] = leads.map(lead => {
          const existing = this.clients().find(c => c.id === lead.id || c.email === lead.email);
          const parsedStatus: ClientStatus = 
            (lead.status === 'contacted' || lead.status === 'negotiation' || lead.status === 'active' || lead.status === 'completed' || lead.status === 'on_hold')
            ? lead.status
            : 'lead';

          return {
            id: lead.id,
            name: lead.full_name || 'Prospecto sin nombre',
            company: lead.company || 'Empresa no especificada',
            email: lead.email,
            status: parsedStatus,
            totalBudget: this.parseBudget(lead.budget_range),
            budgetRange: lead.budget_range || undefined,
            estimatedTimeline: lead.estimated_timeline || undefined,
            projectType: lead.project_type || undefined,
            source: 'DASFusion-hub',
            createdAt: lead.created_at || new Date().toISOString(),
            country: 'No especificado',
            tags: [lead.project_type || 'Nuevo Lead', 'Supabase Sync'].filter(Boolean),
            notes: existing?.notes || (lead.details ? [
              {
                id: 'note-hub',
                author: 'Formulario Hub',
                date: (lead.created_at || new Date().toISOString()).replace('T', ' ').substring(0, 16),
                content: lead.details
              }
            ] : []),
            hubMessage: lead.details || undefined,
            details: lead.details || undefined
          };
        });

        this.saveClients(mappedLeads);
      }
    } catch (err) {
      console.warn('Could not sync leads with Supabase:', err);
    }
  }

  private loadClients(): Client[] {
    const saved = localStorage.getItem(STORAGE_KEY_CLIENTS);
    if (saved) {
      try {
        const parsed: Client[] = JSON.parse(saved);
        // Clean out legacy mock data with cli-0x ids
        const cleaned = parsed.filter(c => !c.id.startsWith('cli-0'));
        return cleaned;
      } catch {
        // fallback
      }
    }
    return [];
  }

  private saveClients(updated: Client[]) {
    this.clients.set(updated);
    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(updated));
  }

  getClientById(id: string): Client | undefined {
    return this.clients().find(c => c.id === id);
  }

  selectClient(id: string | null) {
    this.selectedClientId.set(id);
  }

  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'notes'> & { initialNote?: string }): Promise<Client> {
    const tempId = 'lead-' + Date.now().toString(36);
    const newClient: Client = {
      id: tempId,
      name: clientData.name,
      company: clientData.company,
      email: clientData.email,
      phone: clientData.phone,
      status: clientData.status,
      totalBudget: clientData.totalBudget || 0,
      budgetRange: clientData.budgetRange,
      estimatedTimeline: clientData.estimatedTimeline,
      projectType: clientData.projectType,
      source: clientData.source || 'DASFusion-hub',
      createdAt: new Date().toISOString(),
      country: clientData.country || 'No especificado',
      tags: clientData.tags || ['Nuevo Lead'],
      notes: clientData.initialNote ? [
        {
          id: 'note-1',
          author: 'Admin',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          content: clientData.initialNote
        }
      ] : [],
      hubMessage: clientData.hubMessage,
      details: clientData.details || clientData.initialNote
    };

    const updated = [newClient, ...this.clients()];
    this.saveClients(updated);

    // Persist to Supabase if connected
    try {
      const { data, error } = await this.supabaseService.insertLead({
        full_name: newClient.name,
        company: newClient.company,
        email: newClient.email,
        project_type: newClient.projectType || newClient.tags[0] || 'Software Dev',
        budget_range: newClient.budgetRange || `$${newClient.totalBudget} USD`,
        estimated_timeline: newClient.estimatedTimeline || '1-3 meses',
        details: newClient.details || newClient.notes[0]?.content || null,
        status: newClient.status
      });

      if (data && data.id) {
        // Update local client with real Supabase UUID
        this.updateClient(tempId, { id: data.id });
        newClient.id = data.id;
      }
    } catch (err) {
      console.warn('Offline mode: Saved client locally.');
    }

    return newClient;
  }

  async updateClient(id: string, updates: Partial<Client>) {
    const current = this.clients();
    const updated = current.map(c => {
      if (c.id === id) {
        return { ...c, ...updates, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    this.saveClients(updated);

    // Sync to Supabase if UUID
    if (id && !id.startsWith('lead-') && !id.startsWith('cli-')) {
      const dbUpdates: Partial<SupabaseLeadDb> = {};
      if (updates.name) dbUpdates.full_name = updates.name;
      if (updates.company !== undefined) dbUpdates.company = updates.company;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.details !== undefined) dbUpdates.details = updates.details;
      
      this.supabaseService.updateLead(id, dbUpdates).catch(() => {});
    }
  }

  deleteClient(id: string) {
    const updated = this.clients().filter(c => c.id !== id);
    this.saveClients(updated);
    if (this.selectedClientId() === id) {
      this.selectedClientId.set(null);
    }
  }

  addNote(clientId: string, noteContent: string, author = 'César Admin') {
    const newNote: ClientNote = {
      id: 'note-' + Date.now().toString(36),
      author,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      content: noteContent
    };

    const updated = this.clients().map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          notes: [newNote, ...(c.notes || [])]
        };
      }
      return c;
    });

    this.saveClients(updated);
  }
}
