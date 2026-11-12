// Sidebar Component - Exact Match to Reference: Deep Midnight Navy Blue (#002046) & Clean White Active Accents
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
  const currentTab = currentSearch.get('tab');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel - Deep Midnight Navy (#002046) with Crisp White Active Pills */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen bg-[#002046] text-white border-r border-[#001736] flex flex-col transition-all duration-300 ease-in-out shadow-xl flex-shrink-0 font-sans ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header Card - White Skyline Logo */}
        <div className={`p-4 border-b border-white/10 flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            {/* Architectural Skyline Logo Matching Screenshot */}
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-white" viewBox="0 0 36 36" fill="currentColor">
                <path d="M3 17L8 12V34H3V17Z" opacity="0.95" />
                <path d="M10 8L16 2V34H10V8Z" />
                <path d="M18 12L24 6V34H18V12Z" />
                <path d="M26 16L31 12V34H26V16Z" opacity="0.95" />
                <rect x="2" y="33" width="31" height="2" rx="1" />
                <rect x="5" y="19" width="1.8" height="2.5" fill="#002046" />
                <rect x="5" y="24" width="1.8" height="2.5" fill="#002046" />
                <rect x="12" y="10" width="2.2" height="3" fill="#002046" />
                <rect x="12" y="16" width="2.2" height="3" fill="#002046" />
                <rect x="12" y="22" width="2.2" height="3" fill="#002046" />
                <rect x="20" y="13" width="2.2" height="3" fill="#002046" />
                <rect x="20" y="19" width="2.2" height="3" fill="#002046" />
                <rect x="28" y="18" width="1.8" height="2.5" fill="#002046" />
                <rect x="28" y="23" width="1.8" height="2.5" fill="#002046" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-[13px] text-white tracking-tight leading-tight truncate" title="SANMATI CONSTRUCTIONS">
                  SANMATI
                </div>
                <div className="font-extrabold text-[12px] text-white tracking-tight leading-tight truncate" title="SANMATI CONSTRUCTIONS">
                  CONSTRUCTIONS
                </div>
                <div className="text-[10px] font-bold text-slate-300/80 tracking-widest uppercase mt-0.5 truncate">
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
            className={`w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/90 hover:text-white transition-colors flex-shrink-0 ${
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
        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2 py-3 space-y-2' : 'px-3 py-2 space-y-1'} custom-scrollbar`}>
          {/* Section 1: OVERVIEW */}
          {!isCollapsed && (
            <div className="px-3 pt-3 pb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300/70">
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
                        ? 'bg-white text-[#002046] font-bold shadow-md'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icons.LayoutDashboard className={`w-5 h-5 flex-shrink-0 ${isDashActive ? 'text-[#002046]' : 'text-white/90'}`} />
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
                className={`group flex items-center justify-between px-3.5 py-2.5 text-sm transition-all rounded-xl ${
                  isDashActive
                    ? 'bg-white text-[#002046] font-bold shadow-xs'
                    : 'text-white/85 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icons.LayoutDashboard className={`w-4 h-4 flex-shrink-0 ${isDashActive ? 'text-[#002046]' : 'text-white/80 group-hover:text-white'}`} />
                  <span className="truncate">Dashboard</span>
                </div>
              </NavLink>
            );
          })()}

          {/* Section 2: CONSTRUCTION MODULES */}
          {!isCollapsed && (
            <div className="px-3 pt-4 pb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300/70">
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
                        ? 'bg-white text-[#002046] font-bold shadow-md'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 flex-shrink-0 ${isParentActive ? 'text-[#002046]' : 'text-white/90'}`} />
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
                    className={`group flex items-center justify-between px-3.5 py-2.5 text-sm transition-all cursor-pointer rounded-xl ${
                      isParentActive
                        ? 'bg-white text-[#002046] font-bold shadow-xs'
                        : 'text-white/85 hover:text-white hover:bg-white/10 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className={`w-4 h-4 flex-shrink-0 ${isParentActive ? 'text-[#002046]' : 'text-white/80 group-hover:text-white'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {isExpanded ? (
                      <Icons.ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${
                        isParentActive ? 'text-[#002046]' : 'text-white/70'
                      }`} />
                    ) : (
                      <Icons.ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                        isParentActive ? 'text-[#002046]' : 'text-white/60 group-hover:text-white'
                      }`} />
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `group flex items-center justify-between px-3.5 py-2.5 text-sm transition-all rounded-xl ${
                      isActive
                        ? 'bg-white text-[#002046] font-bold shadow-xs'
                        : 'text-white/85 hover:text-white hover:bg-white/10 font-medium'
                    }`}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#002046]' : 'text-white/80 group-hover:text-white'}`} />
                          <span className="truncate">{item.name}</span>
                        </div>
                        <Icons.ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                          isActive ? 'text-[#002046]' : 'text-white/40 group-hover:text-white'
                        }`} />
                      </>
                    )}
                  </NavLink>
                )}

                {/* Subcategories Dropdown List */}
                {hasSubcategories && isExpanded && (
                  <div className="ml-4 pl-3 border-l-2 border-white/20 space-y-1 pt-1.5 pb-1.5">
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
                              ? 'bg-white/20 text-white font-bold border-l-2 border-white shadow-2xs'
                              : 'text-white/75 hover:text-white hover:bg-white/10 font-medium'
                          }`}
                        >
                          <SubIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isSubActive ? 'text-white' : 'text-white/70'}`} />
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
        <div className={`p-3.5 border-t border-white/10 bg-[#001c3d] ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={logout}
            className={`${
              isCollapsed 
                ? 'p-2.5 rounded-xl' 
                : 'w-full py-2 px-3 rounded-xl'
            } border border-white/20 bg-transparent hover:bg-white/10 flex items-center justify-center gap-2 text-sm font-bold text-white transition-all cursor-pointer shadow-2xs`}
            title="Sign Out"
          >
            <Icons.LogOut className="w-4 h-4 text-white" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
