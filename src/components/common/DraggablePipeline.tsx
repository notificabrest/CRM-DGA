import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus, Edit2, Trash2 } from 'lucide-react';
import { PipelineStatus, Deal, User, Client } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface DealCardProps {
  deal: Deal;
  client: Client;
  owner: User;
  onEdit: (deal: Deal) => void;
  onDelete: (dealId: string) => void;
}

const DealCard: React.FC<DealCardProps> = ({ deal, client, owner, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className="p-3 mb-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-900 truncate">{deal.title}</h3>
        {showActions && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(deal)}
              className="p-1 text-gray-400 hover:text-blue-600"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => onDelete(deal.id)}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 truncate mt-1">{client.name}</p>
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {owner.avatar ? (
              <img src={owner.avatar} alt={owner.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white text-xs">
                {owner.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 ml-1 truncate">{owner.name}</span>
        </div>
        <span className="text-sm font-medium">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(deal.value)}
        </span>
      </div>
    </div>
  );
};

interface DraggablePipelineProps {
  statuses: PipelineStatus[];
  deals: Deal[];
  clients: Client[];
  users: User[];
  onEditDeal: (deal: Deal) => void;
}

const DraggablePipeline: React.FC<DraggablePipelineProps> = ({
  statuses,
  deals,
  clients,
  users,
  onEditDeal,
}) => {
  const { updateDealStatus, deleteDeal } = useData();
  const { user } = useAuth();

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Update deal status
    if (user) {
      updateDealStatus(draggableId, destination.droppableId, user.id);
    }
  };

  const handleDeleteDeal = (dealId: string) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      deleteDeal(dealId);
    }
  };

  const getDealsForStatus = (statusId: string) => {
    return deals
      .filter(deal => deal.statusId === statusId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mt-4 pb-8 overflow-x-auto">
        {statuses.map(status => (
          <div
            key={status.id}
            className="min-w-[280px] flex flex-col bg-gray-50 rounded-lg shadow-sm"
          >
            <div
              className="p-3 rounded-t-lg flex justify-between items-center"
              style={{ backgroundColor: `${status.color}20` }}
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: status.color }}
                ></div>
                <h3 className="font-medium ml-2" style={{ color: status.color }}>
                  {status.name}
                </h3>
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {getDealsForStatus(status.id).length}
              </span>
            </div>
            <Droppable droppableId={status.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="p-2 flex-1 min-h-[200px]"
                >
                  {getDealsForStatus(status.id).map((deal, index) => {
                    const client = clients.find(c => c.id === deal.clientId) || clients[0];
                    const owner = users.find(u => u.id === deal.ownerId) || users[0];
                    
                    return (
                      <Draggable key={deal.id} draggableId={deal.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <DealCard
                              deal={deal}
                              client={client}
                              owner={owner}
                              onEdit={onEditDeal}
                              onDelete={handleDeleteDeal}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default DraggablePipeline;