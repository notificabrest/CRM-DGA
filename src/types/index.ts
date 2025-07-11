// Types for the CRM-DGA application

// User roles
export enum UserRole {
  ADMIN = 'ADMIN',
  DIRECTOR = 'DIRECTOR',
  MANAGER = 'MANAGER',
  SALESPERSON = 'SALESPERSON',
  ASSISTANT = 'ASSISTANT'
}

// User status
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  branchIds: string[];
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Branch/office interface
export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

// Phone types
export enum PhoneType {
  MAIN = 'MAIN',
  MOBILE = 'MOBILE',
  WHATSAPP = 'WHATSAPP',
  WORK = 'WORK',
  OTHER = 'OTHER'
}

// Phone interface
export interface Phone {
  id: string;
  type: PhoneType;
  number: string;
  isPrimary: boolean;
}

// Client interface
export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  position?: string;
  department?: string;
  phones: Phone[];
  address?: Address;
  branchId: string;
  ownerId: string;
  status: 'ACTIVE' | 'INACTIVE';
  tags: string[];
  observations: Observation[];
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Address interface
export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

// Observation interface
export interface Observation {
  id: string;
  userId: string;
  text: string;
  createdAt: Date;
}

// Pipeline status interface
export interface PipelineStatus {
  id: string;
  name: string;
  color: string;
  orderIndex: number;
  branchId?: string;
  isDefault: boolean;
}

// Deal interface
export interface Deal {
  id: string;
  clientId: string;
  title: string;
  value: number;
  probability: number;
  statusId: string;
  ownerId: string;
  history: DealHistory[];
  createdAt: Date;
  updatedAt: Date;
}

// Deal history interface
export interface DealHistory {
  id: string;
  dealId: string;
  fromStatusId: string;
  toStatusId: string;
  changedById: string;
  notes?: string;
  changedAt: Date;
}

// Calendar Event Types
export enum EventType {
  MEETING = 'MEETING',
  TASK = 'TASK',
  REMINDER = 'REMINDER',
  DEAL = 'DEAL',
  OTHER = 'OTHER'
}

// Event Priority
export enum EventPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Event Status
export enum EventStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Calendar Event interface
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  priority: EventPriority;
  status: EventStatus;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  attendees: string[]; // User IDs
  clientId?: string;
  dealId?: string;
  ownerId: string;
  reminderMinutes: number;
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Theme interface
export interface Theme {
  name: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  secondaryColor: string;
  accentColor?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  logo?: string;
  headerName?: string;
  sidebarName?: string;
}

// Notification interface
export interface Notification {
  id: string;
  userId: string;
  type: 'STATUS_CHANGE' | 'NEW_LEAD' | 'TASK_DUE' | 'MEETING' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}