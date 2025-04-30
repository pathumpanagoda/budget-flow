import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, RefreshControl, Alert, StatusBar } from 'react-native';
import { Text, View } from '../../components/Themed';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import BudgetSummary from '../../components/BudgetSummary';
import Card from '../../components/Card';
import Button from '../../components/Button';
import CategoryItem from '../../components/CategoryItem';
import ExpenseItem from '../../components/ExpenseItem';
import { getCategories, getExpenses, getBudgetSummary } from '../../services/firebaseService';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudget: 0,
    receivedFund: 0,
  });
  const [statusTotals, setStatusTotals] = useState({
    pending: 0,
    tookOver: 0,
    done: 0,
    utilized: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [budgetData, expensesData, categoriesData] = await Promise.all([
        getBudgetSummary(),
        getExpenses(),
        getCategories()
      ]);
      
      // Calculate total budget as sum of all expenses
      const totalBudget = expensesData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      // Calculate received fund as sum of expenses with status "Done"
      const receivedFund = expensesData
        .filter(expense => expense.status === 'Done')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      setBudgetSummary({
        totalBudget,
        receivedFund,
      });
      
      // Calculate totals for each status
      const totals = {
        pending: 0,
        tookOver: 0,
        done: 0,
        utilized: 0,
      };
      
      expensesData.forEach(expense => {
        if (expense.status === 'Pending') {
          totals.pending += expense.amount;
        } else if (expense.status === 'Took Over') {
          totals.tookOver += expense.amount;
        } else if (expense.status === 'Done') {
          totals.done += expense.amount;
        } else if (expense.status === 'Utilized') {
          totals.utilized += expense.amount;
        }
      });
      
      setStatusTotals(totals);
      
      // Calculate totals for each category
      const categoriesWithTotals = categoriesData.map(category => {
        const categoryExpenses = expensesData.filter(expense => expense.categoryId === category.id);
        const totalAmount = categoryExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const expenseCount = categoryExpenses.length;
        
        return {
          ...category,
          totalAmount,
          expenseCount
        };
      });
      
      setCategories(categoriesWithTotals);
      setRecentExpenses(expensesData.slice(0, 5)); // Get only 5 most recent expenses
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Could not load data. Please try again.');
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
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F6E66" />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0F6E66"
        translucent={false}
      />
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <BudgetSummary
        totalBudget={budgetSummary.totalBudget}
        receivedFund={budgetSummary.receivedFund}
      />
      
      <Card style={styles.sectionCard}>
        <RNView style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Expense Status</Text>
        </RNView>
        <RNView style={styles.statusCardsContainer}>
          <RNView style={[styles.statusCard, { backgroundColor: '#E0E0E0' }]}>
            <Text style={styles.statusAmount}>Rs. {(statusTotals.pending || 0).toLocaleString()}</Text>
            <Text style={styles.statusLabel}>Pending</Text>
          </RNView>
          <RNView style={[styles.statusCard, { backgroundColor: '#FFE0B2' }]}>
            <Text style={styles.statusAmount}>Rs. {(statusTotals.tookOver || 0).toLocaleString()}</Text>
            <Text style={styles.statusLabel}>Took Over</Text>
          </RNView>
          <RNView style={[styles.statusCard, { backgroundColor: '#C8E6C9' }]}>
            <Text style={styles.statusAmount}>Rs. {(statusTotals.done || 0).toLocaleString()}</Text>
            <Text style={styles.statusLabel}>Done</Text>
          </RNView>
          <RNView style={[styles.statusCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.statusAmount}>Rs. {(statusTotals.utilized || 0).toLocaleString()}</Text>
            <Text style={styles.statusLabel}>Utilized</Text>
          </RNView>
        </RNView>
      </Card>
      
      <Card style={styles.sectionCard}>
        <RNView style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Button 
            title="Add Category" 
            onPress={() => router.push('/new-category')}
            variant="outline"
            style={styles.addButton}
          />
        </RNView>
        
        {categories.length === 0 ? (
          <RNView style={styles.emptyState}>
            <FontAwesome5 name="list" size={24} color="#757575" />
            <Text style={styles.emptyText}>No categories yet</Text>
            <Text style={styles.emptySubtext}>Add categories to organize your expenses</Text>
          </RNView>
        ) : (
          categories.slice(0, 3).map((category) => (
            <CategoryItem
              key={category.id}
              name={category.name}
              totalExpenses={category.expenseCount || 0}
              totalAmount={category.totalAmount || 0}
              onPress={() => router.push(`/category/${category.id}`)}
            />
          ))
        )}
        
        {categories.length > 3 && (
          <Button
            title="View All Categories"
            onPress={() => router.push('/category')}
            variant="outline"
            style={styles.viewAllButton}
          />
        )}
      </Card>
      
      <Card style={styles.sectionCard}>
        <RNView style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <Button 
            title="Add Expense" 
            onPress={() => router.push('/new-expense')}
            variant="outline"
            style={styles.addButton}
          />
        </RNView>
        
        {recentExpenses.length === 0 ? (
          <RNView style={styles.emptyState}>
            <FontAwesome5 name="receipt" size={24} color="#757575" />
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubtext}>Add expenses to track your spending</Text>
          </RNView>
        ) : (
          recentExpenses.map((expense) => (
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
        
        {recentExpenses.length > 0 && (
          <Button
            title="View All Expenses"
            onPress={() => router.push('/all-expenses')}
            variant="outline"
            style={styles.viewAllButton}
          />
        )}
      </Card>
    </ScrollView>
    </>
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
  sectionCard: {
    marginTop: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  viewAllButton: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  statusCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusCard: {
    flex: 1,
    minWidth: '48%',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statusAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
  },
}); 