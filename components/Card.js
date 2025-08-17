import { StyleSheet, View as RNView } from 'react-native';
import { Text, View } from './Themed';
import { useTheme } from '../context/theme';

export default function Card({ children, style, title }) {
  const { colors, isDarkMode } = useTheme();
  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: colors.card,
        shadowColor: isDarkMode ? '#000' : '#000',
        borderColor: colors.border,
      }, 
      style
    ]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}

export function StatusBadge({ status }) {
  const { colors, isDarkMode } = useTheme();
  let backgroundColor = isDarkMode ? '#2C2C2C' : colors.border; // Default for Outstanding fallback
  let textColor = isDarkMode ? '#FFCDD2' : '#B71C1C';

  switch (status) {
    case 'Outstanding':
      backgroundColor = isDarkMode ? 'rgba(255, 39, 39, 0.63)' : '#FFCCCC';
      textColor = isDarkMode ? '#ffcdd2' : '#B71C1C';
      break;
    case 'Pending':
      backgroundColor = isDarkMode ? 'rgba(255, 166, 33, 0.7)' : '#FFE0B2';
      textColor = isDarkMode ? '#ffcc80' : '#F57C00';
      break;
    case 'Received':
      backgroundColor = isDarkMode ? 'rgba(51, 125, 254, 0.57)' : '#C4D9FF';
      textColor = isDarkMode ? '#82b1ff' : '#0D47A1';
      break;
    case 'Spent':
      backgroundColor = isDarkMode ? 'rgba(83, 255, 49, 0.5)' : '#BAFFAC';
      textColor = isDarkMode ? '#b9f6ca' : '#1B5E20';
      break;
    default:
      break;
  }

  return (
    <RNView style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{status}</Text>
    </RNView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  badge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 