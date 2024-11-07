import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import FlashMessage from 'react-native-flash-message';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth } from './application/firebase';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { startBackgroundUpload, stopBackgroundUpload } from './application/services/backgroundTask';
import { requestUsagePermission, stopMonitoringApps } from './application/services/AppMonitoringService';
import BlockingScreen from './application/components/BlockingScreen';
import { NativeModules } from 'react-native';

// Import your screens
import GetStarted from './application/screens/GetStarted';
import TermsAndConditions from './application/screens/TermsAndConditions';
import RoleSelection from './application/screens/roleSelection';
import _ParentLayout from './application/_Parentlayout';
import _ChildLayout from './application/_Childlayout';
import PHome from './application/(ParentScreens)/index';
import Child from './application/(ParentScreens)/Location';
import Notifications from './application/(ParentScreens)/notifications';
import ManageChildScreen from './application/(ParentScreens)/Managechild';
import SetSchedule from './application/(Parenttabs)/Schedule';
import RealtimeMonitor from './application/(Parenttabs)/Monitor';
import AccountSetting from './application/components/Account';
import Setting from './application/components/Profile';
import About from './application/components/About';
import AuthForm from './application/screens/ChooseAccount';
import LoadingScreen from './application/components/LoadingScreen';
import ChooseAccountScreen from './application/screens/ChooseAccount';
// Initialize Stack Navigator
const Stack = createNativeStackNavigator();
const { AppBlockerModule } = NativeModules; // Use AppBlockerModule instead of AppUsageModule

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppBlocked, setIsAppBlocked] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Request usage access permission from the user
        await requestUsagePermission();
  
        // Initialize restricted apps using the AppBlockerModule
        console.log('Initializing restricted apps...');
        await AppBlockerModule.initializeRestrictedApps()
          .then((result: string) => {
            console.log(result); // Logs: "Schedules initialized with X schedules" or "No schedules found for child UID"
          })
          .catch((error: any) => {
            console.error('Error initializing restricted apps:', error);
          });
  
        // Retrieve user token and role from AsyncStorage
        const storedUserToken = await AsyncStorage.getItem('userToken');
        const storedUserRole = await AsyncStorage.getItem('userRole');
  
        if (storedUserToken && storedUserRole) {
          setIsLoggedIn(true);
          setUserRole(storedUserRole);
  
          // Only start background monitoring if the user role is "child"
          if (storedUserRole === 'child') {
            console.log('User role is child, starting background tasks...');
  
            // Start the background upload task for child accounts
            await startBackgroundUpload();
  
            // Periodically check if a restricted app is open and redirect or notify accordingly
            const intervalId = setInterval(async () => {
              try {
                // Call the function to redirect if a scheduled app is open and blocked
                await AppBlockerModule.redirectIfScheduledAppIsOpen()
                  .catch((error: any) => {
                    console.error('Error during app redirection monitoring:', error);
                  });
  
                // Call the function to notify if a previously blocked app is now allowed
                await AppBlockerModule.notifyIfAppIsAllowed()
                  .then((message: string) => {
                    console.log(message); // Log the message when the app is allowed
                  })
                  .catch((error: any) => {
                    console.error('Error during app allowed notification:', error);
                  });
              } catch (error) {
                console.error('Error during app monitoring:', error);
              }
            }, 5000); // Check every 5 seconds
  
            // Cleanup interval on component unmount
            return () => clearInterval(intervalId);
          } else {
            console.log('User role is not child, skipping background tasks.');
          }
        } else {
          console.warn('User token or role is missing from AsyncStorage.');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false); // Stop loading once initialization is complete
        console.log('Initialization complete, loading state set to false.');
      }
    };
  
    initializeApp(); // Call the initialization function
  
    // Cleanup function to stop background tasks when the component unmounts
    return () => {
      console.log('Cleaning up background tasks...');
      stopBackgroundUpload();
      stopMonitoringApps();
    };
  }, []);
  
  
  

  if (loading) {
    return <LoadingScreen />;
  }
  if (isAppBlocked) {
    return <BlockingScreen onClose={() => setIsAppBlocked(false)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={
            isLoggedIn
              ? userRole === 'parent'
                ? '_parentLayout'
                : '_childLayout'
              : 'GetStarted'
          }
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="GetStarted" component={GetStarted} />
          <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
          <Stack.Screen name="RoleSelection" component={RoleSelection} />
          <Stack.Screen name="_parentLayout" component={_ParentLayout} />
          <Stack.Screen name="_childLayout" component={_ChildLayout} />
          <Stack.Screen name="index" component={PHome} />
          <Stack.Screen name="child" component={Child} />
          <Stack.Screen name="notifications" component={Notifications} />
          <Stack.Screen name="ManageChild" component={ManageChildScreen} />
          <Stack.Screen name="SetSchedule" component={SetSchedule} />
          <Stack.Screen name="RealtimeMonitor" component={RealtimeMonitor} />
          <Stack.Screen name="AccountSetting" component={AccountSetting} />
          <Stack.Screen name="Setting" component={Setting} />
          <Stack.Screen name="About" component={About} />
          <Stack.Screen name="AuthForm" component={AuthForm} />
          <Stack.Screen name="ChooseAccount" component={ChooseAccountScreen} />
        </Stack.Navigator>
        <FlashMessage position="top" />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
