export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          status: string
          phone: string | null
          avatar: string | null
          branch_ids: string[] | null
          created_at: string | null
          updated_at: string | null
          password: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: string
          status?: string
          phone?: string | null
          avatar?: string | null
          branch_ids?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          password?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          status?: string
          phone?: string | null
          avatar?: string | null
          branch_ids?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          password?: string
        }
      }
      branches: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          manager_id: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          manager_id?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          manager_id?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string
          company: string | null
          position: string | null
          department: string | null
          branch_id: string | null
          owner_id: string | null
          status: string
          tags: string[] | null
          custom_fields: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          company?: string | null
          position?: string | null
          department?: string | null
          branch_id?: string | null
          owner_id?: string | null
          status?: string
          tags?: string[] | null
          custom_fields?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          company?: string | null
          position?: string | null
          department?: string | null
          branch_id?: string | null
          owner_id?: string | null
          status?: string
          tags?: string[] | null
          custom_fields?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      client_phones: {
        Row: {
          id: string
          client_id: string | null
          type: string
          number: string
          is_primary: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          type: string
          number: string
          is_primary?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          type?: string
          number?: string
          is_primary?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      client_observations: {
        Row: {
          id: string
          client_id: string | null
          user_id: string | null
          text: string
          created_at: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          user_id?: string | null
          text: string
          created_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          user_id?: string | null
          text?: string
          created_at?: string | null
        }
      }
      pipeline_statuses: {
        Row: {
          id: string
          name: string
          color: string
          order_index: number
          is_default: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          color: string
          order_index: number
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          color?: string
          order_index?: number
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      deals: {
        Row: {
          id: string
          client_id: string | null
          title: string
          value: number
          probability: number
          status_id: string | null
          owner_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          title: string
          value: number
          probability: number
          status_id?: string | null
          owner_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          title?: string
          value?: number
          probability?: number
          status_id?: string | null
          owner_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      deal_history: {
        Row: {
          id: string
          deal_id: string | null
          from_status_id: string | null
          to_status_id: string | null
          changed_by_id: string | null
          notes: string | null
          changed_at: string | null
        }
        Insert: {
          id?: string
          deal_id?: string | null
          from_status_id?: string | null
          to_status_id?: string | null
          changed_by_id?: string | null
          notes?: string | null
          changed_at?: string | null
        }
        Update: {
          id?: string
          deal_id?: string | null
          from_status_id?: string | null
          to_status_id?: string | null
          changed_by_id?: string | null
          notes?: string | null
          changed_at?: string | null
        }
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          description: string | null
          type: string
          priority: string
          status: string
          start_date: string
          end_date: string
          all_day: boolean | null
          location: string | null
          attendees: string[] | null
          client_id: string | null
          deal_id: string | null
          owner_id: string | null
          reminder_minutes: number | null
          recurrence: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: string
          priority: string
          status: string
          start_date: string
          end_date: string
          all_day?: boolean | null
          location?: string | null
          attendees?: string[] | null
          client_id?: string | null
          deal_id?: string | null
          owner_id?: string | null
          reminder_minutes?: number | null
          recurrence?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: string
          priority?: string
          status?: string
          start_date?: string
          end_date?: string
          all_day?: boolean | null
          location?: string | null
          attendees?: string[] | null
          client_id?: string | null
          deal_id?: string | null
          owner_id?: string | null
          reminder_minutes?: number | null
          recurrence?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}