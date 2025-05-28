import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Client, Branch, User, Deal, PipelineStatus, Phone, UserRole, CalendarEvent } from '../types';

interface DataContextType {
  clients: Client[];
  branches: Branch[];
  users: User[];
  deals: Deal[];
  pipelineStatuses: PipelineStatus[];
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClientByPhone: (phoneNumber: string) => Promise<Client | undefined>;
  addBranch: (branch: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBranch: (id: string, updates: Partial<Branch>) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addDeal: (deal: Omit<Deal, 'id' | 'history' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>;
  updateDealStatus: (id: string, newStatusId: string, userId: string, notes?: string) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  addPipelineStatus: (status: Omit<PipelineStatus, 'id'>) => Promise<void>;
  updatePipelineStatus: (id: string, updates: Partial<PipelineStatus>) => Promise<void>;
  deletePipelineStatus: (id: string) => Promise<void>;
  syncData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<{
    clients: Client[];
    branches: Branch[];
    users: User[];
    deals: Deal[];
    pipelineStatuses: PipelineStatus[];
    events: CalendarEvent[];
  }>({
    clients: [],
    branches: [],
    users: [],
    deals: [],
    pipelineStatuses: [],
    events: []
  });

  const fetchAllData = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
      if (usersError) throw usersError;

      // Fetch branches
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*');
      if (branchesError) throw branchesError;

      // Fetch pipeline statuses
      const { data: statusesData, error: statusesError } = await supabase
        .from('pipeline_statuses')
        .select('*');
      if (statusesError) throw statusesError;

      // Fetch clients and their related data
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select(`
          *,
          phones:client_phones(*),
          observations:client_observations(*)
        `);
      if (clientsError) throw clientsError;

      // Fetch deals and their history
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select(`
          *,
          history:deal_history(*)
        `);
      if (dealsError) throw dealsError;

      // Fetch calendar events
      const { data: eventsData, error: eventsError } = await supabase
        .from('calendar_events')
        .select('*');
      if (eventsError) throw eventsError;

      // Transform data to match our types
      const transformedData = {
        users: usersData.map(user => ({
          ...user,
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.updated_at),
          branchIds: user.branch_ids || []
        })),
        branches: branchesData.map(branch => ({
          ...branch,
          createdAt: new Date(branch.created_at),
          updatedAt: new Date(branch.updated_at),
          managerId: branch.manager_id
        })),
        pipelineStatuses: statusesData.map(status => ({
          ...status,
          orderIndex: status.order_index,
          isDefault: status.is_default
        })),
        clients: clientsData.map(client => ({
          ...client,
          createdAt: new Date(client.created_at),
          updatedAt: new Date(client.updated_at),
          branchId: client.branch_id,
          ownerId: client.owner_id,
          phones: client.phones.map(phone => ({
            ...phone,
            isPrimary: phone.is_primary
          })),
          observations: client.observations.map(obs => ({
            ...obs,
            createdAt: new Date(obs.created_at)
          }))
        })),
        deals: dealsData.map(deal => ({
          ...deal,
          createdAt: new Date(deal.created_at),
          updatedAt: new Date(deal.updated_at),
          clientId: deal.client_id,
          statusId: deal.status_id,
          ownerId: deal.owner_id,
          history: deal.history.map(hist => ({
            ...hist,
            dealId: hist.deal_id,
            fromStatusId: hist.from_status_id,
            toStatusId: hist.to_status_id,
            changedById: hist.changed_by_id,
            changedAt: new Date(hist.changed_at)
          }))
        })),
        events: eventsData.map(event => ({
          ...event,
          createdAt: new Date(event.created_at),
          updatedAt: new Date(event.updated_at),
          startDate: new Date(event.start_date),
          endDate: new Date(event.end_date),
          allDay: event.all_day,
          clientId: event.client_id,
          dealId: event.deal_id,
          ownerId: event.owner_id,
          reminderMinutes: event.reminder_minutes
        }))
      };

      setData(transformedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Subscribe to realtime changes
    const clientsSubscription = supabase
      .channel('clients-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        fetchAllData();
      })
      .subscribe();

    const dealsSubscription = supabase
      .channel('deals-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => {
        fetchAllData();
      })
      .subscribe();

    const eventsSubscription = supabase
      .channel('events-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, () => {
        fetchAllData();
      })
      .subscribe();

    return () => {
      clientsSubscription.unsubscribe();
      dealsSubscription.unsubscribe();
      eventsSubscription.unsubscribe();
    };
  }, []);

  const addEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { error } = await supabase.from('calendar_events').insert({
      title: event.title,
      description: event.description,
      type: event.type,
      priority: event.priority,
      status: event.status,
      start_date: event.startDate.toISOString(),
      end_date: event.endDate.toISOString(),
      all_day: event.allDay,
      location: event.location,
      attendees: event.attendees,
      client_id: event.clientId,
      deal_id: event.dealId,
      owner_id: event.ownerId,
      reminder_minutes: event.reminderMinutes,
      recurrence: event.recurrence
    });

    if (error) throw error;
    await fetchAllData();
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const { error } = await supabase
      .from('calendar_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    await fetchAllData();
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchAllData();
  };

  const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        email: client.email,
        company: client.company,
        position: client.position,
        department: client.department,
        branch_id: client.branchId,
        owner_id: client.ownerId,
        status: client.status,
        tags: client.tags,
        custom_fields: client.customFields
      })
      .select()
      .single();

    if (clientError) throw clientError;

    // Add phones
    for (const phone of client.phones) {
      const { error: phoneError } = await supabase
        .from('client_phones')
        .insert({
          client_id: newClient.id,
          type: phone.type,
          number: phone.number,
          is_primary: phone.isPrimary
        });

      if (phoneError) throw phoneError;
    }

    // Add observations
    for (const observation of client.observations) {
      const { error: obsError } = await supabase
        .from('client_observations')
        .insert({
          client_id: newClient.id,
          user_id: observation.userId,
          text: observation.text
        });

      if (obsError) throw obsError;
    }

    await fetchAllData();
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const { error: clientError } = await supabase
      .from('clients')
      .update({
        name: updates.name,
        email: updates.email,
        company: updates.company,
        position: updates.position,
        department: updates.department,
        branch_id: updates.branchId,
        owner_id: updates.ownerId,
        status: updates.status,
        tags: updates.tags,
        custom_fields: updates.customFields,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (clientError) throw clientError;

    if (updates.phones) {
      // Delete existing phones
      await supabase
        .from('client_phones')
        .delete()
        .eq('client_id', id);

      // Add new phones
      for (const phone of updates.phones) {
        await supabase
          .from('client_phones')
          .insert({
            client_id: id,
            type: phone.type,
            number: phone.number,
            is_primary: phone.isPrimary
          });
      }
    }

    if (updates.observations) {
      // Add new observations (we don't update existing ones)
      for (const observation of updates.observations) {
        if (!observation.id) {
          await supabase
            .from('client_observations')
            .insert({
              client_id: id,
              user_id: observation.userId,
              text: observation.text
            });
        }
      }
    }

    await fetchAllData();
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchAllData();
  };

  const getClientByPhone = async (phoneNumber: string): Promise<Client | undefined> => {
    const { data, error } = await supabase
      .from('client_phones')
      .select('client_id')
      .eq('number', phoneNumber)
      .single();

    if (error) return undefined;

    if (data) {
      const client = data.clients.find(c => c.id === data.client_id);
      return client;
    }

    return undefined;
  };

  const addBranch = async (branch: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { error } = await supabase
      .from('branches')
      .insert({
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        manager_id: branch.managerId || null, // Convert empty string to null
        status: branch.status
      });

    if (error) throw error;
    await fetchAllData();
  };

  const updateBranch = async (id: string, updates: Partial<Branch>) => {
    const { error } = await supabase
      .from('branches')
      .update({
        ...updates,
        manager_id: updates.managerId || null, // Convert empty string to null
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    await fetchAllData();
  };

  const deleteBranch = async (id: string) => {
    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchAllData();
  };

  const addUser = async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { error } = await supabase
      .from('users')
      .insert({
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        phone: user.phone,
        avatar: user.avatar,
        branch_ids: user.branchIds
      });

    if (error) throw error;
    await fetchAllData();
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        branch_ids: updates.branchIds,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    await fetchAllData();
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchAllData();
  };

  const addDeal = async (deal: Omit<Deal, 'id' | 'history' | 'createdAt' | 'updatedAt'>) => {
    const { data: newDeal, error: dealError } = await supabase
      .from('deals')
      .insert({
        client_id: deal.clientId,
        title: deal.title,
        value: deal.value,
        probability: deal.probability,
        status_id: deal.statusId,
        owner_id: deal.ownerId
      })
      .select()
      .single();

    if (dealError) throw dealError;

    // Add initial history entry
    const { error: historyError } = await supabase
      .from('deal_history')
      .insert({
        deal_id: newDeal.id,
        from_status_id: null,
        to_status_id: deal.statusId,
        changed_by_id: deal.ownerId
      });

    if (historyError) throw historyError;
    await fetchAllData();
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    const { error } = await supabase
      .from('deals')
      .update({
        ...updates,
        client_id: updates.clientId,
        status_id: updates.statusId,
        owner_id: updates.ownerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    await fetchAllData();
  };

  const updateDealStatus = async (id: string, newStatusId: string, userId: string, notes?: string) => {
    const deal = data.deals.find(d => d.id === id);
    if (!deal) throw new Error('Deal not found');

    const { error: dealError } = await supabase
      .from('deals')
      .update({
        status_id: newStatusId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (dealError) throw dealError;

    const { error: historyError } = await supabase
      .from('deal_history')
      .insert({
        deal_id: id,
        from_status_id: deal.statusId,
        to_status_id: newStatusId,
        changed_by_id: userId,
        notes
      });

    if (historyError) throw historyError;
    await fetchAllData();
  };

  const deleteDeal = async (id: string) => {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchAllData();
  };

  const addPipelineStatus = async (status: Omit<PipelineStatus, 'id'>) => {
    const { error } = await supabase
      .from('pipeline_statuses')
      .insert({
        name: status.name,
        color: status.color,
        order_index: status.orderIndex,
        is_default: status.isDefault
      });

    if (error) throw error;
    await fetchAllData();
  };

  const updatePipelineStatus = async (id: string, updates: Partial<PipelineStatus>) => {
    const { error } = await supabase
      .from('pipeline_statuses')
      .update({
        ...updates,
        order_index: updates.orderIndex,
        is_default: updates.isDefault,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    await fetchAllData();
  };

  const deletePipelineStatus = async (id: string) => {
    const { error } = await supabase
      .from('pipeline_statuses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchAllData();
  };

  const syncData = async () => {
    await fetchAllData();
  };

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