import React, { useState, useEffect } from "react";
import { Menu, X, Home, Upload, Clock, User, LogOut, ChevronRight, Bell, CreditCard } from "lucide-react";
import { AuthStore } from "../../Store/auth/AuthStore";
import { useNavigate } from "react-router-dom";

interface ILayoutProps {
  children?: React.ReactNode;
  title: string;
}

const Layout: React.FC<ILayoutProps> = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const { logout, user } = AuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", role: "primary", icon: Home },
    { name: "Téléchargements", path: "/uploads", role: "primary", icon: Upload },
    { name: "Historique", path: "/history", role: "primary", icon: Clock },
    {name : "Facturation", path : "/billing", role: "primary", icon: CreditCard},
    { name: "Profile", path: "/profile", role: "secondary", icon: User },
    { name: "Déconnexion", path: "/login", role: "secondary", icon: LogOut },
  ];

  const primaryItems = menuItems.filter(item => item.role === "primary");
  const secondaryItems = menuItems.filter(item => item.role === "secondary");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuClick = (item: { name: string; path: string }) => {
    setActiveItem(item.name);

    // If the item is Déconnexion, perform logout and redirect to login
    if (item.name === "Déconnexion") {
      try {
        logout();
      } catch (e) {
        console.error("Logout failed:", e);
      }
      navigate(item.path, { replace: true });
    } else {
      navigate(item.path);
    }

    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br">
      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full shadow-lg transition-all duration-300 ease-in-out z-50 ${
          isSidebarOpen ? "w-64" : isMobile ? "-translate-x-full w-64" : "w-16"
        }`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <div
            className={`flex items-center gap-3 transition-opacity duration-300 ${
              isSidebarOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-10 h-12 bg-linear-to-br from-blue-500 to-purple-800 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-xl text-slate-100">AIDoc</span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 bg-neutral-800 hover:bg-neutral-600 rounded-lg transition-colors"
          >
            {isSidebarOpen ? (
              <X size={18} color="white" />
            ) : (
              <Menu size={18} color="white" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 flex flex-col h-[calc(100%-4.5rem)]">
          {/* Primary Menu */}
          <div className="flex-1">
            <div className="space-y-1">
              {primaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-linear-to-r from-blue-500 to-purple-800 text-white shadow-lg"
                        : "text-slate-100 hover:bg-neutral-700"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-white"
                          : "text-slate-100 group-hover:text-slate-100"
                      }
                    />
                    {isSidebarOpen && (
                      <span
                        className={`font-medium text-sm ${
                          isActive ? "text-white" : ""
                        }`}
                      >
                        {item.name}
                      </span>
                    )}
                    {isSidebarOpen && isActive && (
                      <ChevronRight size={14} className="ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Menu */}
          <div className="border-t border-neutral-600 pt-3 space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-linear-to-r from-blue-500 to-purple-800 text-white shadow-lg"
                      : "text-slate-100 hover:bg-neutral-700"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-100 group-hover:text-slate-100"
                    }
                  />
                  {isSidebarOpen && (
                    <span
                      className={`font-medium text-sm ${
                        isActive ? "text-white" : ""
                      }`}
                    >
                      {item.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          isMobile ? "ml-0" : isSidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {/* Header */}
        <header className=" shadow-sm border-b border-neutral-700 sticky top-0 z-30">
          <div className="px-4 md:px-8 py-4 md:py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className=" hover:bg-slate-100 rounded-lg transition-colors md:hidden"
                >
                  <Menu size={20} color="white" />
                </button>
              )}
              <div>
                <h1 className="text-xl md:text-2xl text-neutral-100 font-bold ">
                  {title}
                </h1>
              
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <button className="p-3 items-center justify-center bg-neutral-500 hover:bg-slate-200 rounded-lg transition-colors text-slate-700 font-medium text-sm hidden sm:block">
                <Bell size={16} color="white"/>
              </button>
              <div className="w-9 h-9 md:w-10 md:h-10 bg-linear-to-br from-blue-500 to-purple-800 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg md:text-lg">
                  {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-2 md:p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;