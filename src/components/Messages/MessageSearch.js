import React, { useState } from 'react';
import { HiOutlineSearch, HiX } from 'react-icons/hi';

const SearchMessages = ({ handleSearchMessages, setShowSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearchMessages(searchTerm);
  };

  const handleClose = () => {
    setShowSearch(false); 
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.bg-black')) {
      setShowSearch(false); 
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" onClick={handleClickOutside}>
      <div className="bg-white rounded-lg p-4 max-w-md w-full">
        <div className="flex justify-end mb-2">
          <button className="hover:text-gray-600" onClick={handleClose}>
            <HiX className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center border-b border-gray-200 py-2">
          <input
            type="text"
            value={searchTerm}
            onChange={handleChange}
            placeholder="Tìm kiếm tin nhắn..."
            className="w-full outline-none px-2 py-1"
          />
          <button type="submit" className="ml-2">
            <HiOutlineSearch size={18} className="text-gray-400 hover:text-gray-600 cursor-pointer" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchMessages;
