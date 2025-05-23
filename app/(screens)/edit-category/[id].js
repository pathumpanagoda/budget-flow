import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View as RNView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Text, View } from '../../../components/Themed';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '../../../components/Button';
import { getCategories, updateCategory } from '../../../services/sqliteService';
import { useTheme } from '../../../context/theme';

export default function EditCategoryScreen() {
  const { colors, isDarkMode } = useTheme();
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
      const categoriesData = await getCategories(); // sqliteService returns array directly
      const foundCategory = categoriesData.find(cat => cat.id === id);
      
      if (!foundCategory) {
        Alert.alert('Error', `Category with ID ${id} not found.`);
        router.back();
        return;
      }

      setCategory(foundCategory);
      setName(foundCategory.name);
      // Description is not in the categories table in SQLite
      // If description is a desired feature, the table and service need an update.
      // For now, keeping it as it was, but it will always be '' or the value from a potentially non-existent field.
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
      // updateCategory in sqliteService expects (id, { name })
      // The description field doesn't exist in the SQLite 'categories' table.
      // If it's needed, the table schema and sqliteService.updateCategory must be changed.
      await updateCategory(id, {
        name: name.trim(),
        // description: description.trim(), // Not sending description
      });
      Alert.alert('Success', 'Category updated successfully');
      // It's good practice to re-fetch or pass updated data if the previous screen relies on it.
      // For now, just going back.
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Name</Text>
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