// CountdownTimer.tsx

import React, { useEffect, useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

const CountdownTimer = () => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate the countdown timer
  const calculateCountdown = () => {
    const targetDate = new Date('October 19, 2024, 00:00:00').getTime();
    const now = new Date().getTime();
    const distance = targetDate - now;

    // Calculating days, hours, minutes, and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (distance % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    setCountdown({ days, hours, minutes, seconds });
  };

  useEffect(() => {
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      p={4}
      w="100%"
    >
      <Text fontSize={['4xl', '5xl']} fontWeight="bold">
        {countdown.days}
      </Text>
      <Text fontSize={['md', 'xl']}>days left</Text>
      <Flex mt={2} gap={2} fontSize={['sm', 'md']}>
        <Box>{countdown.hours}h</Box>
        <Box>{countdown.minutes}m</Box>
        <Box>{countdown.seconds}s</Box>
      </Flex>
    </Flex>
  );
};

export default CountdownTimer;
