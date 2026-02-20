import React, { useState } from "react";
import { HiOutlineSearch, HiOutlineX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

function Searchbar({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query)}`, {
        replace: true,
      });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div
      className={`absolute inset-0 bg-white/95 backdrop-blur-lg px-6 md:px-12 flex items-center transition-all duration-500 z-[90] ${
        isOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full pointer-events-none"
      }`}
    >
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 flex items-center gap-6"
      >
        <HiOutlineSearch size={22} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search for natural products..."
          className="flex-1 bg-transparent border-none outline-none text-xl font-serif text-gray-900 placeholder:text-gray-300"
          value={searchQuery}
          onChange={handleSearchChange}
          autoFocus={isOpen}
        />
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-900 transition"
        >
          <HiOutlineX size={24} />
        </button>
      </form>
    </div>
  );
}

export default Searchbar;
