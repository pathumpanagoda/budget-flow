import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from './Themed';
import { useTheme } from '../context/theme';

export default function Button({
  title,
  onPress,
  style,
  textStyle,
  loading = false,
  disabled = false,
  variant = 'primary',
}) {
  const { colors, isDarkMode } = useTheme();

  const getButtonStyles = () => {
    if (variant === 'primary') {
      return [styles.primaryButton, { backgroundColor: colors.primary }];
    } else if (variant === 'outline') {
      return [styles.outlineButton, { borderColor: colors.primary }];
    } else if (variant === 'danger') {
      return [styles.dangerButton, { backgroundColor: colors.error }];
    }
    return [styles.primaryButton, { backgroundColor: colors.primary }];
  };

  const getTextStyles = () => {
    if (variant === 'primary') {
      return styles.primaryText;
    } else if (variant === 'outline') {
      return [styles.outlineText, { color: colors.primary }];
    } else if (variant === 'danger') {
      return styles.dangerText;
    }
    return styles.primaryText;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : 'white'} />
      ) : (
        <Text style={[getTextStyles(), textStyle, disabled && styles.disabledText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  outlineText: {
    fontWeight: '600',
    fontSize: 16,
  },
  dangerText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.8,
  },
}); 