import React from 'react';
import { StatusBar } from 'react-native';

import { colors } from './src/theme';
import AuthNavigator from './src/navigation/AuthNavigator';

const App = (): JSX.Element => {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
        translucent={false}
      />
      <AuthNavigator />
    </>
  );
};

export default App;