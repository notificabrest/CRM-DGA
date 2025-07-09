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
      className="p-3 mb-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 relative group cursor-pointer"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-900 truncate text-sm">{deal.title}</h3>
        {showActions && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(deal)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => onDelete(deal.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 truncate mt-1">{client.name}</p>
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 overflow-hidden flex-shrink-0">
            {owner.avatar ? (
              <img src={owner.avatar} alt={owner.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
                {owner.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 ml-1 truncate">{owner.name}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-gray-900">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact'
            }).format(deal.value)}
          </span>
          <div className="text-xs text-gray-500">
            {(deal.probability * 100).toFixed(0)}%
          </div>
        </div>
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
      <div className="flex gap-3 sm:gap-4 mt-4 pb-8 overflow-x-auto min-h-[500px]">
        {statuses.map(status => {
          const statusDeals = getDealsForStatus(status.id);
          const totalValue = statusDeals.reduce((sum, deal) => sum + deal.value, 0);
          
          return (
            <div
              key={status.id}
              className="min-w-[280px] sm:min-w-[320px] flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200"
            >
              <div
                className="p-4 rounded-t-xl flex justify-between items-center border-b border-gray-200"
                style={{ 
                  background: `linear-gradient(135deg, ${status.color}15, ${status.color}25)`,
                  borderColor: `${status.color}30`
                }}
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <h3 className="font-semibold ml-3 text-sm truncate" style={{ color: status.color }}>
                    {status.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-700">
                    {statusDeals.length}
                  </span>
                  <div className="text-xs text-gray-500">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      notation: 'compact'
                    }).format(totalValue)}
                  </div>
                </div>
              </div>
              <Droppable droppableId={status.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-3 flex-1 min-h-[400px] transition-colors duration-200 ${
                      snapshot.isDraggingOver 
                        ? 'bg-gradient-to-b from-blue-50 to-blue-100' 
                        : 'bg-transparent'
                    }`}
                  >
                    {statusDeals.map((deal, index) => {
                      const client = clients.find(c => c.id === deal.clientId) || clients[0];
                      const owner = users.find(u => u.id === deal.ownerId) || users[0];
                      
                      return (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`transform transition-all duration-200 ${
                                snapshot.isDragging 
                                  ? 'rotate-3 scale-105 shadow-xl' 
                                  : 'hover:scale-102'
                              }`}
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
                    
                    {statusDeals.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                        <div className="text-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center">
                            <Plus size={16} />
                          </div>
                          Arraste negócios aqui
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default DraggablePipeline;