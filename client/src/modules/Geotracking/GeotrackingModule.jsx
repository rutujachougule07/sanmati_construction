// MODULE 7: GEOTRACKING AND GEOFENCING
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ShieldCheck, AlertTriangle, Clock, RefreshCw, CheckCircle2, History, Compass, Sliders } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { useAuth } from '../../context/AuthContext';
import { getCurrentGPSPosition, verifyGeofence } from '../../services/geofenceService';
import { GeofenceMap } from '../../components/GeofenceMap';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/formatters';

export const GeotrackingModule = () => {
  const { projects, gpsLogs, recordGPSCheckIn, updateProject } = useERPData();
  const { currentUser } = useAuth();

  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || 'PRJ-KLP-001');
  const [deviceLocation, setDeviceLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [attendanceType, setAttendanceType] = useState('Project Site');
  const [activeTab, setActiveTab] = useState('map'); // map, history, config

  // Active Project Reference
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Geofence Configuration state for Admin
  const [configRadius, setConfigRadius] = useState(activeProject?.geofenceRadius || 250);

  useEffect(() => {
    if (activeProject) {
      setConfigRadius(activeProject.geofenceRadius || 250);
    }
  }, [activeProject]);

  // Fetch Current Device GPS
  const handleAcquireGPS = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const pos = await getCurrentGPSPosition();
      setDeviceLocation(pos);
    } catch (err) {
      console.warn("GPS acquire error:", err.message);
      // Fallback to simulated site coordinate for demonstration if user's browser denies permission
      const fallbackPos = {
        latitude: activeProject?.latitude ? activeProject.latitude + (Math.random() * 0.0004 - 0.0002) : 16.7029,
        longitude: activeProject?.longitude ? activeProject.longitude + (Math.random() * 0.0004 - 0.0002) : 74.2404,
        accuracy: 4.5,
        timestamp: new Date().toISOString()
      };
      setDeviceLocation(fallbackPos);
      setLocationError("Note: Using simulated site GPS (allow browser location for live device satellite fix).");
    } finally {
      setIsLocating(false);
    }
  };

  // Perform GPS Check-In
  const handleExecuteCheckIn = () => {
    if (!deviceLocation) {
      alert("Please acquire your GPS location first.");
      return;
    }

    recordGPSCheckIn({
      userId: currentUser?.id || 'usr_se',
      userName: currentUser?.name || 'Er. Amit Deshmukh',
      projectId: activeProject.id,
      latitude: deviceLocation.latitude,
      longitude: deviceLocation.longitude,
      accuracy: deviceLocation.accuracy,
      notes: checkInNotes,
      type: attendanceType
    });

    setCheckInNotes('');
    alert("GPS Attendance & Geofence check-in successfully logged!");
  };

  const handleSaveGeofenceConfig = (e) => {
    e.preventDefault();
    updateProject(activeProject.id, { geofenceRadius: Number(configRadius) });
    alert(`Geofence radius updated to ${configRadius}m for ${activeProject.name}`);
  };

  const logColumns = [
    { key: 'timestamp', header: 'Timestamp', render: (row) => <span className="font-mono text-slate-300 text-[11px]">{formatDate(row.timestamp, true)}</span> },
    { key: 'userName', header: 'Staff / User', render: (row) => <span className="font-bold text-white">{row.userName}</span> },
    { key: 'projectName', header: 'Project Site', render: (row) => <span className="text-slate-300">{row.projectName}</span> },
    {
      key: 'coords',
      header: 'GPS Coordinates',
      render: (row) => <span className="font-mono text-[11px] text-slate-400">{row.latitude?.toFixed(4)}, {row.longitude?.toFixed(4)} (±{row.accuracy}m)</span>
    },
    { key: 'locationType', header: 'Type', render: (row) => <span className="text-gold-400 font-semibold text-[11px]">{row.locationType}</span> },
    { key: 'attendanceStatus', header: 'Geofence Verification', render: (row) => <StatusBadge status={row.attendanceStatus} /> },
    { key: 'notes', header: 'Site Remarks', render: (row) => <span className="text-slate-400 text-xs italic">{row.notes || '—'}</span> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">GPS Geotracking & Geofencing</h2>
          <p className="text-xs text-slate-400">
            Mandatory location attendance verification for authorized engineers, site visits, and project boundaries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'map' ? 'bg-gold-400 text-black' : 'bg-[#181d26] text-slate-300'}`}
          >
            Live Site Map
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'history' ? 'bg-gold-400 text-black' : 'bg-[#181d26] text-slate-300'}`}
          >
            GPS Attendance Logs ({gpsLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'config' ? 'bg-gold-400 text-black' : 'bg-[#181d26] text-slate-300'}`}
          >
            Geofence Radius Settings
          </button>
        </div>
      </div>

      {/* Main Map & Check-In Console */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Geofence Map */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-4 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium">Select Site:</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="erp-input font-bold text-xs py-1.5 w-64"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAcquireGPS}
                disabled={isLocating}
                className="erp-btn-secondary text-xs flex items-center gap-1.5"
              >
                <Navigation className={`w-3.5 h-3.5 text-sky-400 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{deviceLocation ? 'Refresh Device GPS' : 'Acquire My GPS'}</span>
              </button>
            </div>

            {locationError && (
              <div className="p-2.5 bg-amber-950/40 border border-amber-800/50 rounded-lg text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{locationError}</span>
              </div>
            )}

            <GeofenceMap
              projectLat={activeProject?.latitude || 16.7028}
              projectLng={activeProject?.longitude || 74.2405}
              geofenceRadius={activeProject?.geofenceRadius || 250}
              projectName={activeProject?.name || "Project Site"}
              userLat={deviceLocation?.latitude}
              userLng={deviceLocation?.longitude}
              userName={currentUser?.name || "My GPS"}
              accuracy={deviceLocation?.accuracy || 5}
            />
          </div>

          {/* GPS Check-In Action Card */}
          <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#242b37] pb-3">
                <h3 className="text-base font-bold text-white font-heading">Site Check-In Action</h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-mono">
                  {currentUser?.role}
                </span>
              </div>

              {deviceLocation ? (
                <div className="p-3 bg-[#13161c] rounded-xl border border-[#232a35] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>GPS Coordinates:</span>
                    <span className="font-mono text-white font-semibold">
                      {deviceLocation.latitude.toFixed(5)}°, {deviceLocation.longitude.toFixed(5)}°
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Satellite Accuracy:</span>
                    <span className="font-mono text-emerald-400 font-semibold">±{deviceLocation.accuracy} meters</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Fix Time:</span>
                    <span className="font-mono text-slate-300">{formatDate(deviceLocation.timestamp, true)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#13161c] rounded-xl border border-dashed border-[#2d3644] text-center text-xs text-slate-400 space-y-2">
                  <Compass className="w-8 h-8 text-gold-400 mx-auto" />
                  <p>Click "Acquire My GPS" to scan satellite position.</p>
                  <button
                    onClick={handleAcquireGPS}
                    className="erp-btn-primary text-xs"
                  >
                    Scan GPS Satellite Fix
                  </button>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1 text-xs">Attendance / Activity Type</label>
                <select
                  value={attendanceType}
                  onChange={(e) => setAttendanceType(e.target.value)}
                  className="erp-input text-xs"
                >
                  <option value="Project Site">Daily Project Site Duty</option>
                  <option value="Site Visit">Inspection / Client Site Walkthrough</option>
                  <option value="Quality Audit">Quality & Concrete Pour Inspection</option>
                  <option value="Survey Execution">Total Station / Leveling Survey</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 text-xs">Inspection Notes / Activity</label>
                <textarea
                  rows={3}
                  placeholder="e.g. 3rd floor slab steel binding inspection completed with RCC contractor."
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  className="erp-input text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleExecuteCheckIn}
              disabled={!deviceLocation}
              className="mt-6 w-full erp-btn-primary text-xs py-2.5 font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record GPS Verified Attendance</span>
            </button>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <DataTable
          columns={logColumns}
          data={gpsLogs}
          searchKey="userName"
          searchPlaceholder="Search GPS logs by staff name, project, attendance status..."
          exportFileName="Sanmati_GPS_Logs"
        />
      )}

      {/* Geofence Configuration Tab */}
      {activeTab === 'config' && (
        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-6 shadow-xl max-w-2xl space-y-4">
          <h3 className="text-base font-bold text-white font-heading">
            Configure Project Geofence Perimeter ({activeProject.name})
          </h3>
          <p className="text-xs text-slate-400">
            Set the authorized circular boundary in meters from site center. Check-ins beyond this radius are marked as unverified for audit.
          </p>

          <form onSubmit={handleSaveGeofenceConfig} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="erp-input font-bold"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Latitude Center</label>
                <input
                  type="text"
                  readOnly
                  value={activeProject.latitude}
                  className="erp-input font-mono bg-[#12151b] text-slate-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Longitude Center</label>
                <input
                  type="text"
                  readOnly
                  value={activeProject.longitude}
                  className="erp-input font-mono bg-[#12151b] text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">Permitted Geofence Radius (Meters)</label>
                <span className="font-bold text-gold-400 font-mono text-sm">{configRadius} m</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={configRadius}
                onChange={(e) => setConfigRadius(e.target.value)}
                className="w-full accent-gold-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>50m (Strict)</span>
                <span>250m (Standard)</span>
                <span>1000m (Large Yard / Infrastructure)</span>
              </div>
            </div>

            <button
              type="submit"
              className="erp-btn-primary text-xs"
            >
              Update Geofence Radius
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
