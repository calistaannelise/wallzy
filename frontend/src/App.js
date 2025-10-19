import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import NfcManager from 'react-native-nfc-manager';
import { colors } from './theme';
import AuthNavigator from './navigation/AuthNavigator';

const App = () => {
  useEffect(() => {
    // Initialize NFC Manager
    const initNfc = async () => {
      try {
        await NfcManager.start();
        console.log('NFC Manager initialized');
      } catch (error) {
        console.log('NFC initialization error:', error);
      }
    };

    initNfc();

    // Cleanup on unmount
    return () => {
      NfcManager.stop();
    };
  }, []);

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
