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
import { useTheme } from '../../context/theme';

export default function HomeScreen() {
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudget: 0,
    receivedFund: 0,
  });
  const [statusTotals, setStatusTotals] = useState({
    remaining: 0,
    pending: 0,
    received: 0,
    spent: 0,
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
      
      // Calculate received fund as sum of expenses with status "Received"
      const receivedFund = expensesData
        .filter(expense => expense.status === 'Received')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      setBudgetSummary({
        totalBudget,
        receivedFund,
      });
      
      // Calculate totals for each status
      const totals = {
        remaining: 0,
        pending: 0,
        received: 0,
        spent: 0,
      };
      
      expensesData.forEach(expense => {
        if (expense.status === 'Outstanding') {
          totals.remaining += expense.amount;
        } else if (expense.status === 'Pending') {
          totals.pending += expense.amount;
        } else if (expense.status === 'Received') {
          totals.received += expense.amount;
        } else if (expense.status === 'Spent') {
          totals.spent += expense.amount;
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
        translucent={false}
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <BudgetSummary
          totalBudget={budgetSummary.totalBudget}
          receivedFund={budgetSummary.receivedFund}
          spent={statusTotals.spent}
        />
        
        <Card style={styles.sectionCard}>
          <RNView style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Expense Status</Text>
          </RNView>
          <RNView style={styles.statusCardsContainer}>
            <RNView style={[styles.statusCard, { backgroundColor: colors.border }]}>
              <Text style={styles.statusAmount}>Rs. {(statusTotals.remaining || 0).toLocaleString()}</Text>
              <Text style={styles.statusLabel}>Outstanding</Text>
            </RNView>
            <RNView style={[styles.statusCard, { backgroundColor: isDarkMode ? 'rgba(255, 224, 178, 0.2)' : '#FFE0B2' }]}>
              <Text style={styles.statusAmount}>Rs. {(statusTotals.pending || 0).toLocaleString()}</Text>
              <Text style={styles.statusLabel}>Pending</Text>
            </RNView>
            <RNView style={[styles.statusCard, { backgroundColor: isDarkMode ? 'rgba(200, 230, 201, 0.2)' : '#C8E6C9' }]}>
              <Text style={styles.statusAmount}>Rs. {(statusTotals.received || 0).toLocaleString()}</Text>
              <Text style={styles.statusLabel}>Received</Text>
            </RNView>
            <RNView style={[styles.statusCard, { backgroundColor: isDarkMode ? 'rgba(227, 242, 253, 0.2)' : '#E3F2FD' }]}>
              <Text style={styles.statusAmount}>Rs. {(statusTotals.spent || 0).toLocaleString()}</Text>
              <Text style={styles.statusLabel}>Spent</Text>
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
              <FontAwesome5 name="list" size={24} color={colors.text} />
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
              <FontAwesome5 name="receipt" size={24} color={colors.text} />
              <Text style={styles.emptyText}>No expenses yet</Text>
              <Text style={styles.emptySubtext}>Add your first expense to get started</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCard: {
    marginTop: 16,
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
  statusCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
  },
  addButton: {
    width: 150,
  },
  viewAllButton: {
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
}); 