import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '../../components/Themed';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { getFunders, addFunder, updateFunder, deleteFunder } from '../../services/firebaseService';

export default function FundersScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [funders, setFunders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFunderName, setNewFunderName] = useState('');
  const [newFunderPhone, setNewFunderPhone] = useState('');
  const [newFunderEmail, setNewFunderEmail] = useState('');

  const fetchFunders = async () => {
    try {
      setLoading(true);
      const fundersData = await getFunders();
      setFunders(fundersData);
    } catch (error) {
      console.error('Error fetching funders:', error);
      Alert.alert('Error', 'Could not load funders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFunders();
    setRefreshing(false);
  };

  const handleAddFunder = async () => {
    if (!newFunderName.trim()) {
      Alert.alert('Error', 'Please enter a funder name');
      return;
    }

    try {
      await addFunder({
        name: newFunderName.trim(),
        phone: newFunderPhone.trim(),
        email: newFunderEmail.trim(),
      });
      
      setNewFunderName('');
      setNewFunderPhone('');
      setNewFunderEmail('');
      setShowAddForm(false);
      await fetchFunders();
      Alert.alert('Success', 'Funder added successfully');
    } catch (error) {
      console.error('Error adding funder:', error);
      Alert.alert('Error', 'Could not add funder. Please try again.');
    }
  };

  const handleDeleteFunder = (funderId) => {
    Alert.alert(
      'Delete Funder',
      'Are you sure you want to delete this funder?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFunder(funderId);
              await fetchFunders();
              Alert.alert('Success', 'Funder deleted successfully');
            } catch (error) {
              console.error('Error deleting funder:', error);
              Alert.alert('Error', 'Could not delete funder. Please try again.');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchFunders();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
  <ActivityIndicator size="large" color="#64a12d" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.headerCard}>
        <Text style={styles.title}>Funders</Text>
        <Button
          title={showAddForm ? "Cancel" : "+ Add Funder"}
          onPress={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? "outline" : "primary"}
          style={styles.addButton}
        />
      </Card>

      {showAddForm && (
        <Card style={styles.formCard}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={newFunderName}
            onChangeText={setNewFunderName}
            placeholder="Enter funder name"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Phone (Optional)</Text>
          <TextInput
            style={styles.input}
            value={newFunderPhone}
            onChangeText={setNewFunderPhone}
            placeholder="Enter phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput
            style={styles.input}
            value={newFunderEmail}
            onChangeText={setNewFunderEmail}
            placeholder="Enter email address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button
            title="Add Funder"
            onPress={handleAddFunder}
            style={styles.submitButton}
          />
        </Card>
      )}

      {funders.length === 0 ? (
        <Card style={styles.emptyCard}>
          <RNView style={styles.emptyState}>
            <FontAwesome5 name="users" size={36} color="#757575" />
            <Text style={styles.emptyText}>No funders yet</Text>
            <Text style={styles.emptySubtext}>
              Add funders to assign them to expenses
            </Text>
          </RNView>
        </Card>
      ) : (
        funders.map((funder) => (
          <Card key={funder.id} style={styles.funderCard}>
            <RNView style={styles.funderHeader}>
              <Text style={styles.funderName}>{funder.name}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteFunder(funder.id)}
                style={styles.deleteButton}
              >
                <FontAwesome5 name="trash" size={16} color="#E53935" />
              </TouchableOpacity>
            </RNView>
            {funder.phone && (
              <Text style={styles.funderDetail}>
                <FontAwesome5 name="phone" size={14} color="#757575" /> {funder.phone}
              </Text>
            )}
            {funder.email && (
              <Text style={styles.funderDetail}>
                <FontAwesome5 name="envelope" size={14} color="#757575" /> {funder.email}
              </Text>
            )}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    margin: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    minWidth: 120,
  },
  formCard: {
    margin: 16,
    marginTop: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#212121',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  submitButton: {
    marginTop: 8,
  },
  emptyCard: {
    margin: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  funderCard: {
    margin: 16,
    marginTop: 0,
  },
  funderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  funderName: {
    fontSize: 18,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  funderDetail: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
}); 