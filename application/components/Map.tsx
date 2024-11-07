import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const LocationMap = ({ latitude, longitude }) => {
  const [region, setRegion] = useState({
    latitude: latitude || 10.243302,  // Latitude for the Philippines
    longitude: longitude || 123.788994, // Longitude for the Philippines
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  return (
    <View style={styles.container}>
     <MapView
      style={styles.map}
      region={region}
      onRegionChangeComplete={setRegion}
      showsUserLocation={true}
      scrollEnabled={true}  // Make sure this is true
      zoomEnabled={true}    // Make sure this is true
      >
        <Marker
          coordinate={{ latitude: latitude, longitude: longitude }}
          title="Child's Location"
          description="This is the current location of your child."
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default LocationMap;
