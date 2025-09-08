import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import ApprovalListScreen from '../screens/approvals/ApprovalListScreen';
import ApprovalDetailScreen from '../screens/approvals/ApprovalDetailScreen';
import NotificationScreen from '../screens/NotificationScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ApprovalStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ApprovalList" 
      component={ApprovalListScreen}
      options={{ title: '결재 대기' }}
    />
    <Stack.Screen 
      name="ApprovalDetail" 
      component={ApprovalDetailScreen}
      options={{ title: '정산결의서 상세' }}
    />
  </Stack.Navigator>
);

const MainNavigator: React.FC = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Approvals') {
            iconName = 'approval';
          } else if (route.name === 'Notifications') {
            iconName = 'notifications';
          } else {
            iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: '대시보드' }}
      />
      
      {(user?.role === 'REPRESENTATIVE' || user?.role === 'VICE_REPRESENTATIVE' || user?.role === 'ADMIN') && (
        <Tab.Screen 
          name="Approvals" 
          component={ApprovalStack}
          options={{ title: '결재' }}
        />
      )}
      
      <Tab.Screen 
        name="Notifications" 
        component={NotificationScreen}
        options={{ title: '알림' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
