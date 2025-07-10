import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import VersionInfo from '../common/VersionInfo';

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

    // Fix for iOS viewport height
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', handleResize);
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 no-select overflow-hidden" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      {/* Sidebar for desktop */}
      {!isMobile && <Sidebar isMobile={false} />}
      
      {/* Mobile sidebar with overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div className="fixed inset-0 z-20 flex" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={toggleMobileSidebar}
          ></div>
          <Sidebar isMobile={true} toggleMobileSidebar={toggleMobileSidebar} />
        </div>
      )}
      
      <div className="flex flex-col flex-1 md:ml-64 min-w-0">
        <Header toggleMobileSidebar={toggleMobileSidebar} />
        <main className="flex-1 overflow-y-auto mt-16 select-text">
          <div className="min-h-full">
            <Outlet />
          </div>
          {/* Version info in footer */}
          <footer className="border-t border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                © {new Date().getFullYear()} CRM-DGA. Todos os direitos reservados.
              </div>
              <VersionInfo showInFooter={true} />
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;