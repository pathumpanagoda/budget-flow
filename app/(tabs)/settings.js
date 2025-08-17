import { useState } from 'react';
import { StyleSheet, View as RNView, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { Text, View } from '../../components/Themed';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../context/auth';
import { useTheme } from '../../context/theme';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { user, logOut } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* <Card style={styles.profileCard}>
        {user ? (
          <RNView style={styles.userInfo}>
            <RNView style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{user.email.charAt(0).toUpperCase()}</Text>
            </RNView>
            <RNView style={styles.userTextContainer}>
              <Text style={styles.userName}>{user.email}</Text>
              <Text style={styles.userJoined}>Member since {new Date().toLocaleDateString()}</Text>
            </RNView>
          </RNView>
        ) : (
          <RNView style={styles.loginContainer}>
            <Text style={styles.loginTitle}>Sign In to Your Account</Text>
            <Text style={styles.loginSubtitle}>Sign in to manage your event planning budget</Text>
            <Button 
              title="Sign In / Sign Up" 
              onPress={() => {}} 
              style={styles.loginButton}
            />
          </RNView>
        )}
      </Card> */}

      <Card style={styles.optionsCard}>
        <RNView style={styles.settingItem}>
          <RNView style={styles.settingTextContainer}>
              <MaterialIcons name="notifications" size={24} color="#64a12d" />
            <Text style={styles.settingText}>Notifications</Text>
          </RNView>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
              thumbColor={notifications ? '#64a12d' : '#9E9E9E'}
          />
        </RNView>

        <RNView style={styles.settingItem}>
          <RNView style={styles.settingTextContainer}>
              <MaterialIcons name="dark-mode" size={24} color="#64a12d" />
            <Text style={styles.settingText}>Dark Mode</Text>
          </RNView>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
              thumbColor={isDarkMode ? '#64a12d' : '#9E9E9E'}
          />
        </RNView>
      </Card>

      <Card style={styles.optionsCard}>
  <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/help')}>
          <RNView style={styles.menuTextContainer}>
              <MaterialIcons name="help-outline" size={24} color="#64a12d" />
            <Text style={styles.menuText}>Help & Support</Text>
          </RNView>
          <MaterialIcons name="chevron-right" size={24} color="#9E9E9E" />
        </TouchableOpacity>

  <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/about')}>
          <RNView style={styles.menuTextContainer}>
              <MaterialIcons name="info-outline" size={24} color="#64a12d" />
            <Text style={styles.menuText}>About</Text>
          </RNView>
          <MaterialIcons name="chevron-right" size={24} color="#9E9E9E" />
        </TouchableOpacity>

        {user && (
          <TouchableOpacity style={styles.menuItem} onPress={confirmLogout}>
            <RNView style={styles.menuTextContainer}>
              <MaterialIcons name="logout" size={24} color="#E53935" />
              <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
            </RNView>
          </TouchableOpacity>
        )}
      </Card>

      <Card style={styles.optionsCard}>
        <Text style={styles.devHeader}>Developer</Text>
        <RNView style={styles.devRow}>
            <MaterialIcons name="person" size={22} color="#64a12d" />
          <Text style={styles.devText}>Dilshan Pathum</Text>
        </RNView>
        <TouchableOpacity style={styles.devRow} onPress={() => Linking.openURL('mailto:pathumpanagoda@gmail.com')}>
            <MaterialIcons name="email" size={22} color="#64a12d" />
          <Text style={[styles.devText, styles.devLink]}>pathumpanagoda@gmail.com</Text>
        </TouchableOpacity>
      </Card>

      <Text style={styles.versionText}>Version 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
      backgroundColor: '#64a12d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userTextContainer: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userJoined: {
    fontSize: 14,
    color: '#757575',
  },
  loginContainer: {
    alignItems: 'center',
    padding: 16,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    width: '100%',
  },
  optionsCard: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutText: {
    color: '#E53935',
  },
  versionText: {
    textAlign: 'center',
    color: '#9E9E9E',
    marginTop: 24,
  },
  devHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  devText: {
    fontSize: 15,
  },
  devLink: {
    textDecorationLine: 'underline',
  },
}); 