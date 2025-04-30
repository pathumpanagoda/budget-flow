import { Text as DefaultText, View as DefaultView, useColorScheme } from 'react-native';
import { useTheme } from '../context/theme';

export function useThemeColor(colorName) {
  const { colors } = useTheme();
  return colors[colorName];
}

export function Text(props) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const { colors } = useTheme();

  return <DefaultText style={[{ color: colors.text }, style]} {...otherProps} />;
}

export function View(props) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const { colors } = useTheme();

  return <DefaultView style={[{ backgroundColor: colors.background }, style]} {...otherProps} />;
} 