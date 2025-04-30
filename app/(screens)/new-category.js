import { useState } from 'react';
import { StyleSheet, TextInput, ScrollView, View as RNView, Alert } from 'react-native';
import { Text, View } from '../../components/Themed';
import { router } from 'expo-router';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { addCategory } from '../../services/firebaseService';
import { useTheme } from '../../context/theme';

export default function NewCategoryScreen() {
  const { colors, isDarkMode } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      setLoading(true);
      
      await addCategory({
        name: name.trim(),
        description: description.trim(),
        expenseCount: 0,
        totalAmount: 0,
      });
      
      Alert.alert(
        'Success',
        'Category added successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Could not add category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.formCard}>
        <Text style={styles.title}>Add New Category</Text>
        
        <RNView style={styles.inputContainer}>
          <Text style={styles.label}>Category Name</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter category name"
            placeholderTextColor={colors.text}
          />
        </RNView>
        
        <RNView style={styles.inputContainer}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter category description"
            placeholderTextColor={colors.text}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </RNView>
        
        <RNView style={styles.buttonsContainer}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="Add Category"
            onPress={handleSubmit}
            loading={loading}
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
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
}); 