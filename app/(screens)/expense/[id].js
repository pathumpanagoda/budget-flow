import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Text, View } from '../../../components/Themed';
import { router, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { getExpense, deleteExpense } from '../../../services/firebaseService';
import { useTheme } from '../../../context/theme';

export default function ExpenseDetailScreen() {
  const { colors, isDarkMode } = useTheme();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expense, setExpense] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const expenseData = await getExpense(id);
      if (!expenseData) {
        Alert.alert('Error', 'Expense not found');
        router.back();
        return;
      }
      setExpense(expenseData);
    } catch (error) {
      console.error('Error fetching expense data:', error);
      Alert.alert('Error', 'Could not load expense data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(id);
              Alert.alert('Success', 'Expense deleted successfully');
              router.back();
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Could not delete expense. Please try again.');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Received':
        return colors.success;
      case 'Pending':
        return colors.warning;
      default:
        return colors.text;
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.expenseCard}>
        <Text style={styles.expenseTitle}>{expense?.title}</Text>
        <Text style={[styles.expenseAmount, { color: colors.primary }]}>Rs. {expense?.amount?.toLocaleString()}</Text>
        
        <RNView style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={[styles.detailValue, { color: getStatusColor(expense?.status) }]}>
            {expense?.status}
          </Text>
        </RNView>

        {expense?.assignedTo && (
          <RNView style={styles.detailRow}>
            <Text style={styles.detailLabel}>Assigned To:</Text>
            <Text style={styles.detailValue}>{expense.assignedTo}</Text>
          </RNView>
        )}

        {expense?.notes && (
          <RNView style={styles.notesSection}>
            <Text style={styles.detailLabel}>Notes:</Text>
            <Text style={styles.notes}>{expense.notes}</Text>
          </RNView>
        )}

        <RNView style={styles.buttonRow}>
          <Button
            title="Edit"
            onPress={() => router.push({
              pathname: '/edit-expense/[id]',
              params: { id: expense.id }
            })}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Delete"
            onPress={handleDelete}
            variant="danger"
            style={styles.actionButton}
          />
        </RNView>
      </Card>
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
  expenseCard: {
    margin: 16,
  },
  expenseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  expenseAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    minWidth: 100,
  },
  detailValue: {
    fontSize: 16,
    flex: 1,
  },
  notesSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  notes: {
    fontSize: 16,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
}); 