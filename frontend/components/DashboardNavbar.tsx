// components/DashboardNavbar.tsx

import React, { useEffect, useState } from 'react';
import {
  Box, Flex, IconButton, Text, useDisclosure, useColorMode, useColorModeValue,
  HStack, Avatar, Menu, MenuButton, MenuList, MenuItem,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { PlusIcon, ExitIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import QuizSetModal from './QuizSetModal';
import { getBackendUrl } from '../utils/getBackendUrl';

interface DashboardNavbarProps {
  onAddNewQuizSet: (newQuizSetTitle: string) => void;
}

export default function DashboardNavbar({ onAddNewQuizSet }: DashboardNavbarProps) {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userAvatar, setUserAvatar] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const backendUrl = getBackendUrl();
      try {
        const response = await fetch(`${backendUrl}/auth/status`, { credentials: 'include' });
        const data = await response.json();
        if (data.isLoggedIn) {
          setUserName(data.username);
          setUserAvatar(data.avatar);
        } else {
          router.push('/signin');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    const backendUrl = getBackendUrl();
    try {
      await fetch(`${backendUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      color={useColorModeValue('black', 'white')}
      px={4}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex h={16} alignItems={'center'} justifyContent="space-between">
        <Flex alignItems={'center'}>
          <IconButton
            icon={
              <ExitIcon
                style={{ transform: 'scaleX(-1)', width: '20px', height: '20px' }}
              />
            }
            onClick={() => window.location.href = '/'}
            aria-label="Go Back"
            variant={'ghost'}
          />
          <Text
            fontSize="2xl"
            fontWeight="extrabold"
            cursor="pointer"
            onClick={() => router.push('/Dashboard')}
            ml={2}
          >
            Dashboard
          </Text>
        </Flex>

        <HStack spacing={2}>
          <IconButton
            icon={<PlusIcon style={{ width: '22px', height: '22px' }} />}
            onClick={onOpen}
            aria-label="Add Quiz Set"
            variant={'ghost'}
          />
          <IconButton
            icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
            onClick={toggleColorMode}
            variant={'ghost'}
            aria-label={'Toggle Dark Mode'}
          />
          <Menu>
            <MenuButton
              as={IconButton}
              rounded={'full'}
              variant={'link'}
              cursor={'pointer'}
              minW={0}
            >
              <Avatar size={'sm'} src={userAvatar} name={userName} />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      <QuizSetModal isOpen={isOpen} onClose={onClose} onAddNewQuizSet={onAddNewQuizSet} />
    </Box>
  );
}