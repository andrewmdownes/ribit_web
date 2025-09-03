// components/MapComponent.native.js - For iOS and Android
import React from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';

// Native map component that uses react-native-maps
export const MapComponent = ({ mapRef, style, region, onRegionChangeComplete, children, ...props }) => {
  return (
    <MapView
      ref={mapRef}
      style={style}
      region={region}
      onRegionChangeComplete={onRegionChangeComplete}
      {...props}
    >
      {children}
    </MapView>
  );
};

// Export map components
export { Marker, Polyline };

// Export a function to check if maps are available
export const isMapsAvailable = () => true;