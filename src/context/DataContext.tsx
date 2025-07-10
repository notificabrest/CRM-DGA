import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Branch, User, Deal, PipelineStatus, Phone, PhoneType, UserRole, CalendarEvent } from '../types';

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
      name: 'Jonny Santos',
      email: 'jonny@brestelecom.com.br',
      phone: '+5511666666666',
      role: UserRole.SALESPERSON,
      status: 'ACTIVE',
      branchIds: ['1'],
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      createdAt: new Date(2023, 0, 4),
      updatedAt: new Date(2023, 0, 4),
    },
    {
      id: '5',
      name: 'Alex Support',
      email: 'suporte@brestelecom.com.br',
      phone: '+5511555555555',
      role: UserRole.ASSISTANT,
      status: 'ACTIVE',
      branchIds: ['1'],
      createdAt: new Date(2023, 0, 5),
      updatedAt: new Date(2023, 0, 5),
    },
    {
      id: '6',
      name: 'Alex Sales',
      email: 'contato@brestelecom.com.br',
      phone: '+5511444444444',
      role: UserRole.SALESPERSON,
      status: 'ACTIVE',
      branchIds: ['1'],
      createdAt: new Date(2023, 0, 6),
      updatedAt: new Date(2023, 0, 6),
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
      statusId: '6', // Closed Won
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
      statusId: '6', // Closed Won
      ownerId: '6', // Alex Sales
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
    {
      id: '3',
      clientId: '1',
      title: 'Consultoria em TI',
      value: 25000,
      probability: 0.8,
      statusId: '6', // Closed Won
      ownerId: '6', // Alex Sales
      history: [
        {
          id: '6',
          dealId: '3',
          fromStatusId: '1',
          toStatusId: '6',
          changedById: '6',
          notes: 'Deal fechado com sucesso',
          changedAt: new Date(2023, 3, 25),
        },
      ],
      createdAt: new Date(2023, 3, 20),
      updatedAt: new Date(2023, 3, 25),
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
  // Note: We'll use a ref to avoid circular dependency issues
  const emailContextRef = React.useRef<any>(null);
  
  // Get email context after component mounts
  React.useEffect(() => {
    try {
      // This will be set by the EmailProvider
      emailContextRef.current = (window as any).__emailContext;
    } catch (error) {
      // Email context not available yet
    }
  }, []);

  const [data, setData] = useState(() => {
    try {
      const savedData = localStorage.getItem('crm-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        return {
          ...parsedData,
          clients: (parsedData.clients || []).map((client: any) => ({
            ...client,
            createdAt: new Date(client.createdAt),
            updatedAt: new Date(client.updatedAt),
            observations: (client.observations || []).map((obs: any) => ({
              ...obs,
              createdAt: new Date(obs.createdAt),
            })),
          })),
          deals: (parsedData.deals || []).map((deal: any) => ({
            ...deal,
            createdAt: new Date(deal.createdAt),
            updatedAt: new Date(deal.updatedAt),
            history: (deal.history || []).map((hist: any) => ({
              ...hist,
              changedAt: new Date(hist.changedAt),
            })),
          })),
          branches: (parsedData.branches || []).map((branch: any) => ({
            ...branch,
            createdAt: new Date(branch.createdAt),
            updatedAt: new Date(branch.updatedAt),
          })),
          users: (parsedData.users || []).map((user: any) => ({
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
          })),
          events: (parsedData.events || []).map((event: any) => ({
            ...event,
            createdAt: new Date(event.createdAt),
            updatedAt: new Date(event.updatedAt),
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
          })),
          pipelineStatuses: parsedData.pipelineStatuses || []
        };
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    return generateMockData();
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm-data', JSON.stringify(data));
      
      // Broadcast data change to other tabs/windows
      const event = new CustomEvent('crm-data-update', { detail: data });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [data]);

  useEffect(() => {
    // Listen for data changes from other tabs/windows
    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail !== data) {
        setData(event.detail);
      }
    };

    window.addEventListener('crm-data-update', handleDataUpdate as EventListener);
    window.addEventListener('storage', (e) => {
      if (e.key === 'crm-data' && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          setData(newData);
        } catch (error) {
          console.error('Error parsing storage data:', error);
        }
      }
    });

    return () => {
      window.removeEventListener('crm-data-update', handleDataUpdate as EventListener);
      window.removeEventListener('storage', handleDataUpdate as EventListener);
    };
  }, []);

  const syncData = () => {
    try {
      const savedData = localStorage.getItem('crm-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
      }
    } catch (error) {
      console.error('Error syncing data:', error);
    }
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
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>): void => {
    setData(prev => ({
      ...prev,
      events: prev.events.map(event =>
        event.id === id
          ? { ...event, ...updates, updatedAt: new Date() }
          : event
      ),
    }));
  };

  const deleteEvent = (id: string): void => {
    setData(prev => ({
      ...prev,
      events: prev.events.filter(event => event.id !== id),
    }));
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
  };

  const updateClient = (id: string, updates: Partial<Client>): void => {
    setData(prev => ({
      ...prev,
      clients: prev.clients.map(client =>
        client.id === id
          ? { ...client, ...updates, updatedAt: new Date() }
          : client
      ),
    }));
  };

  const deleteClient = (id: string): void => {
    setData(prev => ({
      ...prev,
      clients: prev.clients.filter(client => client.id !== id),
    }));
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
  };

  const updateBranch = (id: string, updates: Partial<Branch>): void => {
    setData(prev => ({
      ...prev,
      branches: prev.branches.map(branch =>
        branch.id === id
          ? { ...branch, ...updates, updatedAt: new Date() }
          : branch
      ),
    }));
  };

  const deleteBranch = (id: string): void => {
    setData(prev => ({
      ...prev,
      branches: prev.branches.filter(branch => branch.id !== id),
    }));
  };

  const addUser = (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): void => {
    const now = new Date();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    console.log('📝 Adicionando novo usuário:', newUser);
    setData(prev => ({
      ...prev,
      users: [...prev.users, newUser],
    }));
  };

  const updateUser = (id: string, updates: Partial<User>): void => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === id
          ? { ...user, ...updates, updatedAt: new Date() }
          : user
      ),
    }));
  };

  const deleteUser = (id: string): void => {
    setData(prev => ({
      ...prev,
      users: prev.users.filter(user => user.id !== id),
    }));
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
  };

  const updateDeal = (id: string, updates: Partial<Deal>): void => {
    setData(prev => ({
      ...prev,
      deals: prev.deals.map(deal =>
        deal.id === id
          ? { ...deal, ...updates, updatedAt: new Date() }
          : deal
      ),
    }));
  };

  const updateDealStatus = (id: string, newStatusId: string, userId: string, notes?: string): void => {
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
          
          return {
            ...deal,
            statusId: newStatusId,
            history: [...deal.history, newHistoryEntry],
            updatedAt: now,
          };
        }
        return deal;
      }),
    }));

    // Send email notification if enabled and all required data is available
    const deal = data.deals.find(d => d.id === id);
    const oldStatus = data.pipelineStatuses.find(s => s.id === deal?.statusId);
    const newStatus = data.pipelineStatuses.find(s => s.id === newStatusId);
    const client = data.clients.find(c => c.id === deal?.clientId);
    const user = data.users.find(u => u.id === userId);

    if (emailContextRef.current && deal && oldStatus && newStatus && client && user) {
      emailContextRef.current.sendPipelineNotification({
        dealTitle: deal.title,
        clientName: client.name,
        fromStatus: oldStatus.name,
        toStatus: newStatus.name,
        userName: user.name,
        timestamp: new Date()
      }).catch(error => {
        console.error('Failed to send pipeline notification:', error);
      });
    }
  };

  const deleteDeal = (id: string): void => {
    setData(prev => ({
      ...prev,
      deals: prev.deals.filter(deal => deal.id !== id),
    }));
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
  };

  const deletePipelineStatus = (id: string): void => {
    setData(prev => ({
      ...prev,
      pipelineStatuses: prev.pipelineStatuses.filter(status => status.id !== id),
    }));
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