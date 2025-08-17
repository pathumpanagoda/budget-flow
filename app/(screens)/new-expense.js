import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '../../components/Themed';
import { router, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { getCategories, getFunders, addExpense } from '../../services/firebaseService';
import { useTheme } from '../../context/theme';

export default function NewExpenseScreen() {
  const { colors, isDarkMode } = useTheme();
  const { preSelectedCategory } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [funders, setFunders] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(preSelectedCategory || '');
  const [selectedFunder, setSelectedFunder] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showFunderPicker, setShowFunderPicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, fundersData] = await Promise.all([
        getCategories(),
        getFunders()
      ]);
      setCategories(categoriesData);
      setFunders(fundersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Could not load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an expense title');
      return;
    }

    if (!amount.trim() || isNaN(Number(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      setSaving(true);
      await addExpense({
        title: title.trim(),
        amount: Number(amount),
        description: description.trim(),
        categoryId: selectedCategory,
        funderId: selectedFunder || null,
        status: 'Outstanding',
        createdAt: new Date(),
      });
      
      Alert.alert('Success', 'Expense added successfully');
      router.back();
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Could not add expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.text,
          }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter expense title"
          placeholderTextColor={colors.text}
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.text,
          }]}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          placeholderTextColor={colors.text}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea, { 
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.text,
          }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter expense description"
          placeholderTextColor={colors.text}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={[styles.pickerButton, { 
            backgroundColor: colors.card,
            borderColor: colors.border,
          }]}
          onPress={() => setShowCategoryPicker(true)}
        >
          <Text style={[styles.pickerButtonText, { color: colors.text }]}>
            {selectedCategory
              ? categories.find(cat => cat.id === selectedCategory)?.name
              : 'Select a category'}
          </Text>
          <FontAwesome5 name="chevron-down" size={14} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.label}>Assigned To (Optional)</Text>
        <TouchableOpacity
          style={[styles.pickerButton, { 
            backgroundColor: colors.card,
            borderColor: colors.border,
          }]}
          onPress={() => setShowFunderPicker(true)}
        >
          <Text style={[styles.pickerButtonText, { color: colors.text }]}>
            {selectedFunder
              ? funders.find(f => f.id === selectedFunder)?.name
              : 'Select a funder'}
          </Text>
          <FontAwesome5 name="chevron-down" size={14} color={colors.text} />
        </TouchableOpacity>

        <Button
          title={saving ? 'Saving...' : 'Save Expense'}
          onPress={handleSave}
          disabled={saving}
          style={styles.submitButton}
        />
      </View>

      {showCategoryPicker && (
        <View style={[styles.pickerOverlay, { backgroundColor: colors.overlay }]}>
          <Card style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Select Category</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={[styles.pickerItemText, { color: colors.text }]}>{category.name}</Text>
              </TouchableOpacity>
            ))}
            <Button
              title="Cancel"
              onPress={() => setShowCategoryPicker(false)}
              variant="outline"
              style={styles.pickerCancelButton}
            />
          </Card>
        </View>
      )}

      {showFunderPicker && (
        <View style={[styles.pickerOverlay, { backgroundColor: colors.overlay }]}>
          <Card style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Select Funder</Text>
            {funders.map((funder) => (
              <TouchableOpacity
                key={funder.id}
                style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setSelectedFunder(funder.id);
                  setShowFunderPicker(false);
                }}
              >
                <Text style={[styles.pickerItemText, { color: colors.text }]}>{funder.name}</Text>
              </TouchableOpacity>
            ))}
            <Button
              title="Cancel"
              onPress={() => setShowFunderPicker(false)}
              variant="outline"
              style={styles.pickerCancelButton}
            />
          </Card>
        </View>
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
  formContainer: {
    padding: 16,
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
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  pickerButton: {
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  pickerButtonText: {
    fontSize: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerCard: {
    width: '80%',
    maxHeight: '80%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  pickerItemText: {
    fontSize: 16,
  },
  pickerCancelButton: {
    marginTop: 16,
  },
}); 