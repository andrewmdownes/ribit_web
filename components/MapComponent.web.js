// components/MapComponent.web.js - Web fallback
import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

// Web fallback map component
export const MapComponent = ({ mapRef, style, region, onRegionChangeComplete, children, ...props }) => {
  const handleOpenInMaps = () => {
    if (region) {
      const googleMapsUrl = `https://www.google.com/maps/@${region.latitude},${region.longitude},15z`;
      Linking.openURL(googleMapsUrl);
    }
  };

  return (
    <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 10, textAlign: 'center' }}>
        Maps not available on web
      </Text>
      {region && (
        <TouchableOpacity 
          onPress={handleOpenInMaps}
          style={{ 
            backgroundColor: '#5DBE62', 
            paddingHorizontal: 20, 
            paddingVertical: 10, 
            borderRadius: 8 
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Open in Google Maps
          </Text>
        </TouchableOpacity>
      )}
      {region && (
        <Text style={{ fontSize: 12, color: '#999', marginTop: 8, textAlign: 'center' }}>
          Lat: {region.latitude.toFixed(4)}, Lng: {region.longitude.toFixed(4)}
        </Text>
      )}
    </View>
  );
};

// Web fallback marker component
export const Marker = ({ coordinate, title, description, children, ...props }) => {
  // Return null since we can't render markers on web fallback
  return null;
};

// Web fallback polyline component
export const Polyline = ({ coordinates, strokeColor, strokeWidth, ...props }) => {
  // Return null since we can't render polylines on web fallback
  return null;
};

// Export a function to check if maps are available
export const isMapsAvailable = () => false;