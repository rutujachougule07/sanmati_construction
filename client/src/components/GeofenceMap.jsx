// GeofenceMap Component
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ShieldCheck, AlertTriangle } from 'lucide-react';
import { calculateHaversineDistance } from '../utils/formatters';

// Fix Leaflet Default Icon path bug in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Gold Icon for Project Site
const siteIcon = new L.DivIcon({
  className: 'custom-site-icon',
  html: `<div style="background-color: #d4af37; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #12151a; box-shadow: 0 0 10px rgba(212,175,55,0.7); display: flex; align-items: center; justify-content: center; color: black; font-weight: bold; font-size: 13px;">🏗️</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Custom Blue Icon for User GPS
const userIcon = new L.DivIcon({
  className: 'custom-user-icon',
  html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(59,130,246,0.8); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">📍</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export const GeofenceMap = ({
  projectLat = 16.7028,
  projectLng = 74.2405,
  geofenceRadius = 250,
  projectName = "Site",
  userLat = null,
  userLng = null,
  userName = "Authorized User",
  accuracy = 5
}) => {
  const center = [projectLat, projectLng];
  const hasUserCoords = userLat && userLng;
  const distance = hasUserCoords ? calculateHaversineDistance(userLat, userLng, projectLat, projectLng) : null;
  const isInside = distance !== null ? distance <= geofenceRadius : null;

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-[#28303d] shadow-inner bg-[#12151a]">
      {/* Map Information Overlay Bar */}
      <div className="absolute top-3 left-3 z-[1000] bg-[#161a22]/90 backdrop-blur-md p-3 rounded-lg border border-[#2d3747] text-xs max-w-xs shadow-xl">
        <div className="flex items-center gap-1.5 text-gold-400 font-bold mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>{projectName}</span>
        </div>
        <div className="text-slate-300 text-[11px] space-y-0.5">
          <p>Coordinates: {projectLat.toFixed(4)}° N, {projectLng.toFixed(4)}° E</p>
          <p>Geofence Radius: <span className="font-semibold text-white">{geofenceRadius} meters</span></p>
          {distance !== null && (
            <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span>Distance to Center:</span>
              <span className={`font-bold ${isInside ? 'text-emerald-400' : 'text-rose-400'}`}>
                {Math.round(distance)} m
              </span>
            </div>
          )}
        </div>
        {isInside !== null && (
          <div className={`mt-2 px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 ${
            isInside ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50' : 'bg-rose-950/80 text-rose-300 border border-rose-700/50'
          }`}>
            {isInside ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {isInside ? 'Authorized: Within Site Geofence' : 'Outside Permitted Geofence'}
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Project Site Marker */}
        <Marker position={[projectLat, projectLng]} icon={siteIcon}>
          <Popup>
            <div className="text-slate-900 text-xs font-sans">
              <strong className="text-amber-800">{projectName}</strong><br />
              Center Coordinates: {projectLat}, {projectLng}<br />
              Geofence Radius: {geofenceRadius}m
            </div>
          </Popup>
        </Marker>

        {/* Geofence Perimeter Circle */}
        <Circle
          center={[projectLat, projectLng]}
          radius={geofenceRadius}
          pathOptions={{
            color: '#d4af37',
            fillColor: '#d4af37',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '4, 6'
          }}
        />

        {/* User GPS Pin (if available) */}
        {hasUserCoords && (
          <>
            <Marker position={[userLat, userLng]} icon={userIcon}>
              <Popup>
                <div className="text-slate-900 text-xs font-sans">
                  <strong>{userName}</strong><br />
                  Accuracy: ±{accuracy}m<br />
                  Distance: {Math.round(distance)}m from site
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[userLat, userLng]}
              radius={Math.max(5, accuracy)}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.2,
                weight: 1
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};
