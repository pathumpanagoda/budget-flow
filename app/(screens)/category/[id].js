import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Text, View } from '../../../components/Themed';
import { router, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import ExpenseItem from '../../../components/ExpenseItem';
import { getExpenses, getCategories, deleteCategory } from '../../../services/firebaseService';
import { useTheme } from '../../../context/theme';

export default function CategoryDetailScreen() {
  const { colors, isDarkMode } = useTheme();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [categoriesData, expensesData] = await Promise.all([
        getCategories(),
        getExpenses(id)
      ]);
      
      const foundCategory = categoriesData.find(cat => cat.id === id);
      if (!foundCategory) {
        Alert.alert('Error', 'Category not found');
        router.back();
        return;
      }
      
      // Calculate total amount from expenses
      const totalAmount = expensesData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      setCategory({
        ...foundCategory,
        totalAmount: totalAmount
      });
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error fetching category data:', error);
      Alert.alert('Error', 'Could not load category data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleDeleteCategory = () => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? All associated expenses will be orphaned.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(id);
              Alert.alert('Success', 'Category deleted successfully');
              router.back();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Could not delete category. Please try again.');
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

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.headerCard}>
        <Text style={styles.categoryName}>{category?.name}</Text>
        {category?.description && (
          <Text style={styles.categoryDescription}>{category.description}</Text>
        )}
        <RNView style={styles.statsRow}>
          <RNView style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{expenses.length}</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </RNView>
          <RNView style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>Rs. {(category?.totalAmount || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </RNView>
        </RNView>
        <RNView style={styles.buttonRow}>
          <Button
            title="+ Add Expense"
            onPress={() => router.push({
              pathname: '/new-expense',
              params: { preSelectedCategory: id }
            })}
            style={styles.addButton}
          />
          <Button
            title="Edit"
            onPress={() => router.push(`/edit-category/${id}`)}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Delete"
            onPress={handleDeleteCategory}
            variant="danger"
            style={styles.actionButton}
          />
        </RNView>
      </Card>

      <Text style={styles.sectionTitle}>Expenses</Text>

      {expenses.length === 0 ? (
        <Card style={styles.emptyCard}>
          <RNView style={styles.emptyState}>
            <FontAwesome5 name="receipt" size={36} color={colors.text} />
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubtext}>
              Add expenses to this category to track your sremaining
            </Text>
            <Button 
              title="Add Your First Expense" 
              onPress={() => router.push({
                pathname: '/new-expense',
                params: { preSelectedCategory: id }
              })}
              style={styles.firstButton}
            />
          </RNView>
        </Card>
      ) : (
        expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            title={expense.title}
            amount={expense.amount}
            status={expense.status}
            assignedTo={expense.assignedTo}
            onPress={() => router.push(`/expense/${expense.id}`)}
            style={styles.expenseItem}
          />
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
  },
  categoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    marginRight: 24,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    flex: 1,
    marginRight: 8,
  },
  actionButton: {
    marginHorizontal: 4,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCard: {
    margin: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 24,
  },
  firstButton: {
    width: '100%',
  },
  expenseItem: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
}); 