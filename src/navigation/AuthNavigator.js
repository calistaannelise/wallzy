import React, { useState } from 'react';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';

const AuthNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [screenData, setScreenData] = useState({});

  const navigateTo = (screenName, data = {}) => {
    setScreenData(data);
    setCurrentScreen(screenName);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Login':
        return <LoginScreen navigateTo={navigateTo} />;
      case 'SignUp':
        return <SignUpScreen navigateTo={navigateTo} />;
      case 'ForgotPassword':
        return <ForgotPasswordScreen navigateTo={navigateTo} />;
      case 'ResetPassword':
        return <ResetPasswordScreen navigateTo={navigateTo} data={screenData} />;
      case 'OTPVerification':
        return <OTPVerificationScreen navigateTo={navigateTo} data={screenData} />;
      default:
        return <LoginScreen navigateTo={navigateTo} />;
    }
  };

  return renderScreen();
};

export default AuthNavigator;
