import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Text, View } from '../../components/Themed';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ExpenseItem from '../../components/ExpenseItem';
import { getExpenses, listenExpenses } from '../../services/firebaseService';
import { useTheme } from '../../context/theme';

export default function AllExpensesScreen() {
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const expensesDataRaw = await getExpenses();
      const expensesData = expensesDataRaw.map(exp => ({
        ...exp,
        createdAt: exp.createdAt?.toDate ? exp.createdAt.toDate().toISOString() : exp.createdAt,
        updatedAt: exp.updatedAt?.toDate ? exp.updatedAt.toDate().toISOString() : exp.updatedAt,
      }));
      setExpenses(expensesData);
      setFilteredExpenses(expensesData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      Alert.alert('Error', 'Could not load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = listenExpenses(null, (expensesLive) => {
      const expensesData = expensesLive.map(exp => ({
        ...exp,
        createdAt: exp.createdAt?.toDate ? exp.createdAt.toDate().toISOString() : exp.createdAt,
      }));
      setExpenses(expensesData);
      setFilteredExpenses(prev => {
        if (statusFilter === 'all') return expensesData;
        return expensesData.filter(e => e.status === statusFilter);
      });
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredExpenses(expenses);
    } else {
      setFilteredExpenses(expenses.filter(expense => expense.status === statusFilter));
    }
  }, [statusFilter, expenses]);

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
      <Card style={styles.filterCard}>
        <Text style={styles.sectionTitle}>Filter by Status</Text>
        <RNView style={styles.filterButtons}>
          <Button
            title="All"
            onPress={() => setStatusFilter('all')}
            variant={statusFilter === 'all' ? 'primary' : 'outline'}
            style={styles.filterButton}
          />
          <Button
            title="Outstanding"
            onPress={() => setStatusFilter('Outstanding')}
            variant={statusFilter === 'Outstanding' ? 'primary' : 'outline'}
            style={styles.filterButton}
          />
          <Button
            title="Pending"
            onPress={() => setStatusFilter('Pending')}
            variant={statusFilter === 'Pending' ? 'primary' : 'outline'}
            style={styles.filterButton}
          />
          <Button
            title="Received"
            onPress={() => setStatusFilter('Received')}
            variant={statusFilter === 'Received' ? 'primary' : 'outline'}
            style={styles.filterButton}
          />
          <Button
            title="Spent"
            onPress={() => setStatusFilter('Spent')}
            variant={statusFilter === 'Spent' ? 'primary' : 'outline'}
            style={styles.filterButton}
          />
        </RNView>
      </Card>

      <Card style={styles.expensesCard}>
        <RNView style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Expenses</Text>
          <Button 
            title="Add Expense" 
            onPress={() => router.push('/new-expense')}
            variant="outline"
            style={styles.addButton}
          />
        </RNView>
        
        {filteredExpenses.length === 0 ? (
          <RNView style={styles.emptyState}>
            <FontAwesome5 name="receipt" size={24} color={colors.text} />
            <Text style={styles.emptyText}>No expenses found</Text>
            <Text style={[styles.emptySubtext, { color: colors.text }]}>
              {statusFilter === 'all' 
                ? 'Add expenses to track your sremaining'
                : `No expenses with status "${statusFilter}"`}
            </Text>
          </RNView>
        ) : (
          filteredExpenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              title={expense.title}
              amount={expense.amount}
              status={expense.status}
              assignedTo={expense.assignedTo}
              onPress={() => router.push(`/expense/${expense.id}`)}
            />
          ))
        )}
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
  filterCard: {
    margin: 16,
    marginBottom: 8,
  },
  expensesCard: {
    margin: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    minWidth: 120,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  filterButton: {
    flex: 0,
    minWidth: '30%',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 