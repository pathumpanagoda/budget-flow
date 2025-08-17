import { Tabs } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { View as RNView } from 'react-native';
import { Text } from '../../components/Themed';
import { useTheme } from '../../context/theme'; // Make sure you import useTheme

export default function TabsLayout() {
  const { isDarkMode } = useTheme(); // Get the current theme state
  const tabBarActiveColor = '#64a12d';
  const tabBarInactiveColor = '#707070';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveColor,
        tabBarInactiveTintColor: tabBarInactiveColor,
        headerStyle: {
          backgroundColor: isDarkMode ? '#64a12d' : '#64a12d', // Use dark mode vs light mode colors
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#333' : '#fff', // Adjust tab bar background color based on theme
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'BudgetFlow',
          headerTitle: () => (
            <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome5 name="money-bill-wave" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>BudgetFlow</Text>
            </RNView>
          ),
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="list" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="funders"
        options={{
          title: 'Funders',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="users" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="all-expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="receipt" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="chart-pie" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
