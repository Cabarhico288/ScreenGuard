import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';

// Function to get the profile image source based on the iconId
const getProfileImageSource = (iconId) => {
  switch (iconId) {
    case 'profile1':
      return require('../../assets/images/child/profile1.png');
    case 'profile2':
      return require('../../assets/images/child/profile2.png');
    case 'profile3':
      return require('../../assets/images/child/profile3.png');
    case 'profile4':
      return require('../../assets/images/child/profile4.png');
    default:
      return require('../../assets/images/child/profile1.png'); // Default image
  }
};

interface ChildHeaderProps {
  childDetails: {
    firstName: string;
    lastName: string;
    profileIcon: string; // Icon ID like 'profile1', 'profile2', etc.
  };
}

const ChildHeader: React.FC<ChildHeaderProps> = ({ childDetails }) => {
  const { firstName = 'Unknown', lastName = 'Child', profileIcon } = childDetails || {}; // Safe destructure with defaults

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Image
          style={styles.avatar}
          source={getProfileImageSource(profileIcon)} // Use the getProfileImageSource function
        />
        <View style={styles.textContainer}>
          <Text style={styles.greetingText}>{`${firstName} ${lastName}`}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: 190,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#99e995',
  },
  textContainer: {
    marginTop: 10, // Space between avatar and text
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
});

export default ChildHeader;
