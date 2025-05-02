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
  let backgroundColor = colors.border; // Default gray for remaining
  let textColor = isDarkMode ? '#B0B0B0' : '#757575';

  if (status === 'Pending') {
    backgroundColor = isDarkMode ? '#6d4c1b' : '#FFE0B2'; // Darker orange for dark mode
    textColor = isDarkMode ? '#ffb74d' : '#F57C00';
  } else if (status === 'Received') {
    backgroundColor = isDarkMode ? '#295b2c' : '#C8E6C9'; // Darker green for dark mode
    textColor = isDarkMode ? '#81c784' : '#388E3C';
  } else if (status === 'Spent') {
    backgroundColor = isDarkMode ? '#1a237e' : '#E3F2FD'; // Darker blue for dark mode
    textColor = isDarkMode ? '#90caf9' : '#1976D2';
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