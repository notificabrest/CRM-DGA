import { supabase } from './supabase';
import { useData } from '../context/DataContext';

export async function migrateLocalDataToSupabase() {
  const { users, branches, clients, pipelineStatuses, deals, events } = useData();

  try {
    // Migrate users
    for (const user of users) {
      const { error: userError } = await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        phone: user.phone,
        avatar: user.avatar,
        branch_ids: user.branchIds,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
        password: 'CRM@123' // Default password
      });
      
      if (userError) throw userError;
    }

    // Migrate branches
    for (const branch of branches) {
      const { error: branchError } = await supabase.from('branches').upsert({
        id: branch.id,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        manager_id: branch.managerId,
        status: branch.status,
        created_at: branch.createdAt.toISOString(),
        updated_at: branch.updatedAt.toISOString()
      });
      
      if (branchError) throw branchError;
    }

    // Migrate pipeline statuses
    for (const status of pipelineStatuses) {
      const { error: statusError } = await supabase.from('pipeline_statuses').upsert({
        id: status.id,
        name: status.name,
        color: status.color,
        order_index: status.orderIndex,
        is_default: status.isDefault
      });
      
      if (statusError) throw statusError;
    }

    // Migrate clients and their related data
    for (const client of clients) {
      // Insert client
      const { error: clientError } = await supabase.from('clients').upsert({
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company,
        position: client.position,
        department: client.department,
        branch_id: client.branchId,
        owner_id: client.ownerId,
        status: client.status,
        tags: client.tags,
        custom_fields: client.customFields,
        created_at: client.createdAt.toISOString(),
        updated_at: client.updatedAt.toISOString()
      });
      
      if (clientError) throw clientError;

      // Insert client phones
      for (const phone of client.phones) {
        const { error: phoneError } = await supabase.from('client_phones').upsert({
          id: phone.id,
          client_id: client.id,
          type: phone.type,
          number: phone.number,
          is_primary: phone.isPrimary
        });
        
        if (phoneError) throw phoneError;
      }

      // Insert client observations
      for (const observation of client.observations) {
        const { error: obsError } = await supabase.from('client_observations').upsert({
          id: observation.id,
          client_id: client.id,
          user_id: observation.userId,
          text: observation.text,
          created_at: observation.createdAt.toISOString()
        });
        
        if (obsError) throw obsError;
      }
    }

    // Migrate deals and their history
    for (const deal of deals) {
      const { error: dealError } = await supabase.from('deals').upsert({
        id: deal.id,
        client_id: deal.clientId,
        title: deal.title,
        value: deal.value,
        probability: deal.probability,
        status_id: deal.statusId,
        owner_id: deal.ownerId,
        created_at: deal.createdAt.toISOString(),
        updated_at: deal.updatedAt.toISOString()
      });
      
      if (dealError) throw dealError;

      // Insert deal history
      for (const history of deal.history) {
        const { error: historyError } = await supabase.from('deal_history').upsert({
          id: history.id,
          deal_id: deal.id,
          from_status_id: history.fromStatusId,
          to_status_id: history.toStatusId,
          changed_by_id: history.changedById,
          notes: history.notes,
          changed_at: history.changedAt.toISOString()
        });
        
        if (historyError) throw historyError;
      }
    }

    // Migrate calendar events
    for (const event of events) {
      const { error: eventError } = await supabase.from('calendar_events').upsert({
        id: event.id,
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
        recurrence: event.recurrence,
        created_at: event.createdAt.toISOString(),
        updated_at: event.updatedAt.toISOString()
      });
      
      if (eventError) throw eventError;
    }

    return { success: true, message: 'Data migration completed successfully' };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, message: error.message };
  }
}