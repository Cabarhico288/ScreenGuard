import Home from './(Childscreens)';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChildSidebar from './components/ChildSidebar';

const { width } = Dimensions.get('window');

const _ChildLayout: React.FC<{ deviceId: string }> = ({ deviceId }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarPosition = useState(new Animated.Value(-width * 0.75))[0];

  useEffect(() => {
    Animated.timing(sidebarPosition, {
      toValue: sidebarVisible ? 0 : -width * 0.75,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [sidebarVisible]);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <View style={styles.container}>
      {/* Directly render the Home component */}
      <Home />
      {/* Sidebar toggle button */}
      <TouchableOpacity onPress={toggleSidebar} style={styles.profileButton}>
        <Ionicons name="reorder-three-outline" size={40} color="#8e8d8d" />
      </TouchableOpacity>

      {/* Sidebar */}
      <ChildSidebar sidebarPosition={sidebarPosition} toggleSidebar={toggleSidebar} deviceId={deviceId} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  profileButton: {
    position: 'absolute',
    top: 6,
    right: 20,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
});

export default _ChildLayout;
