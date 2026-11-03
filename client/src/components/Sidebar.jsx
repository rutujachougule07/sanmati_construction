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

      {/* Sidebar Panel - Deep Midnight Navy with Responsive Desktop Collapse */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen bg-[#0a1626] border-r border-[#132238] flex flex-col transition-all duration-300 ease-in-out shadow-2xl flex-shrink-0 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header Card */}
        <div className={`p-3.5 border-b border-[#132238] flex items-center bg-[#081220] ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1d68e4] to-cyan-400 p-[1.5px] shadow-sm flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-[#0a1626] rounded-[10px] flex items-center justify-center font-extrabold text-cyan-400 text-xs tracking-wider">
                SC
              </div>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white tracking-wide truncate">
                    SANMATI CONSTR
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span>Kolhapur, Sangli</span>
                </div>
                <div className="text-[9px] font-bold text-sky-400 tracking-wider uppercase">
                  ADMIN
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
            className={`w-6 h-6 rounded-full bg-[#11233b] hover:bg-[#1a3356] border border-[#1d3557] flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0 ${
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

        {/* Section Header: NAVIGATION */}
        {!isCollapsed && (
          <div className="px-4 pt-4 pb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              NAVIGATION
            </span>
          </div>
        )}

        {/* Navigation Menu Items with Subcategories */}
        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2 py-3 space-y-2' : 'px-2.5 py-1 space-y-1'} custom-scrollbar`}>
          {accessibleModules.map((item) => {
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
                        ? 'bg-[#1d68e4] text-white shadow-md shadow-blue-900/40'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                  </button>
                  {/* Tooltip on hover */}
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 bg-[#0d1f36] border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                    {item.name}
                  </div>
                </div>
              );
            }

            return (
              <div key={item.id} className="space-y-0.5">
                {hasSubcategories ? (
                  // Module with Subcategories (Clickable toggle & link)
                  <div
                    onClick={() => toggleModuleExpand(item.id, item.path, item.subcategories?.[0]?.path)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      isParentActive
                        ? 'bg-[#1d68e4] text-white font-medium shadow-md shadow-blue-900/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5 font-normal'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <IconComponent className={`w-4 h-4 flex-shrink-0 ${isParentActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {isExpanded ? (
                      <Icons.ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${
                        isParentActive ? 'text-white' : 'text-slate-400'
                      }`} />
                    ) : (
                      <Icons.ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${
                        isParentActive ? 'text-white opacity-90' : 'text-slate-500 opacity-60 group-hover:text-slate-300'
                      }`} />
                    )}
                  </div>
                ) : (
                  // Standard NavLink
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-[#1d68e4] text-white font-medium shadow-md shadow-blue-900/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5 font-normal'
                    }`}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3 min-w-0">
                          <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                          <span className="truncate">{item.name}</span>
                        </div>
                        <Icons.ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${
                          isActive ? 'text-white opacity-90' : 'text-slate-500 opacity-60 group-hover:text-slate-300'
                        }`} />
                      </>
                    )}
                  </NavLink>
                )}

                {/* Subcategories Dropdown List */}
                {hasSubcategories && isExpanded && (
                  <div className="ml-4 pl-3.5 border-l border-blue-900/40 space-y-1 pt-1 pb-1">
                    {item.subcategories.map((sub, index) => {
                      const SubIcon = Icons[sub.icon] || Icons.CircleDot;
                      const isSubActive = isParentActive && (currentTab === sub.tab || (!currentTab && index === 0));

                      return (
                        <NavLink
                          key={sub.id}
                          to={sub.path}
                          onClick={onClose}
                          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] transition-all ${
                            isSubActive
                              ? 'bg-[#122e57] text-cyan-300 font-semibold border-l-2 border-cyan-400 shadow-2xs'
                              : 'text-slate-400 hover:text-white hover:bg-white/5 font-normal'
                          }`}
                        >
                          <SubIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isSubActive ? 'text-cyan-400' : 'text-slate-500'}`} />
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

        {/* Bottom Section: Sign Out Only */}
        <div className={`p-3 border-t border-[#132238] bg-[#081220] ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={logout}
            className={`${
              isCollapsed 
                ? 'p-2.5 rounded-xl' 
                : 'w-full py-2.5 px-3 rounded-xl'
            } border border-[#182f4d] bg-[#0e2038]/70 hover:bg-rose-500/10 hover:border-rose-500/40 flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 hover:text-rose-300 transition-all cursor-pointer shadow-xs`}
            title="Sign Out"
          >
            <Icons.LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

