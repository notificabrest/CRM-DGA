import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, UserPlus, Search, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import PhoneSearchInput from '../components/common/PhoneSearchInput';
import ClientCard from '../components/clients/ClientCard';
import ClientForm from '../components/clients/ClientForm';
import { PhoneType } from '../types';

const PhoneSearchPage: React.FC = () => {
  const { phoneNumber } = useParams<{ phoneNumber?: string }>();
  const navigate = useNavigate();
  const { clients, users, getClientByPhone, deleteClient } = useData();
  
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);

  // Handle search when component mounts with a phone number in URL
  useEffect(() => {
    if (phoneNumber) {
      const client = getClientByPhone(phoneNumber);
      setSearchResult(client);
      setSearchInitiated(true);
    } else {
      setSearchResult(null);
      setSearchInitiated(false);
    }
  }, [phoneNumber, getClientByPhone]);

  const handleSearch = (phone: string) => {
    navigate(`/phone-search/${phone}`);
  };

  const handleNewClient = (phoneNumber?: string) => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setShowDetails(false);
    // Reset search after creating a client
    if (phoneNumber) {
      const client = getClientByPhone(phoneNumber);
      setSearchResult(client);
    }
  };

  const handleViewDetails = () => {
    setShowDetails(true);
    setShowForm(true);
  };

  const handleDeleteClient = (id: string) => {
    deleteClient(id);
    setSearchResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Phone Search</h1>
      </div>

      {/* Search Box */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium mb-4">Search Client by Phone Number</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <PhoneSearchInput 
              onSearch={handleSearch} 
              fullWidth 
              placeholder="Enter phone number (e.g., 11987654321)" 
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter a phone number to search for a client. The system will search across all phone fields.
            </p>
          </div>
          <button
            onClick={() => navigate('/clients')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 self-start md:self-end"
          >
            <Search size={18} className="mr-1" />
            Advanced Search
          </button>
        </div>
      </div>

      {/* Search Results or Form */}
      {showForm ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <ClientForm 
            onSave={handleFormClose} 
            onCancel={handleFormClose}
            client={showDetails ? searchResult : phoneNumber ? {
              id: '',
              name: '',
              email: '',
              phones: [
                {
                  id: `phone-${Date.now()}`,
                  type: PhoneType.MAIN,
                  number: phoneNumber,
                  isPrimary: true,
                }
              ],
              branchId: '',
              ownerId: '',
              status: 'ACTIVE',
              tags: [],
              observations: [],
              customFields: {},
              createdAt: new Date(),
              updatedAt: new Date(),
            } : undefined}
          />
        </div>
      ) : (
        <>
          {searchInitiated && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Search Results</h2>
              
              {searchResult ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ClientCard 
                    client={searchResult} 
                    owner={users.find(u => u.id === searchResult.ownerId)}
                    onClick={handleViewDetails}
                    onDelete={handleDeleteClient}
                  />
                  <div className="flex flex-col justify-center items-center p-6 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-center text-gray-700 mb-4">
                      Client found! You can view or edit their details.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleViewDetails}
                        className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                      >
                        <ArrowRight size={18} className="mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                    <Phone size={24} className="text-orange-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No client found with that phone number</h3>
                  <p className="text-gray-500 mb-6">
                    Would you like to create a new client with this phone number?
                  </p>
                  <button
                    onClick={() => handleNewClient(phoneNumber)}
                    className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 mx-auto"
                  >
                    <UserPlus size={18} className="mr-1" />
                    Create New Client
                  </button>
                </div>
              )}
            </div>
          )}

          {!searchInitiated && (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Phone size={24} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Enter a phone number to search</h3>
              <p className="text-gray-500 mb-6">
                Use the search field above to find clients by their phone number.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => handleNewClient()}
                  className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  <UserPlus size={18} className="mr-1" />
                  Create New Client
                </button>
                <button
                  onClick={() => navigate('/clients')}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Search size={18} className="mr-1" />
                  Browse All Clients
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PhoneSearchPage;