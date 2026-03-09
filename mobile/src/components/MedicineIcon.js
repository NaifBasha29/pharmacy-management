import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const MedicineIcon = ({ size = 24, color = '#f97415' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="medicineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      <G fill="url(#medicineGradient)">
        <Path d="M10.5 2L3 7.5V9c0 4.97 4.03 9 9 9s9-4.03 9-9V7.5L13.5 2h-3z"/>
        <Path d="M12 4.5L7.5 8.25V9c0 2.48 2.02 4.5 4.5 4.5s4.5-2.02 4.5-4.5v-.75L12 4.5z" fill="white" fillOpacity="0.9"/>
        <Circle cx="12" cy="11" r="2" fill="white"/>
        <Path d="M10.5 10.5h3v1h-3z" fill="white"/>
      </G>
    </Svg>
  );
};

export default MedicineIcon;
