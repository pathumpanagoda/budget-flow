import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, ScrollView, View as RNView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, View } from '../../../components/Themed';
import { router, useLocalSearchParams } from 'expo-router';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { getExpense, updateExpense, getCategories, getFunders } from '../../../services/firebaseService';

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [funderId, setFunderId] = useState('');
  const [status, setStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState([]);
  const [funders, setFunders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      Alert.alert('Error', 'No expense ID provided');
      router.back();
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const expenseData = await getExpense(id);
        if (!expenseData) {
          setError('Expense not found');
          Alert.alert('Error', 'Expense not found');
          router.back();
          return;
        }

        const [categoriesData, fundersData] = await Promise.all([
          getCategories(),
          getFunders()
        ]);

        setTitle(expenseData.title);
        setAmount(expenseData.amount.toString());
        setCategoryId(expenseData.categoryId);
        setFunderId(expenseData.funderId || '');
        setStatus(expenseData.status);
        setNotes(expenseData.notes || '');
        setCategories(categoriesData);
        setFunders(fundersData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Could not load expense data');
        Alert.alert('Error', 'Could not load expense data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCancel = () => {
    if (
      title !== expense?.title ||
      amount !== expense?.amount.toString() ||
      categoryId !== expense?.categoryId ||
      funderId !== (expense?.funderId || '') ||
      status !== expense?.status ||
      notes !== (expense?.notes || '')
    ) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  const sanitizeNotes = (text) => {
    // Remove any HTML tags and limit to 1000 characters
    return text.replace(/<[^>]*>?/gm, '').slice(0, 1000);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an expense title');
      return;
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Add maximum amount validation (e.g., 10 million)
    if (numAmount > 10000000) {
      Alert.alert('Error', 'Amount cannot exceed Rs. 10,000,000');
      return;
    }

    if (!categoryId || !categories.some(cat => cat.id === categoryId)) {
      Alert.alert('Error', 'Please select a valid category');
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      await updateExpense(id, {
        title: title.trim(),
        amount: numAmount,
        categoryId,
        funderId: funderId || null,
        status,
        notes: sanitizeNotes(notes.trim()) || null,
      });

      Alert.alert(
        'Success',
        'Expense updated successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', 'Could not update expense. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F6E66" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Go Back" onPress={() => router.back()} style={styles.errorButton} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.formCard}>
        <Text style={styles.title}>Edit Expense</Text>

        <RNView style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., 2 huts for left side of the ground"
            placeholderTextColor="#9E9E9E"
          />
        </RNView>

        <RNView style={styles.inputContainer}>
          <Text style={styles.label}>Amount (Rs.)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="e.g., 25000"
            placeholderTextColor="#9E9E9E"
            keyboardType="numeric"
          />
        </RNView>

        <RNView style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          {categories.length > 0 ? (
            <RNView style={styles.pickerContainer}>
              <Picker
                selectedValue={categoryId}
                onValueChange={(itemValue) => setCategoryId(itemValue)}
                style={styles.picker}
              >
                {categories.map((category) => (
                  <Picker.Item 
                    key={category.id} 
                    label={category.name} 
                    value={category.id} 
                  />
                ))}
              </Picker>
            </RNView>
          ) : (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/new-category')}
            >
              <MaterialIcons name="add" size={20} color="#0F6E66" />
              <Text style={styles.addButtonText}>Add a category first</Text>
            </TouchableOpacity>
          )}
        </RNView>

        <RNView style={styles.inputContainer}>
          <Text style={styles.label}>Assigned To (Funder)</Text>
          <RNView style={styles.pickerContainer}>
            <Picker
              selectedValue={funderId}
              onValueChange={(itemValue) => setFunderId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Not assigned" value="" />
              {funders.map((funder) => (
                <Picker.Item 
                  key={funder.id} 
                  label={funder.name} 
                  value={funder.id} 
                />
              ))}
            </Picker>
          </RNView>
        </RNView>

        <RNView style={styles.inputContainer}>
          <Text style={styles.label}>Status</Text>
          <RNView style={styles.pickerContainer}>
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => setStatus(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Pending" value="Pending" />
              <Picker.Item label="Took Over" value="Took Over" />
              <Picker.Item label="Done" value="Done" />
              <Picker.Item label="Utilized" value="Utilized" />
            </Picker>
          </RNView>
        </RNView>

        <RNView style={styles.inputContainer}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter any additional notes"
            placeholderTextColor="#9E9E9E"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </RNView>

        <RNView style={styles.buttonsContainer}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={isSubmitting ? 'Saving...' : 'Save Changes'}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.submitButton}
          />
        </RNView>
      </Card>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorButton: {
    minWidth: 120,
  },
  formCard: {
    margin: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  textArea: {
    minHeight: 120,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0F6E66',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#0F6E66',
    fontWeight: '600',
    marginLeft: 8,
  },
}); 