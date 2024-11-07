import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import ChooseAccount from './ChooseAccount';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

type RoleSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RoleSelection'>;

const RoleSelection: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'parent' | 'child' | null>(null);
  const [showAccountSelection, setShowAccountSelection] = useState<boolean>(false);
  const navigation = useNavigation<RoleSelectionScreenNavigationProp>();

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '731412951458-gnjkf3jgg3fvvhu9j2kph6c9q1amtk3d.apps.googleusercontent.com',
    androidClientId: '731412951458-bnk728dohago51o82n3cgn8qt2n3dsoi.apps.googleusercontent.com',
    webClientId: '731412951458-n0vfjfjd99s80783663sc9p8gufi387c.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('Google Sign-In successful:', authentication);
    }
  }, [response]);

  const handleRolePress = (role: 'parent' | 'child') => {
    setSelectedRole(role);
    navigation.navigate('AuthForm', { selectedRole: role });
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require('../../assets/images/RoleSelection.png')} style={styles.image} />
      </View>
      <Text style={styles.title}>Welcome to ScreenGuard</Text>
      <Text style={styles.subtitle}>Please select your role</Text>

      <TouchableOpacity
        style={styles.touchable}
        onPress={() => handleRolePress('parent')}
      >
        <LinearGradient
          colors={selectedRole === 'parent' ? ['#0056b3', '#003d80'] : ['#22c1c3', '#dfdfdf']}
          style={styles.button}
        >
          <View style={styles.iconContainer}>
            <FontAwesome name="user-circle-o" size={24} color="#fff" />
          </View>
          <Text style={styles.buttonText}> Parent</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.touchable}
        onPress={() => handleRolePress('child')}
      >
        <LinearGradient
          colors={selectedRole === 'child' ? ['#0056b3', '#003d80'] : ['#22c1c3', '#dfdfdf']}
          style={styles.button}
        >
          <View style={styles.iconContainer}>
            <FontAwesome name="child" size={24} color="#fff" />
          </View>
          <Text style={styles.buttonText}> Child</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
  visible={showAccountSelection}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setShowAccountSelection(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <ChooseAccount route={{ params: { /* pass required params here */ } }} />
    </View>
  </View>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Platform.OS === 'web' ? 'white' : '#f8f8f8', // Adjust background for web
    ...(Platform.OS === 'web' && {
      height: '80%',
      paddingHorizontal: '10%',
    }),
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    width: Platform.OS === 'web' ? '100%' : '130%',
    height: Platform.OS === 'web' ? '40%' : '50%',
    borderBottomEndRadius: 300,
    borderBottomStartRadius: 300,
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: Platform.OS === 'web' ? 250 : 200,
    height: Platform.OS === 'web' ? 350 : 250,
    borderRadius: 125,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 48 : 32,
    fontWeight: 'bold',
    marginTop: Platform.OS === 'web' ? '20%' : '100%',
    color: '#00796b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 22 : 18,
    textAlign: 'center',
    marginVertical: 20,
    color: '#555',
    paddingHorizontal: Platform.OS === 'web' ? '20%' : 0,
    marginTop: Platform.OS === 'web' ? 20 : 10,
  },
  touchable: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  iconContainer: {
    backgroundColor: '#0056b3',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderTopRightRadius: 1000,
    borderBottomRightRadius: 50,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    borderRadius: 25,
    backgroundColor: '#00796b',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  borderRadius:30,
  },
  modalContent: {
   
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
});

export default RoleSelection;
