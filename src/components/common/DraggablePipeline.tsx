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
      className="p-2 sm:p-3 mb-1.5 sm:mb-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 relative group cursor-pointer"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => setShowActions(!showActions)} // Toggle on mobile
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-900 truncate text-xs sm:text-sm pr-1 sm:pr-2 flex-1">{deal.title}</h3>
        <div className={`flex items-center space-x-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(deal);
            }}
            className="p-0.5 sm:p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit2 size={10} className="sm:w-3 sm:h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(deal.id);
            }}
            className="p-0.5 sm:p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={10} className="sm:w-3 sm:h-3" />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 truncate mt-0.5 sm:mt-1">{client.name}</p>
      <div className="flex justify-between items-center mt-1.5 sm:mt-2">
        <div className="flex items-center min-w-0 flex-1">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 overflow-hidden flex-shrink-0">
            {owner.avatar ? (
              <img src={owner.avatar} alt={owner.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
                {owner.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 ml-1 truncate hidden sm:inline">{owner.name}</span>
        </div>
        <div className="text-right ml-1 sm:ml-2 flex-shrink-0">
          <span className="text-xs font-bold text-gray-900 block">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact'
            }).format(deal.value)}
          </span>
          <div className="text-xs text-gray-500 hidden sm:block">
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
    if (window.confirm('Tem certeza que deseja excluir este negócio?')) {
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
      <div className="flex gap-1.5 sm:gap-2 lg:gap-3 mt-2 sm:mt-4 pb-3 sm:pb-4 lg:pb-8 overflow-x-auto min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
        {statuses.map(status => {
          const statusDeals = getDealsForStatus(status.id);
          const totalValue = statusDeals.reduce((sum, deal) => sum + deal.value, 0);
          
          return (
            <div
              key={status.id}
              className="min-w-[200px] sm:min-w-[240px] lg:min-w-[280px] flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg shadow-sm border border-gray-200"
            >
              <div
                className="p-2 sm:p-3 lg:p-4 rounded-t-lg flex justify-between items-center border-b border-gray-200"
                style={{ 
                  background: `linear-gradient(135deg, ${status.color}15, ${status.color}25)`,
                  borderColor: `${status.color}30`
                }}
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full shadow-sm flex-shrink-0"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <h3 className="font-medium ml-1.5 sm:ml-2 lg:ml-3 text-xs sm:text-sm truncate" style={{ color: status.color }}>
                    {status.name}
                  </h3>
                </div>
                <div className="text-right ml-1 sm:ml-2 flex-shrink-0">
                  <span className="text-xs font-bold text-gray-700 block">
                    {statusDeals.length}
                  </span>
                  <div className="text-xs text-gray-500 hidden sm:block">
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
                    className={`p-1.5 sm:p-2 lg:p-3 flex-1 min-h-[250px] sm:min-h-[300px] lg:min-h-[400px] transition-colors duration-200 ${
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
                                  ? 'rotate-1 scale-105 shadow-xl z-50' 
                                  : 'hover:scale-[1.02]'
                              }`}
                              style={{
                                ...provided.draggableProps.style,
                                transform: snapshot.isDragging 
                                  ? `${provided.draggableProps.style?.transform} rotate(1deg)` 
                                  : provided.draggableProps.style?.transform
                              }}
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
                      <div className="flex items-center justify-center h-16 sm:h-24 lg:h-32 text-gray-400 text-xs">
                        <div className="text-center">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full bg-gray-200 mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                            <Plus size={10} className="sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                          </div>
                          <span className="hidden lg:block">Arraste negócios aqui</span>
                          <span className="lg:hidden">Vazio</span>
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