// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import AccountSetting from './application/components/Account'; // Adjust the import path as needed
import Setting from './application/components/Profile'; // Adjust the import path as needed
import About from './application/components/About';
import AuthForm from './application/screens/ChooseAccount';
const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="GetStarted" screenOptions={{ headerShown: false }}>
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
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;