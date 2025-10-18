import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { colors } from './theme';
import AuthNavigator from './navigation/AuthNavigator';

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />
      <AuthNavigator />
    </NavigationContainer>
  );
};

export default App;
