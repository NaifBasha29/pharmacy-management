import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const HealthIcon = ({ size = 24, color = '#10b981' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      <G fill="url(#healthGradient)">
        <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        <Path d="M12 19.5l1.45-1.32C18.6 14.36 22 11.28 22 8.5 22 5.42 19.58 3 16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 2.78 3.4 5.86 8.55 10.54L12 19.5z" fill="white" fillOpacity="0.2"/>
        <Path d="M9 11h6v2H9z" fill="white"/>
        <Path d="M12 8v6M9 11h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </G>
    </Svg>
  );
};

export default HealthIcon;
