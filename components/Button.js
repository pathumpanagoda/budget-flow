import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from './Themed';

export default function Button({
  title,
  onPress,
  style,
  textStyle,
  loading = false,
  disabled = false,
  variant = 'primary',
}) {
  const getButtonStyles = () => {
    if (variant === 'primary') {
      return styles.primaryButton;
    } else if (variant === 'outline') {
      return styles.outlineButton;
    } else if (variant === 'danger') {
      return styles.dangerButton;
    }
    return styles.primaryButton;
  };

  const getTextStyles = () => {
    if (variant === 'primary') {
      return styles.primaryText;
    } else if (variant === 'outline') {
      return styles.outlineText;
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
        <ActivityIndicator color={variant === 'outline' ? '#0F6E66' : 'white'} />
      ) : (
        <Text style={[getTextStyles(), textStyle, disabled && styles.disabledText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#0F6E66',
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
    borderColor: '#0F6E66',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    backgroundColor: '#E53935',
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
    color: '#0F6E66',
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