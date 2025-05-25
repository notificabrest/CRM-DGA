import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PhoneSearchInputProps {
  onSearch?: (phone: string) => void;
  fullWidth?: boolean;
  placeholder?: string;
}

const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // Format based on length
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 5) {
    return `+${numbers.slice(0, 2)} ${numbers.slice(2)}`;
  } else if (numbers.length <= 9) {
    return `+${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;
  } else {
    return `+${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 9)} ${numbers.slice(9, 13)}`;
  }
};

const PhoneSearchInput: React.FC<PhoneSearchInputProps> = ({ 
  onSearch, 
  fullWidth = false,
  placeholder = "Search by phone number..." 
}) => {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(formatPhoneNumber(value));
  };

  const handleSearch = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length >= 8) {
      if (onSearch) {
        onSearch(cleanPhone);
      } else {
        // Stay on the phone-search page but with the phone number parameter
        navigate(`/phone-search/${cleanPhone}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearInput = () => {
    setPhone('');
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : 'w-64'}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search size={16} className="text-gray-400" />
      </div>
      <input
        type="text"
        value={phone}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        placeholder={placeholder}
      />
      {phone && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            onClick={clearInput}
            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PhoneSearchInput;