import React, { useEffect, useState } from 'react';
import { Alert, Box, Text } from '@chakra-ui/react';

const quotes = [
  "Success is the sum of small efforts, repeated day in and day out. 🌟 - Robert Collier",
  "The harder you work for something, the greater you'll feel when you achieve it. 💪 - Unknown",
  "Believe you can and you're halfway there. 🌠 - Theodore Roosevelt",
  "The only way to do great work is to love what you do. ❤️ - Steve Jobs",
  "You are never too old to set another goal or to dream a new dream. 🌈 - C.S. Lewis",
  "Your future is created by what you do today, not tomorrow. ⏳ - Robert Kiyosaki",
  "The secret to getting ahead is getting started. 🚀 - Mark Twain",
  "The only limit to our realization of tomorrow will be our doubts of today. 🌄 - Franklin D. Roosevelt",
  "Don't watch the clock; do what it does. Keep going. ⏰ - Sam Levenson",
  "Success is not the key to happiness. Happiness is the key to success. 😃 - Albert Schweitzer",
  "The journey of a thousand miles begins with one step. 👣 - Lao Tzu",
  "Work hard in silence; let success make the noise. 🤫🎉 - Unknown",
  "Dreams don't work unless you do. 💭💼 - John C. Maxwell",
  "The only person you should try to be better than is the person you were yesterday. 🌟 - Unknown",
  "Success is not in what you have, but who you are. 🌟 - Bo Bennett",
  "Chase your passion, not your pension. 💼❤️ - Denis Waitley",
  "I can't change the direction of the wind, but I can adjust my sails to always reach my destination. 🌬️⛵ - Jimmy Dean",
  "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle. 💪 - Christian D. Larson",
  "Don't count the days; make the days count. 📆 - Muhammad Ali",
  "The future depends on what you do today. 🌅 - Mahatma Gandhi",
  "The only thing standing between you and your goal is the story you keep telling yourself as to why you can't achieve it. 📖 - Jordan Belfort",
  "You don't have to be great to start, but you have to start to be great. 🚀 - Zig Ziglar",
  "Stay focused, go after your dreams, and keep moving toward your goals. 👀🎯 - LL Cool J",
  "The harder you work, the luckier you get. 🍀 - Gary Player",
  "Believe in yourself and the world will be at your feet. 🌎👣 - Swami Vivekananda",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. 🏆 - Winston Churchill",
  "Set your goals high, and don't stop till you get there. 🏁 - Bo Jackson",
  "Success is walking from failure to failure with no loss of enthusiasm. 🚶‍♂️💥 - Winston Churchill",
  "The only thing that stands between you and your dream is the will to try and the belief that it is actually possible. ✨ - Joel Brown",
  "The secret of getting ahead is getting started. 🚀 - Mark Twain",
  "Don't wait for the opportunity. Create it. 🌟 - George Bernard Shaw",
  "The only limit to our realization of tomorrow will be our doubts of today. 🌄 - Franklin D. Roosevelt",
  "Don't watch the clock; do what it does. Keep going. ⏰ - Sam Levenson",
  "You are never too old to set another goal or to dream a new dream. 🌈 - C.S. Lewis",
  "Your future is created by what you do today, not tomorrow. ⏳ - Robert Kiyosaki",
  "The secret to getting ahead is getting started. 🚀 - Mark Twain",
  "The harder you work for something, the greater you'll feel when you achieve it. 💪 - Unknown",
  "Believe you can and you're halfway there. 🌠 - Theodore Roosevelt",
  "Success is the sum of small efforts, repeated day in and day out. 🌟 - Robert Collier",
  "Your time is limited, don't waste it living someone else's life. ⏳ - Steve Jobs",
  "Success is not the key to happiness. Happiness is the key to success. 😃 - Albert Schweitzer",
  "The journey of a thousand miles begins with one step. 👣 - Lao Tzu",
  "Work hard in silence; let success make the noise. 🤫🎉 - Unknown",
  "Dreams don't work unless you do. 💭💼 - John C. Maxwell",
  "The only person you should try to be better than is the person you were yesterday. 🌟 - Unknown",
  "Chase your passion, not your pension. 💼❤️ - Denis Waitley",
  "I can't change the direction of the wind, but I can adjust my sails to always reach my destination. 🌬️⛵ - Jimmy Dean",
  "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle. 💪 - Christian D. Larson",
  "Don't count the days; make the days count. 📆 - Muhammad Ali",
  "The future depends on what you do today. 🌅 - Mahatma Gandhi",
];

const getCurrentDateIndex = () => {
  const startDate = new Date('2023-01-01');
  const today = new Date();
  const differenceInTime = today.getTime() - startDate.getTime();
  return Math.floor(differenceInTime / (1000 * 3600 * 24)) % quotes.length;
};

const MotivationalQuote = () => {
  const [quoteIndex, setQuoteIndex] = useState(getCurrentDateIndex());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 86400000); // Update every day (24 hours)

    return () => clearInterval(intervalId);
  }, []);

  const quote = quotes[quoteIndex].split(' - ');
  const motivationalText = quote[0].split(' ');
  const emoji = motivationalText.pop(); // Extract the emoji
  const textWithoutEmoji = motivationalText.join(' ');
  const author = quote[1];

  return (
    <Box w="100%" p={4}>
      <Alert
        status="warning"
        variant="left-accent"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="100%"
        py={6}
      >
        <Text fontSize={['lg', 'xl']} mt={4} fontStyle="italic">
          {textWithoutEmoji}{' '}
          <Text as="span" fontStyle="normal">
            {emoji}
          </Text>
        </Text>
        <Text fontSize={['md', 'lg']} mt={2}>
          - {author}
        </Text>
      </Alert>
    </Box>
  );
};

export default MotivationalQuote;
