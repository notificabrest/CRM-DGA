import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      {!isMobile && <Sidebar isMobile={false} />}
      
      {/* Mobile sidebar with overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div className="fixed inset-0 z-20 flex">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={toggleMobileSidebar}
          ></div>
          <Sidebar isMobile={true} toggleMobileSidebar={toggleMobileSidebar} />
        </div>
      )}
      
      <div className="flex flex-col flex-1 md:ml-64">
        <Header toggleMobileSidebar={toggleMobileSidebar} />
        <main className="flex-1 p-4 overflow-y-auto mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;