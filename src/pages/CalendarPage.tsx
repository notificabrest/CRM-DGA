import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CalendarEvent, EventType, EventPriority, EventStatus, Client, Deal } from '../types';

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { events, addEvent, updateEvent, deleteEvent } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    type: EventType.MEETING,
    priority: EventPriority.MEDIUM,
    status: EventStatus.PENDING,
    startDate: new Date(),
    endDate: new Date(),
    allDay: false,
    location: '',
    attendees: [],
    reminderMinutes: 15,
    ownerId: user?.id || '',
  });

  // Helper functions for week and day views
  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getHourSlots = () => {
    const slots: string[] = [];
    for (let i = 0; i < 24; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getEventsForTimeSlot = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getHours() === hour
      );
    });
  };

  // Calendar navigation
  const nextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => {
        const next = new Date(prev);
        next.setDate(prev.getDate() + 7);
        return next;
      });
    } else {
      setCurrentDate(prev => {
        const next = new Date(prev);
        next.setDate(prev.getDate() + 1);
        return next;
      });
    }
  };

  const prevPeriod = () => {
    if (view === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => {
        const next = new Date(prev);
        next.setDate(prev.getDate() - 7);
        return next;
      });
    } else {
      setCurrentDate(prev => {
        const next = new Date(prev);
        next.setDate(prev.getDate() - 1);
        return next;
      });
    }
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      currentWeek.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(new Date(year, month, day));
    }
    
    // Add days from next month
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(year, month + 1, nextMonthDay++));
    }
    weeks.push(currentWeek);
    
    return weeks;
  };

  // Event handlers
  const handleAddEvent = () => {
    if (user) {
      if (selectedEvent) {
        // Update existing event
        updateEvent(selectedEvent.id, newEvent);
      } else {
        // Add new event
        addEvent(newEvent as Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      setShowEventForm(false);
      setSelectedEvent(null);
      setNewEvent({
        title: '',
        description: '',
        type: EventType.MEETING,
        priority: EventPriority.MEDIUM,
        status: EventStatus.PENDING,
        startDate: new Date(),
        endDate: new Date(),
        allDay: false,
        location: '',
        attendees: [],
        reminderMinutes: 15,
        ownerId: user.id,
      });
    }
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(event.id);
      setShowEventForm(false);
      setSelectedEvent(null);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setNewEvent(prev => ({
      ...prev,
      startDate: date,
      endDate: new Date(date.getTime() + 60 * 60 * 1000), // 1 hour later
    }));
    setShowEventForm(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventForm(true);
    setNewEvent(event);
  };

  const getEventsByDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getPriorityColor = (priority: EventPriority) => {
    switch (priority) {
      case EventPriority.LOW:
        return 'bg-blue-100 text-blue-800';
      case EventPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case EventPriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case EventPriority.URGENT:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: EventType) => {
    switch (type) {
      case EventType.MEETING:
        return <Users size={16} />;
      case EventType.TASK:
        return <AlertCircle size={16} />;
      case EventType.REMINDER:
        return <Clock size={16} />;
      case EventType.DEAL:
        return <AlertCircle size={16} />;
      default:
        return <CalendarIcon size={16} />;
    }
  };

  // Add function to get week number
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Render functions for different views
  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-px bg-gray-200">
      {generateCalendarDays().map((week, weekIndex) =>
        week.map((date, dayIndex) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const dayEvents = getEventsByDate(date);
          
          return (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={`min-h-[120px] bg-white p-2 ${
                isCurrentMonth ? 'hover:bg-gray-50' : 'bg-gray-50'
              } cursor-pointer transition-colors`}
              onClick={() => handleDateClick(date)}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    isToday
                      ? 'bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center'
                      : isCurrentMonth
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                    className={`px-2 py-1 rounded-md text-xs cursor-pointer transform hover:scale-105 transition-transform ${getPriorityColor(
                      event.priority
                    )}`}
                  >
                    <div className="flex items-center">
                      {getTypeIcon(event.type)}
                      <span className="ml-1 truncate">{event.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const hourSlots = getHourSlots();

    return (
      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 min-w-[800px]">
          {/* Time column */}
          <div className="border-r border-gray-200">
            <div className="h-12 border-b border-gray-200"></div>
            {hourSlots.map(hour => (
              <div key={hour} className="h-20 border-b border-gray-200 px-2 py-1">
                <span className="text-xs text-gray-500">{hour}</span>
              </div>
            ))}
          </div>

          {/* Days columns */}
          {weekDays.map(day => (
            <div key={day.toISOString()} className="flex-1">
              <div className={`h-12 border-b border-gray-200 p-2 text-center ${
                day.toDateString() === new Date().toDateString() ? 'bg-orange-50' : ''
              }`}>
                <div className="text-sm font-medium">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className={`text-sm ${
                  day.toDateString() === new Date().toDateString() ? 'text-orange-600 font-bold' : ''
                }`}>{day.getDate()}</div>
              </div>
              {hourSlots.map((hour, index) => {
                const events = getEventsForTimeSlot(day, index);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="h-20 border-b border-r border-gray-200 p-1"
                    onClick={() => {
                      const date = new Date(day);
                      date.setHours(index);
                      handleDateClick(date);
                    }}
                  >
                    {events.map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className={`px-2 py-1 rounded-md text-xs cursor-pointer mb-1 ${getPriorityColor(
                          event.priority
                        )}`}
                      >
                        <div className="flex items-center">
                          {getTypeIcon(event.type)}
                          <span className="ml-1 truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hourSlots = getHourSlots();

    return (
      <div className="grid grid-cols-1">
        {hourSlots.map((hour, index) => {
          const events = getEventsForTimeSlot(currentDate, index);
          return (
            <div
              key={hour}
              className="grid grid-cols-[100px_1fr] border-b border-gray-200"
              onClick={() => {
                const date = new Date(currentDate);
                date.setHours(index);
                handleDateClick(date);
              }}
            >
              <div className="p-2 border-r border-gray-200">
                <span className="text-sm text-gray-500">{hour}</span>
              </div>
              <div className="min-h-[80px] p-2">
                {events.map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                    className={`px-3 py-2 rounded-md text-sm cursor-pointer mb-2 ${getPriorityColor(
                      event.priority
                    )}`}
                  >
                    <div className="flex items-center">
                      {getTypeIcon(event.type)}
                      <span className="ml-2 font-medium">{event.title}</span>
                    </div>
                    {event.description && (
                      <p className="mt-1 text-xs opacity-75">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 text-sm font-medium ${
                view === 'month'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300 rounded-l-md`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 text-sm font-medium ${
                view === 'week'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border-t border-b border-gray-300`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 text-sm font-medium ${
                view === 'day'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300 rounded-r-md`}
            >
              Day
            </button>
          </div>
          <button
            onClick={() => {
              setSelectedEvent(null);
              setShowEventForm(true);
            }}
            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            <Plus size={18} className="mr-1" />
            New Event
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={prevPeriod}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              {view === 'week' && (
                <p className="text-sm text-gray-500">
                  Week {getWeekNumber(currentDate)} of {currentDate.getFullYear()}
                </p>
              )}
            </div>
            <button
              onClick={nextPeriod}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button
            onClick={today}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Today
          </button>
        </div>

        <div className="border-t border-gray-200">
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
        </div>
      </div>

      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-medium mb-4">
              {selectedEvent ? 'Edit Event' : 'New Event'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as EventType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {Object.values(EventType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newEvent.priority}
                    onChange={(e) => setNewEvent({ ...newEvent, priority: e.target.value as EventPriority })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {Object.values(EventPriority).map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.startDate?.toISOString().slice(0, 16)}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.endDate?.toISOString().slice(0, 16)}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder (minutes before)
                </label>
                <select
                  value={newEvent.reminderMinutes}
                  onChange={(e) => setNewEvent({ ...newEvent, reminderMinutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="0">No reminder</option>
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="1440">1 day</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              {selectedEvent && (
                <button
                  onClick={() => handleDeleteEvent(selectedEvent)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete Event
                </button>
              )}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEventForm(false);
                    setSelectedEvent(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  {selectedEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;