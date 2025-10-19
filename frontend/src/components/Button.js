import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, spacing } from '../theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];

    if (variant === 'primary') {
      baseStyle.push(styles.primary);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondary);
    }

    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];

    if (variant === 'primary') {
      baseStyle.push(styles.primaryText);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondaryText);
    }

    if (disabled || loading) {
      baseStyle.push(styles.disabledText);
    }

    if (textStyle) {
      baseStyle.push(textStyle);
    }

    return baseStyle;
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        style={[styles.button, styles[size], styles[variant], style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator
            color={colors.buttonPrimaryText}
            size="small"
          />
        ) : (
          <Text style={getTextStyle()}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={colors.text}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  gradient: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  large: {
    height: 56,
    paddingHorizontal: spacing.lg,
  },
  medium: {
    height: 48,
    paddingHorizontal: spacing.md,
  },
  small: {
    height: 40,
    paddingHorizontal: spacing.sm,
  },
  primary: {
    backgroundColor: colors.primary,
    borderWidth: 0,
    borderRadius: 8,
    shadowColor: colors.primaryLight,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  secondary: {
    backgroundColor: colors.buttonSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    backgroundColor: colors.buttonDisabled,
  },
  text: {
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
    color: '#000000',
  },
  largeText: {
    fontSize: typography.fontSize.lg,
  },
  mediumText: {
    fontSize: typography.fontSize.base,
  },
  smallText: {
    fontSize: typography.fontSize.sm,
  },
  primaryText: {
    color: colors.buttonPrimaryText,
  },
  secondaryText: {
    color: colors.buttonSecondaryText,
  },
  disabledText: {
    color: colors.buttonDisabledText,
  },
});

export default Button;
