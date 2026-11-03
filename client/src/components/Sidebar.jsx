// Sidebar Component - Exact Screenshot Match: Deep Midnight Navy (#0a1626) & Solid Electric Blue (#1d68e4)
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { MODULES_CONFIG, USER_ROLES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) => {
  const { currentUser, logout } = useAuth();
  const currentRole = currentUser?.role || USER_ROLES.EMPLOYEE;
  const location = useLocation();
  const navigate = useNavigate();

  // Track expanded state for modules with subcategories (auto-open if current route)
  const [expandedModules, setExpandedModules] = useState(() => {
    const activeMod = MODULES_CONFIG.find(m => location.pathname.startsWith(m.path) && m.subcategories);
    return activeMod ? { [activeMod.id]: true } : {};
  });

  useEffect(() => {
    const activeMod = MODULES_CONFIG.find(m => location.pathname.startsWith(m.path) && m.subcategories);
    if (activeMod) {
      setExpandedModules(prev => ({ ...prev, [activeMod.id]: true }));
    }
  }, [location.pathname]);

  const toggleModuleExpand = (moduleId, defaultPath, firstSubPath) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
    // If navigating to the module
    if (!location.pathname.startsWith(defaultPath)) {
      navigate(firstSubPath || defaultPath);
    }
  };

  // Filter modules based on user's authorized role (Super Admin sees all modules)
  const accessibleModules = MODULES_CONFIG.filter(mod => {
    if (currentRole === USER_ROLES.SUPER_ADMIN) return true;
    return mod.roles.includes(currentRole);
  });

  // Helper to parse query param
  const currentSearch = new URLSearchParams(location.search);
  const currentTab = currentSearch.get('tab') || 'records';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel - Light Clean Theme with Red Active Indicator */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ease-in-out shadow-xs flex-shrink-0 font-sans ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header Card */}
        <div className={`p-4 border-b border-slate-100 flex items-center bg-white ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-black text-xs tracking-wider shadow-xs flex-shrink-0">
              SC
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-base text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                  <span>SANMATI</span>
                  <span className="text-red-600 text-xs font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-100">ERP</span>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 truncate">
                  ADMIN CONTROL CENTER
                </div>
              </div>
            )}
          </div>

          {/* Toggle Button: Collapses on Desktop, Closes Drawer on Mobile */}
          <button 
            onClick={() => {
              if (window.innerWidth < 1024) {
                onClose?.();
              } else {
                onToggleCollapse?.();
              }
            }}
            className={`w-6 h-6 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors flex-shrink-0 ${
              isCollapsed ? 'hidden lg:flex mt-2' : ''
            }`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <Icons.ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <Icons.ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Navigation Menu Items */}
        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2 py-3 space-y-2' : 'px-2.5 py-2 space-y-1'} custom-scrollbar`}>
          {/* Section 1: OVERVIEW */}
          {!isCollapsed && (
            <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                OVERVIEW
              </span>
            </div>
          )}

          {/* Dashboard Item */}
          {(() => {
            const dashboardItem = accessibleModules.find(m => m.id === 'dashboard');
            if (!dashboardItem) return null;
            const isDashActive = location.pathname === '/dashboard';

            if (isCollapsed) {
              return (
                <div className="relative group">
                  <NavLink
                    to="/dashboard"
                    onClick={onClose}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-center transition-all ${
                      isDashActive
                        ? 'bg-red-50 text-red-600 border border-red-200 font-bold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icons.LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                  </NavLink>
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                    Dashboard
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                to="/dashboard"
                onClick={onClose}
                className={`group flex items-center justify-between px-3.5 py-2.5 text-sm transition-all ${
                  isDashActive
                    ? 'bg-red-50/80 text-red-600 font-bold border-l-4 border-red-600 rounded-r-xl rounded-l-none'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold rounded-xl'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icons.LayoutDashboard className={`w-4 h-4 flex-shrink-0 ${isDashActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="truncate">Dashboard</span>
                </div>
              </NavLink>
            );
          })()}

          {/* Section 2: CONSTRUCTION MODULES */}
          {!isCollapsed && (
            <div className="px-3 pt-4 pb-1.5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ERP MODULES ({accessibleModules.filter(m => m.id !== 'dashboard').length} SECTIONS)
              </span>
            </div>
          )}

          {/* Other Modules */}
          {accessibleModules.filter(m => m.id !== 'dashboard').map((item) => {
            const IconComponent = Icons[item.icon] || Icons.CircleDot;
            const hasSubcategories = Boolean(item.subcategories && item.subcategories.length > 0);
            const isExpanded = Boolean(expandedModules[item.id]);
            const isParentActive = location.pathname.startsWith(item.path);

            if (isCollapsed) {
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      const target = item.subcategories?.[0]?.path || item.path;
                      navigate(target);
                    }}
                    title={item.name}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isParentActive
                        ? 'bg-red-50 text-red-600 border border-red-200 font-bold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                  </button>
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                    {item.name}
                  </div>
                </div>
              );
            }

            return (
              <div key={item.id} className="space-y-0.5">
                {hasSubcategories ? (
                  <div
                    onClick={() => toggleModuleExpand(item.id, item.path, item.subcategories?.[0]?.path)}
                    className={`group flex items-center justify-between px-3.5 py-2.5 text-sm transition-all cursor-pointer ${
                      isParentActive
                        ? 'bg-red-50/80 text-red-600 font-bold border-l-4 border-red-600 rounded-r-xl rounded-l-none'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold rounded-xl'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className={`w-4 h-4 flex-shrink-0 ${isParentActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {isExpanded ? (
                      <Icons.ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${
                        isParentActive ? 'text-red-600' : 'text-slate-400'
                      }`} />
                    ) : (
                      <Icons.ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                        isParentActive ? 'text-red-600 opacity-90' : 'text-slate-400 group-hover:text-slate-600'
                      }`} />
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `group flex items-center justify-between px-3.5 py-2.5 text-sm transition-all ${
                      isActive
                        ? 'bg-red-50/80 text-red-600 font-bold border-l-4 border-red-600 rounded-r-xl rounded-l-none'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold rounded-xl'
                    }`}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                          <span className="truncate">{item.name}</span>
                        </div>
                        <Icons.ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                          isActive ? 'text-red-600' : 'text-slate-300 group-hover:text-slate-500'
                        }`} />
                      </>
                    )}
                  </NavLink>
                )}

                {/* Subcategories Dropdown List */}
                {hasSubcategories && isExpanded && (
                  <div className="ml-4 pl-3 border-l-2 border-slate-200/80 space-y-1 pt-1.5 pb-1.5">
                    {item.subcategories.map((sub, index) => {
                      const SubIcon = Icons[sub.icon] || Icons.CircleDot;
                      const isSubActive = isParentActive && (currentTab === sub.tab || (!currentTab && index === 0));

                      return (
                        <NavLink
                          key={sub.id}
                          to={sub.path}
                          onClick={onClose}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-[13px] transition-all ${
                            isSubActive
                              ? 'bg-red-50/90 text-red-600 font-bold border-l-2 border-red-600 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <SubIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isSubActive ? 'text-red-600' : 'text-slate-400'}`} />
                          <span className="truncate">{sub.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Section: Sign Out */}
        <div className={`p-3.5 border-t border-slate-100 bg-white ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={logout}
            className={`${
              isCollapsed 
                ? 'p-2.5 rounded-xl' 
                : 'w-full py-2.5 px-3 rounded-xl'
            } border border-slate-200 bg-slate-50/70 hover:bg-red-50 hover:border-red-200 flex items-center justify-center gap-2 text-sm font-bold text-slate-700 hover:text-red-600 transition-all cursor-pointer shadow-2xs`}
            title="Sign Out"
          >
            <Icons.LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-500" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

