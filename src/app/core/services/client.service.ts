import { Injectable, computed, signal } from '@angular/core';
import { Client, ClientNote, ClientStatus } from '../models/client.model';
import { INITIAL_CLIENTS } from './mock-data';

const STORAGE_KEY_CLIENTS = 'df_crm_clients';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
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
    this.clients().filter(c => c.status === 'lead' || c.status === 'negotiation').length
  );

  readonly totalClientBudget = computed(() => 
    this.clients().reduce((acc, curr) => acc + (curr.totalBudget || 0), 0)
  );

  private loadClients(): Client[] {
    const saved = localStorage.getItem(STORAGE_KEY_CLIENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_CLIENTS;
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

  createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'notes'> & { initialNote?: string }): Client {
    const newClient: Client = {
      id: 'cli-' + Date.now().toString(36),
      name: clientData.name,
      company: clientData.company,
      email: clientData.email,
      phone: clientData.phone,
      status: clientData.status,
      totalBudget: clientData.totalBudget || 0,
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
      hubMessage: clientData.hubMessage
    };

    const updated = [newClient, ...this.clients()];
    this.saveClients(updated);
    return newClient;
  }

  updateClient(id: string, updates: Partial<Client>) {
    const current = this.clients();
    const updated = current.map(c => {
      if (c.id === id) {
        return { ...c, ...updates, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    this.saveClients(updated);
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
