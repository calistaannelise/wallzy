import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, spacing } from '../theme';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  style,
  inputStyle,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnimation, {
      toValue: 1.02,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleAnimation, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const getInputContainerStyle = () => {
    const baseStyle = [styles.inputContainer];

    if (isFocused) {
      baseStyle.push(styles.inputContainerFocused);
    }

    if (error) {
      baseStyle.push(styles.inputContainerError);
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          getInputContainerStyle(),
          {
            transform: [{ scale: scaleAnimation }],
          }
        ]}
      >
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={isFocused ? colors.textSecondary : colors.inputPlaceholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 3,
    borderBottomColor: colors.inputBorder,
    paddingHorizontal: 0,
    paddingVertical: spacing.sm,
    height: 48,
  },
  inputContainerFocused: {
    borderBottomWidth: 4,
    borderBottomColor: colors.primaryLight,
  },
  inputContainerError: {
    borderBottomColor: colors.error,
    borderBottomWidth: 4,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text, // Light green text
    paddingVertical: 0,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
  rightIcon: {
    padding: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default Input;
