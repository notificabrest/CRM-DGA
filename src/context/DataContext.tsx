import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, handleError } from '../lib/supabase';
import { Client, Branch, User, Deal, PipelineStatus, Phone, PhoneType, UserRole, CalendarEvent } from '../types';
import { useAuth } from './AuthContext';

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

const generateMockData = () => {
  const branches: Branch[] = [
    {
      id: '1',
      name: 'Headquarters',
      address: 'Av. Paulista, 1000, São Paulo, SP',
      phone: '+551130301000',
      managerId: '3',
      status: 'ACTIVE',
      createdAt: new Date(2023, 0, 15),
      updatedAt: new Date(2023, 0, 15),
    },
    {
      id: '2',
      name: 'Rio Branch',
      address: 'Av. Atlântica, 500, Rio de Janeiro, RJ',
      phone: '+552122223333',
      managerId: undefined,
      status: 'ACTIVE',
      createdAt: new Date(2023, 2, 10),
      updatedAt: new Date(2023, 2, 10),
    },
  ];

  const users: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+5511999999999',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      branchIds: ['1'],
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      createdAt: new Date(2023, 0, 1),
      updatedAt: new Date(2023, 0, 1),
    },
    {
      id: '2',
      name: 'Director User',
      email: 'director@example.com',
      phone: '+5511888888888',
      role: UserRole.DIRECTOR,
      status: 'ACTIVE',
      branchIds: ['1', '2'],
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      createdAt: new Date(2023, 0, 2),
      updatedAt: new Date(2023, 0, 2),
    },
    {
      id: '3',
      name: 'Manager User',
      email: 'manager@example.com',
      phone: '+5511777777777',
      role: UserRole.MANAGER,
      status: 'ACTIVE',
      branchIds: ['1'],
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      createdAt: new Date(2023, 0, 3),
      updatedAt: new Date(2023, 0, 3),
    },
    {
      id: '4',
      name: 'Sales User',
      email: 'sales@example.com',
      phone: '+5511666666666',
      role: UserRole.SALESPERSON,
      status: 'ACTIVE',
      branchIds: ['1'],
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      createdAt: new Date(2023, 0, 4),
      updatedAt: new Date(2023, 0, 4),
    },
  ];

  const pipelineStatuses: PipelineStatus[] = [
    {
      id: '1',
      name: 'New Lead',
      color: '#3B82F6',
      orderIndex: 0,
      isDefault: true,
    },
    {
      id: '2',
      name: 'Initial Contact',
      color: '#8B5CF6',
      orderIndex: 1,
      isDefault: true,
    },
    {
      id: '3',
      name: 'Qualification',
      color: '#EC4899',
      orderIndex: 2,
      isDefault: true,
    },
    {
      id: '4',
      name: 'Proposal',
      color: '#F97316',
      orderIndex: 3,
      isDefault: true,
    },
    {
      id: '5',
      name: 'Negotiation',
      color: '#FBBF24',
      orderIndex: 4,
      isDefault: true,
    },
    {
      id: '6',
      name: 'Closed Won',
      color: '#10B981',
      orderIndex: 5,
      isDefault: true,
    },
    {
      id: '7',
      name: 'Closed Lost',
      color: '#EF4444',
      orderIndex: 6,
      isDefault: true,
    },
  ];

  const clients: Client[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@example.com',
      company: 'ABC Corporation',
      position: 'CEO',
      department: 'Executive',
      phones: [
        {
          id: '1',
          type: PhoneType.MAIN,
          number: '+5511987654321',
          isPrimary: true,
        },
        {
          id: '2',
          type: PhoneType.WHATSAPP,
          number: '+5511987654321',
          isPrimary: false,
        },
      ],
      address: {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Jardim Paulista',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        zipCode: '01452-000',
      },
      branchId: '1',
      ownerId: '4',
      status: 'ACTIVE',
      tags: ['VIP', 'New'],
      observations: [
        {
          id: '1',
          userId: '4',
          text: 'First contact made. Client is interested in our enterprise solution.',
          createdAt: new Date(2023, 3, 15),
        },
      ],
      customFields: {
        preferredContact: 'Email',
        industry: 'Technology',
      },
      createdAt: new Date(2023, 3, 10),
      updatedAt: new Date(2023, 3, 10),
    },
    {
      id: '2',
      name: 'Maria Oliveira',
      email: 'maria.oliveira@example.com',
      company: 'XYZ Industries',
      position: 'CTO',
      department: 'Technology',
      phones: [
        {
          id: '3',
          type: PhoneType.MAIN,
          number: '+5511976543210',
          isPrimary: true,
        },
      ],
      address: {
        street: 'Av. Paulista',
        number: '1000',
        complement: 'Sala 1010',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        zipCode: '01310-000',
      },
      branchId: '1',
      ownerId: '4',
      status: 'ACTIVE',
      tags: ['Enterprise'],
      observations: [
        {
          id: '2',
          userId: '4',
          text: 'Client requested a demo of our premium features.',
          createdAt: new Date(2023, 3, 20),
        },
      ],
      customFields: {
        preferredContact: 'Phone',
        industry: 'Finance',
      },
      createdAt: new Date(2023, 3, 15),
      updatedAt: new Date(2023, 3, 15),
    },
  ];

  const deals: Deal[] = [
    {
      id: '1',
      clientId: '1',
      title: 'Enterprise License Agreement',
      value: 100000,
      probability: 0.7,
      statusId: '4',
      ownerId: '4',
      history: [
        {
          id: '1',
          dealId: '1',
          fromStatusId: '1',
          toStatusId: '2',
          changedById: '4',
          changedAt: new Date(2023, 3, 12),
        },
        {
          id: '2',
          dealId: '1',
          fromStatusId: '2',
          toStatusId: '3',
          changedById: '4',
          changedAt: new Date(2023, 3, 15),
        },
        {
          id: '3',
          dealId: '1',
          fromStatusId: '3',
          toStatusId: '4',
          changedById: '4',
          notes: 'Sent proposal for review',
          changedAt: new Date(2023, 3, 20),
        },
      ],
      createdAt: new Date(2023, 3, 10),
      updatedAt: new Date(2023, 3, 20),
    },
    {
      id: '2',
      clientId: '2',
      title: 'SaaS Subscription - Premium Tier',
      value: 50000,
      probability: 0.5,
      statusId: '3',
      ownerId: '4',
      history: [
        {
          id: '4',
          dealId: '2',
          fromStatusId: '1',
          toStatusId: '2',
          changedById: '4',
          changedAt: new Date(2023, 3, 16),
        },
        {
          id: '5',
          dealId: '2',
          fromStatusId: '2',
          toStatusId: '3',
          changedById: '4',
          notes: 'Scheduled product demo',
          changedAt: new Date(2023, 3, 18),
        },
      ],
      createdAt: new Date(2023, 3, 15),
      updatedAt: new Date(2023, 3, 18),
    },
  ];

  const events: CalendarEvent[] = [];

  return { branches, users, pipelineStatuses, clients, deals, events };
};

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [data, setData] = useState(() => generateMockData());

  useEffect(() => {
    if (authUser) {
      loadData();
    }
  }, [authUser]);

  const loadData = async () => {
    try {
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*');
      if (clientsError) throw clientsError;

      const { data: branches, error: branchesError } = await supabase
        .from('branches')
        .select('*');
      if (branchesError) throw branchesError;

      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('*');
      if (dealsError) throw dealsError;

      setData(prev => ({
        ...prev,
        clients: clients || [],
        branches: branches || [],
        deals: deals || [],
      }));
    } catch (error) {
      handleError(error);
    }
  };

  const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();
      
      if (error) throw error;

      setData(prev => ({
        ...prev,
        clients: [...prev.clients, data],
      }));
    } catch (error) {
      handleError(error);
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      setData(prev => ({
        ...prev,
        clients: prev.clients.map(client =>
          client.id === id ? { ...client, ...data } : client
        ),
      }));
    } catch (error) {
      handleError(error);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      setData(prev => ({
        ...prev,
        clients: prev.clients.filter(client => client.id !== id),
      }));
    } catch (error) {
      handleError(error);
    }
  };

  const value = {
    ...data,
    addClient,
    updateClient,
    deleteClient,
    // ... other methods
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