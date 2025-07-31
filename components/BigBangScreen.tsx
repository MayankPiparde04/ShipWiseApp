import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { Text } from 'react-native';
import { twMerge } from 'tailwind-variants';

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 50;

const getRandomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`;

const BigBangScreen = () => {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const x = useRef(new Animated.Value(0)).current;
    const y = useRef(new Animated.Value(0)).current;

    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * Math.min(width, height) * 0.5;
    const color = getRandomColor();

    useEffect(() => {
      const animate = () => {
        x.setValue(0);
        y.setValue(0);

        Animated.loop(
          Animated.sequence([
            Animated.timing(x, {
              toValue: Math.cos(angle) * radius,
              duration: 4000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.timing(x, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();

        Animated.loop(
          Animated.sequence([
            Animated.timing(y, {
              toValue: Math.sin(angle) * radius,
              duration: 4000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.timing(y, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animate();
    }, []);

    return (
      <Animated.View
        key={i}
        className="absolute w-1 h-1 rounded-full"
        style={{
          backgroundColor: color,
          transform: [{ translateX: x }, { translateY: y }],
          top: height / 2,
          left: width / 2,
        }}
      />
    );
  });

  return (
    <View className="flex-1 bg-black items-center justify-center">
      {particles}
      <Text className="text-white text-lg font-semibold absolute bottom-10">
        Big Bang Simulation
      </Text>
    </View>
  );
};

export default BigBangScreen;
