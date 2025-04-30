import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Text, View } from './Themed';
import { MaterialIcons } from '@expo/vector-icons';

export default function CategoryItem({ 
  name, 
  totalExpenses,
  totalAmount,
  onPress, 
  style 
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.container, style]}>
        <RNView style={styles.contentRow}>
          <RNView style={styles.iconContainer}>
            <MaterialIcons name="category" size={24} color="#0F6E66" />
          </RNView>
          <RNView style={styles.textContent}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.expensesCount}>
              {totalExpenses} {totalExpenses === 1 ? 'expense' : 'expenses'}
            </Text>
          </RNView>
          <RNView style={styles.amountContainer}>
            <Text style={styles.amount}>Rs. {totalAmount.toLocaleString()}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#757575" />
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
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 110, 102, 0.1)',
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
    color: '#757575',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
}); 