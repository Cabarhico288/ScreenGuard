export type RootStackParamList = {
  GetStarted: undefined;
  TermsAndConditions: undefined;
  RoleSelection: undefined;
  Home: undefined;
  Location: undefined;
  Notification: undefined;
  Child: undefined;
  _parentLayout: undefined;
  _ChildLayout: undefined;
  PHome: undefined;
  ManageChild: {
    childUUID: string;
    childDetails: {
      firstName: string;
      lastName: string;
      profileIcon: string;
    };
  };
  SetSchedule: undefined;
  RealtimeMonitor: undefined;
  AccountSetting: undefined;  // Add this
  Setting: undefined;  // Add this
  About: undefined;
  ChildDashboard: { childUUID: string };
  LoadingScreen: undefined;
  ChooseAccount: undefined;
  AuthForm: { selectedRole: 'parent' | 'child' };
};

