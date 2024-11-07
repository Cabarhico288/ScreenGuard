import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Animated, Image, Text, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import _ChildList from '../(Parenttabs)/ChildList'; // Adjust the import path as necessary
import SearchBar from '../(Parenttabs)/SearchBar'; // Adjust the import path as necessary
import LocationMap from '../components/Map'; // Import the LocationMap component

const { height, width } = Dimensions.get('window');

const Child: React.FC = () => {
  const [containerHeight, setContainerHeight] = useState(new Animated.Value(0));
  const [isContainerVisible, setIsContainerVisible] = useState(false);
  const latitude = 10.243302;
  const longitude = 123.788994;

  const toggleContainer = () => {
    if (isContainerVisible) {
      Animated.timing(containerHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsContainerVisible(false));
    } else {
      setIsContainerVisible(true);
      Animated.timing(containerHeight, {
        toValue: height * 0.8, // Adjust the height as needed
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.mainContent} pointerEvents="box-none">
        <SearchBar />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8e8d8d',
  },
  mainContent: {
    flex: 1,
    backgroundColor: 'transparent', // Make gradient background transparent
  },
  container: {
    width: width * 0.95, // Adjust the width as needed (95% of the screen width)
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 50,
    marginLeft: '2.5%', // Center align container
    borderRadius: 15, // Rounded corners
    overflow: 'hidden', // Prevents overflow
  },
  childContainer: {
    flexDirection: 'row',
    width: 110,
    alignItems: 'center',
    backgroundColor: 'white', // Background color
    padding: 1, // Padding around the container
    borderRadius: 50, // Rounded corners
    shadowColor: '#000', // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 4, // Shadow radius
    elevation: 5, // Android shadow
    marginLeft: 20, // Adjust the margin
    marginTop: 10, // Margin from the top
  },
  childImage: {
    width: 30, // Adjust the image width
    height: 30, // Adjust the image height
    marginRight: 10, // Space between image and text
  },
  childText: {
    fontSize: 16, // Font size
    fontWeight: 'bold', // Font weight
    color: '#333', // Text color
  },
});

export default Child;
