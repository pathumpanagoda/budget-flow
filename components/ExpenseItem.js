import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { Text, View } from './Themed';
import { StatusBadge } from './Card';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/theme';

export default function ExpenseItem({ 
  title, 
  amount, 
  status, 
  assignedTo, 
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
          <RNView style={styles.textContent}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.amount}>Rs. {amount.toLocaleString()}</Text>
            {assignedTo && (
              <Text style={styles.assignedTo}>Assigned to: {assignedTo}</Text>
            )}
          </RNView>
          <RNView style={styles.statusContainer}>
            <StatusBadge status={status} />
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color={colors.text} 
              style={styles.icon} 
            />
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
    justifyContent: 'space-between',
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  assignedTo: {
    fontSize: 14,
  },
  statusContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 8,
  },
  icon: {
    marginTop: 8,
  },
}); 