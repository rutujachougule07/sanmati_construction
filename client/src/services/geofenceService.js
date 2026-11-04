// SANMATI CONSTRUCTIONS ERP - GPS Geofencing Service
import { calculateHaversineDistance } from '../utils/formatters';

/**
 * Get Current Device GPS Position
 */
export const getCurrentGPSPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser or device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: new Date(position.timestamp).toISOString()
        });
      },
      (error) => {
        let msg = "Failed to obtain GPS fix.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "GPS location permission was denied. Please allow location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Location information is unavailable from your device.";
            break;
          case error.TIMEOUT:
            msg = "The request to get user location timed out.";
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  });
};

/**
 * Verify if coordinates are inside project geofence
 */
export const verifyGeofence = (userLat, userLng, projectLat, projectLng, radiusMeters = 250) => {
  const distance = calculateHaversineDistance(userLat, userLng, projectLat, projectLng);
  const isInside = distance <= radiusMeters;
  return {
    isInside,
    distanceMeters: Math.round(distance),
    radiusMeters,
    variance: Math.round(distance - radiusMeters)
  };
};
