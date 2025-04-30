import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Text, View } from './Themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/theme';

export default function CategoryItem({ 
  name, 
  totalExpenses,
  totalAmount,
  onPress, 
  style 
}) {
  const { colors, isDarkMode } = useTheme();
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          shadowColor: isDarkMode ? '#000' : '#000',
          borderColor: colors.border,
        },
        style
      ]}>
        <RNView style={styles.contentRow}>
          <RNView style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(15, 110, 102, 0.2)' : 'rgba(15, 110, 102, 0.1)' }]}>
            <MaterialIcons name="category" size={24} color={colors.primary} />
          </RNView>
          <RNView style={styles.textContent}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.expensesCount}>
              {totalExpenses} {totalExpenses === 1 ? 'expense' : 'expenses'}
            </Text>
          </RNView>
          <RNView style={styles.amountContainer}>
            <Text style={styles.amount}>Rs. {totalAmount.toLocaleString()}</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.text} />
          </RNView>
        </RNView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
    borderWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expensesCount: {
    fontSize: 14,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
}); 