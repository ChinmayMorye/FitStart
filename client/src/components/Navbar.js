import React, { useState } from 'react';
import Login from '../pages/Login';

const Navbar = ({ onLoginSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full flex justify-between items-center p-8 z-40">
        <div className="text-cyan-400 font-black text-3xl italic tracking-tighter">FITSTART</div>
        
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-cyan-500 text-black px-10 py-2 rounded-full font-bold hover:bg-white transition-all duration-300"
        >
          Login
        </button>
      </nav>

      {/* Pop-up Window (Modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white"
            >
              ✕
            </button>
            <Login onLoginSuccess={() => {
              setIsOpen(false);
              onLoginSuccess();
            }} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;