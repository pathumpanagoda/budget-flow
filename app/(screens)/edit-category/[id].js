import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Text, View } from '../../../components/Themed';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '../../../components/Button';
import { getCategories, updateCategory } from '../../../services/firebaseService';

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const categories = await getCategories();
      const foundCategory = categories.find(cat => cat.id === id);
      
      if (!foundCategory) {
        Alert.alert('Error', 'Category not found');
        router.back();
        return;
      }

      setCategory(foundCategory);
      setName(foundCategory.name);
      setDescription(foundCategory.description || '');
    } catch (error) {
      console.error('Error fetching category:', error);
      Alert.alert('Error', 'Could not load category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      setSaving(true);
      await updateCategory(id, {
        name: name.trim(),
        description: description.trim(),
      });
      Alert.alert('Success', 'Category updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Could not update category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F6E66" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter category name"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter category description"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <RNView style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={styles.button}
          />
          <Button
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={saving}
            style={styles.button}
          />
        </RNView>
      </View>
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
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#212121',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
}); 