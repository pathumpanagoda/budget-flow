import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, Alert, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, View } from '../../components/Themed';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { getFunders, addFunder, deleteFunder } from '../../services/sqliteService'; // updateFunder might not be used or needed
import { useTheme } from '../../context/theme';

export default function FundersScreen() {
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [funders, setFunders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFunderName, setNewFunderName] = useState('');
  // const [newFunderPhone, setNewFunderPhone] = useState(''); // Not in SQLite
  // const [newFunderEmail, setNewFunderEmail] = useState(''); // Not in SQLite
  const [newFunderAmount, setNewFunderAmount] = useState(''); // Added for SQLite 'amount'

  const fetchFunders = async () => {
    try {
      setLoading(true);
      const fundersData = await getFunders(); // sqliteService returns array
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
    const name = newFunderName.trim();
    const amount = parseFloat(newFunderAmount);

    if (!name) {
      Alert.alert('Error', 'Please enter a funder name');
      return;
    }
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Please enter a valid positive amount');
      return;
    }

    try {
      // addFunder in sqliteService expects {id, name, amount}
      await addFunder({
        id: Date.now().toString(), // Temporary ID, consider uuid
        name,
        amount,
      });
      
      setNewFunderName('');
      setNewFunderAmount('');
      // setNewFunderPhone('');
      // setNewFunderEmail('');
      setShowAddForm(false);
      await fetchFunders(); // Re-fetch to get the new list
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
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
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            }]}
            value={newFunderName}
            onChangeText={setNewFunderName}
            placeholder="Enter funder name"
            placeholderTextColor={colors.text}
          />

          <Text style={[styles.label, { color: colors.textOnSurface }]}>Amount</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            }]}
            value={newFunderAmount}
            onChangeText={setNewFunderAmount}
            placeholder="Enter amount funded"
            placeholderTextColor={colors.text}
            keyboardType="numeric"
          />

          {/* Phone and Email fields removed */}

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
            <FontAwesome5 name="users" size={36} color={colors.text} />
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
                <FontAwesome5 name="trash" size={16} color={colors.error} />
              </TouchableOpacity>
            </RNView>
            <Text style={[styles.funderDetail, { color: colors.textOnSurface }]}>
              Amount: Rs. {funder.amount ? funder.amount.toLocaleString() : '0'}
            </Text>
            {funder.createdAt && (
              <Text style={[styles.funderDetail, { color: colors.textMuted }]}>
                Added: {new Date(funder.createdAt).toLocaleDateString()}
              </Text>
            )}
            {/* Phone and Email details removed */}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
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
    marginTop: 4,
  },
}); 