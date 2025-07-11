import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Branch, User, Deal, PipelineStatus, Phone, PhoneType, UserRole, CalendarEvent } from '../types';
import { supabase } from '../lib/supabase';

interface DataContextType {
  clients: Client[];
  branches: Branch[];
  users: User[];
  deals: Deal[];
  pipelineStatuses: PipelineStatus[];
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientByPhone: (phoneNumber: string) => Client | undefined;
  addBranch: (branch: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addDeal: (deal: Omit<Deal, 'id' | 'history' | 'createdAt' | 'updatedAt'>) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  updateDealStatus: (id: string, newStatusId: string, userId: string, notes?: string) => void;
  deleteDeal: (id: string) => void;
  addPipelineStatus: (status: Omit<PipelineStatus, 'id'>) => void;
  updatePipelineStatus: (id: string, updates: Partial<PipelineStatus>) => void;
  deletePipelineStatus: (id: string) => void;
  syncData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [data, setData] = useState({
    clients: [],
    branches: [],
    users: [],
    deals: [],
    pipelineStatuses: [],
    events: []
  });
  const [loading, setLoading] = useState(true);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Conectado - sincronizando dados...');
      setIsOnline(true);
      loadDataFromSupabase();
    };
    
    const handleOffline = () => {
      console.log('📱 Offline - usando dados locais');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data from Supabase
  const loadDataFromSupabase = async () => {
    if (!supabase) {
      console.error('❌ Supabase não configurado');
      setLoading(false);
      return;
    }

    try {
      console.log('☁️ Carregando dados do Supabase...');
      
      // Load all data in parallel
      const [
        { data: clients, error: clientsError },
        { data: branches, error: branchesError },
        { data: users, error: usersError },
        { data: deals, error: dealsError },
        { data: pipelineStatuses, error: statusesError },
        { data: events, error: eventsError }
      ] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('branches').select('*'),
        supabase.from('users').select('*'),
        supabase.from('deals').select('*'),
        supabase.from('pipeline_statuses').select('*'),
        supabase.from('calendar_events').select('*')
      ]);

      if (clientsError) console.error('Erro ao carregar clientes:', clientsError);
      if (branchesError) console.error('Erro ao carregar filiais:', branchesError);
      if (usersError) console.error('Erro ao carregar usuários:', usersError);
      if (dealsError) console.error('Erro ao carregar negócios:', dealsError);
      if (statusesError) console.error('Erro ao carregar status:', statusesError);
      if (eventsError) console.error('Erro ao carregar eventos:', eventsError);

      setData({
        clients: clients || [],
        branches: branches || [],
        users: users || [],
        deals: deals || [],
        pipelineStatuses: pipelineStatuses || [],
        events: events || []
      });

      console.log('✅ Dados carregados do Supabase com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadDataFromSupabase();
  }, []);

  // Save data to Supabase
  const saveToSupabase = async (table: string, data: any, operation: 'insert' | 'update' | 'delete', id?: string) => {
    if (!supabase) {
      console.error('❌ Supabase não configurado');
      return;
    }

    try {
      let result;
      
      switch (operation) {
        case 'insert':
          result = await supabase.from(table).insert(data);
          break;
        case 'update':
          result = await supabase.from(table).update(data).eq('id', id);
          break;
        case 'delete':
          result = await supabase.from(table).delete().eq('id', id);
          break;
      }

      if (result?.error) {
        console.error(`Erro ao ${operation} em ${table}:`, result.error);
        throw result.error;
      }

      console.log(`✅ ${operation} realizado em ${table} com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao ${operation} em ${table}:`, error);
      throw error;
    }
  };

  const syncData = () => {
    loadDataFromSupabase();
  };

  const addEvent = (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): void => {
    const now = new Date();
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    
    setData(prev => ({
      ...prev,
      events: [...prev.events, newEvent],
    }));
    
    // Save to Supabase
    saveToSupabase('calendar_events', newEvent, 'insert');
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>): void => {
    const updatedEvent = { ...updates, updated_at: new Date().toISOString() };
    
    setData(prev => ({
      ...prev,
      events: prev.events.map(event =>
        event.id === id
          ? { ...event, ...updates, updatedAt: new Date() }
          : event
      ),
    }));
    
    // Save to Supabase
    saveToSupabase('calendar_events', updatedEvent, 'update', id);
  };

  const deleteEvent = (id: string): void => {
    setData(prev => ({
      ...prev,
      events: prev.events.filter(event => event.id !== id),
    }));
    
    // Save to Supabase
    saveToSupabase('calendar_events', null, 'delete', id);
  };

  const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): void => {
    const now = new Date();
    const newClient: Client = {
      ...client,
      id: `client-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    
    setData(prev => ({
      ...prev,
      clients: [...prev.clients, newClient],
    }));
    
    // Save to Supabase
    saveToSupabase('clients', newClient, 'insert');
  };

  const updateClient = (id: string, updates: Partial<Client>): void => {
    const updatedClient = { ...updates, updated_at: new Date().toISOString() };
    
    setData(prev => ({
      ...prev,
      clients: prev.clients.map(client =>
        client.id === id
          ? { ...client, ...updates, updatedAt: new Date() }
          : client
      ),
    }));
    
    // Save to Supabase
    saveToSupabase('clients', updatedClient, 'update', id);
  };

  const deleteClient = (id: string): void => {
    setData(prev => ({
      ...prev,
      clients: prev.clients.filter(client => client.id !== id),
    }));
    
    // Save to Supabase
    saveToSupabase('clients', null, 'delete', id);
  };

  const getClientByPhone = (phoneNumber: string): Client | undefined => {
    return data.clients.find(client =>
      client.phones.some(phone =>
        phone.number.replace(/\D/g, '') === phoneNumber.replace(/\D/g, '')
      )
    );
  };

  const addBranch = (branch: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): void => {
    const now = new Date();
    const newBranch: Branch = {
      ...branch,
      id: `branch-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    
    setData(prev => ({
      ...prev,
      branches: [...prev.branches, newBranch],
    }));
    
    // Save to Supabase
    saveToSupabase('branches', newBranch, 'insert');
  };

  const updateBranch = (id: string, updates: Partial<Branch>): void => {
    const updatedBranch = { ...updates, updated_at: new Date().toISOString() };
    
    setData(prev => ({
      ...prev,
      branches: prev.branches.map(branch =>
        branch.id === id
          ? { ...branch, ...updates, updatedAt: new Date() }
          : branch
      ),
    }));
    
    // Save to Supabase
    saveToSupabase('branches', updatedBranch, 'update', id);
  };

  const deleteBranch = (id: string): void => {
    setData(prev => ({
      ...prev,
      branches: prev.branches.filter(branch => branch.id !== id),
    }));
    
    // Save to Supabase
    saveToSupabase('branches', null, 'delete', id);
  };

  const addUser = (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): void => {
    const now = new Date();
    
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    
    setData(prev => ({
      ...prev,
      users: [...prev.users, newUser],
    }));
    
    // Save to Supabase
    saveToSupabase('users', newUser, 'insert');
  };

  const updateUser = (id: string, updates: Partial<User>): void => {
    const updatedUser = { ...updates, updated_at: new Date().toISOString() };
    
    setData(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === id
          ? { ...user, ...updates, updatedAt: new Date() }
          : user
      ),
    }));
    
    // Save to Supabase
    saveToSupabase('users', updatedUser, 'update', id);
  };

  const deleteUser = (id: string): void => {
    setData(prev => ({
      ...prev,
      users: prev.users.filter(user => user.id !== id),
    }));
    
    // Save to Supabase
    saveToSupabase('users', null, 'delete', id);
  };

  const addDeal = (deal: Omit<Deal, 'id' | 'history' | 'createdAt' | 'updatedAt'>): void => {
    const now = new Date();
    const newDeal: Deal = {
      ...deal,
      id: `deal-${Date.now()}`,
      history: [
        {
          id: `history-${Date.now()}`,
          dealId: `deal-${Date.now()}`,
          fromStatusId: '',
          toStatusId: deal.statusId,
          changedById: deal.ownerId,
          changedAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    
    setData(prev => ({
      ...prev,
      deals: [...prev.deals, newDeal],
    }));
    
    // Save to Supabase
    saveToSupabase('deals', newDeal, 'insert');
  };

  const updateDeal = (id: string, updates: Partial<Deal>): void => {
    const updatedDeal = { ...updates, updated_at: new Date().toISOString() };
    
    setData(prev => ({
      ...prev,
      deals: prev.deals.map(deal =>
        deal.id === id
          ? { ...deal, ...updates, updatedAt: new Date() }
          : deal
      ),
    }));
    
    // Save to Supabase
    saveToSupabase('deals', updatedDeal, 'update', id);
  };

  const updateDealStatus = (id: string, newStatusId: string, userId: string, notes?: string): void => {
    let updatedDeal: Deal | null = null;
    
    setData(prev => ({
      ...prev,
      deals: prev.deals.map(deal => {
        if (deal.id === id) {
          const now = new Date();
          const newHistoryEntry = {
            id: `history-${Date.now()}`,
            dealId: id,
            fromStatusId: deal.statusId,
            toStatusId: newStatusId,
            changedById: userId,
            notes,
            changedAt: now,
          };
          
          updatedDeal = {
            ...deal,
            statusId: newStatusId,
            history: [...deal.history, newHistoryEntry],
            updatedAt: now,
          };
          
          return updatedDeal;
        }
        return deal;
      }),
    }));

    // Save to Supabase
    if (updatedDeal) {
      saveToSupabase('deals', { 
        status_id: newStatusId, 
        updated_at: new Date().toISOString() 
      }, 'update', id);
    }
  };

  const deleteDeal = (id: string): void => {
    setData(prev => ({
      ...prev,
      deals: prev.deals.filter(deal => deal.id !== id),
    }));
    
    // Save to Supabase
    saveToSupabase('deals', null, 'delete', id);
  };

  const addPipelineStatus = (status: Omit<PipelineStatus, 'id'>): void => {
    const newStatus: PipelineStatus = {
      ...status,
      id: `status-${Date.now()}`,
    };
    
    setData(prev => ({
      ...prev,
      pipelineStatuses: [...prev.pipelineStatuses, newStatus],
    }));
    
    // Save to Supabase
    saveToSupabase('pipeline_statuses', newStatus, 'insert');
  };

  const updatePipelineStatus = (id: string, updates: Partial<PipelineStatus>): void => {
    setData(prev => ({
      ...prev,
      pipelineStatuses: prev.pipelineStatuses.map(status =>
        status.id === id
          ? { ...status, ...updates }
          : status
      ),
    }));
    
    // Save to Supabase
    saveToSupabase('pipeline_statuses', updates, 'update', id);
  };

  const deletePipelineStatus = (id: string): void => {
    setData(prev => ({
      ...prev,
      pipelineStatuses: prev.pipelineStatuses.filter(status => status.id !== id),
    }));
    
    // Save to Supabase
    saveToSupabase('pipeline_statuses', null, 'delete', id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do Supabase...</p>
        </div>
      </div>
    );
  }

  const value = {
    ...data,
    addEvent,
    updateEvent,
    deleteEvent,
    addClient,
    updateClient,
    deleteClient,
    getClientByPhone,
    addBranch,
    updateBranch,
    deleteBranch,
    addUser,
    updateUser,
    deleteUser,
    addDeal,
    updateDeal,
    updateDealStatus,
    deleteDeal,
    addPipelineStatus,
    updatePipelineStatus,
    deletePipelineStatus,
    syncData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};