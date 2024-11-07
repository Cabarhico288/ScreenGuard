import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GetStarted from './application/screens/GetStarted'; // Web-specific screen component
import TermsAndConditions from './application/screens/TermsAndConditions';
import RoleSelection from './application/screens/roleSelection';
import _ParentLayout from './application/_Parentlayout';
import ManageChildScreen from './application/(ParentScreens)/Managechild'; 
import 'leaflet/dist/leaflet.css';
import AuthForm from './application/screens/ChooseAccount';
import _ChildLayout from './application/_Childlayout';
const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="GetStarted" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GetStarted" component={GetStarted} />
        <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
        <Stack.Screen name="RoleSelection" component={RoleSelection} />
         <Stack.Screen name="_parentLayout" component={_ParentLayout} />
         <Stack.Screen name="ManageC  hild" component={ManageChildScreen} />
         <Stack.Screen name="AuthForm" component={AuthForm} /> 
         <Stack.Screen name="_childLayout" component={_ChildLayout} />
        {/* Add other screens as needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
