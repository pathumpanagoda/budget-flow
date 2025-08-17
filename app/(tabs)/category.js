import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Text, View } from '../../components/Themed';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import CategoryItem from '../../components/CategoryItem';
import { getCategories, getExpenses, listenCategories, listenExpenses } from '../../services/firebaseService';
import { useTheme } from '../../context/theme';

export default function CategoryScreen() {
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both categories and expenses
      const [categoriesData, expensesData] = await Promise.all([
        getCategories(),
        getExpenses()
      ]);
      
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
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Could not load categories. Please try again.');
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
    // Real-time categories
    const unsubCats = listenCategories((catsLive) => {
      // When categories change, refetch expenses once (could optimize with expense listener aggregation)
      getExpenses().then(expensesData => {
        const categoriesWithTotals = catsLive.map(category => {
          const categoryExpenses = expensesData.filter(expense => expense.categoryId === category.id);
          const totalAmount = categoryExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
          const expenseCount = categoryExpenses.length;
          return { ...category, totalAmount, expenseCount };
        });
        setCategories(categoriesWithTotals);
      }).catch(err => console.error('Error updating categories live:', err));
    });
    // Real-time expenses (to keep totals current when expense status/amount changes)
    const unsubExpenses = listenExpenses(null, (expensesLive) => {
      setCategories(prevCats => prevCats.map(cat => {
        const categoryExpenses = expensesLive.filter(e => e.categoryId === cat.id);
        const totalAmount = categoryExpenses.reduce((s,e)=> s + (e.amount || 0), 0);
        return { ...cat, totalAmount, expenseCount: categoryExpenses.length };
      }));
    });
    return () => {
      unsubCats && unsubCats();
      unsubExpenses && unsubExpenses();
    };
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
      <RNView style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <Button 
          title="+ Add Category" 
          onPress={() => router.push('/new-category')}
          style={styles.addButton}
        />
      </RNView>

      {categories.length === 0 ? (
        <Card style={styles.emptyCard}>
          <RNView style={styles.emptyState}>
            <FontAwesome5 name="list" size={36} color={colors.text} />
            <Text style={styles.emptyText}>No categories yet</Text>
            <Text style={styles.emptySubtext}>
              Add categories to organize your expenses
            </Text>
            <Button 
              title="Add Your First Category" 
              onPress={() => router.push('/new-category')}
              style={styles.firstButton}
            />
          </RNView>
        </Card>
      ) : (
        categories.map((category) => (
          <CategoryItem
            key={category.id}
            name={category.name}
            totalExpenses={category.expenseCount || 0}
            totalAmount={category.totalAmount || 0}
            onPress={() => router.push(`/category/${category.id}`)}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
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
}); 