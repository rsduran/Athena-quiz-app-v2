// components/Navbar.tsx

import React, { useEffect, useState } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Flex,
  IconButton,
  useColorMode,
  useColorModeValue,
  Text,
  Link,
  HStack,
  VStack,
  Collapse,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spacer,
} from '@chakra-ui/react';
import {
  MoonIcon,
  SunIcon,
  HamburgerIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { getBackendUrl } from '../utils/getBackendUrl';

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');

  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAvatar, setUserAvatar] = useState('');
  const [userName, setUserName] = useState('');

  const iconButtonStyles = {
    variant: 'ghost',
    size: 'md',
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      const backendUrl = getBackendUrl();
      try {
        const response = await fetch(`${backendUrl}/auth/status`, {
          credentials: 'include'
        });
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);
        if (data.isLoggedIn) {
          setUserName(data.username);
          setUserAvatar(data.avatar);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    const backendUrl = getBackendUrl();
    try {
      await fetch(`${backendUrl}/auth/logout`, { 
        method: 'POST',
        credentials: 'include'
      });
      setIsLoggedIn(false);
      setUserAvatar('');
      setUserName('');
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      color={useColorModeValue('black', 'white')}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      position="sticky"
      top={0}
      zIndex={1000}
      px={4}
    >
      <Flex 
        h={16} 
        alignItems={'center'} 
        justifyContent={'space-between'}
        mx="auto"
        maxW="1400px"
      >
        <Flex alignItems={'center'}>
          <NextLink href="/" passHref>
            <Link
              _hover={{ textDecoration: 'none' }}
              display="flex"
              alignItems="center"
            >
              <Text fontSize="2xl" fontWeight="extrabold" lineHeight="1">
                athena.
              </Text>
            </Link>
          </NextLink>

          <HStack
            as={'nav'}
            spacing={4}
            ml={8}
            display={{ base: 'none', md: 'flex' }}
          >
            {['ABOUT', 'CONTACT', 'RESUME', 'EMAIL', 'PROJECTS'].map((link) => (
              <NextLink href={`#${link.toLowerCase()}`} passHref key={link}>
                <Link
                  px={2}
                  py={1}
                  rounded={'md'}
                  _hover={{
                    textDecoration: 'none',
                    color: linkHoverColor,
                    bg: useColorModeValue('gray.200', 'gray.700'),
                  }}
                  color={linkColor}
                  fontFamily='"DM Sans Variable", sans-serif'
                  fontWeight={700}
                  fontSize="12px"
                  lineHeight="14px"
                >
                  {link}
                </Link>
              </NextLink>
            ))}
          </HStack>
        </Flex>

        <Spacer />

        <HStack spacing={2}>
          <IconButton
            aria-label="GitHub"
            icon={<FaGithub style={{ width: '18px', height: '18px' }} />}
            {...iconButtonStyles}
          />
          <IconButton
            aria-label="LinkedIn"
            icon={<FaLinkedin style={{ width: '18px', height: '18px' }} />}
            {...iconButtonStyles}
          />
          <IconButton
            aria-label="Twitter"
            icon={<FaTwitter style={{ width: '18px', height: '18px' }} />}
            {...iconButtonStyles}
          />

          <IconButton
            aria-label={'Open Menu'}
            icon={isOpen ? <CloseIcon style={{ width: '18px', height: '18px' }} /> : <HamburgerIcon style={{ width: '18px', height: '18px' }} />}
            display={{ md: 'none' }}
            onClick={onToggle}
            {...iconButtonStyles}
          />

          <IconButton
            aria-label={'Toggle Dark Mode'}
            icon={colorMode === 'dark' ? <SunIcon style={{ width: '18px', height: '18px' }} /> : <MoonIcon style={{ width: '18px', height: '18px' }} />}
            onClick={toggleColorMode}
            {...iconButtonStyles}
          />

          {isLoggedIn && (
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
                <MenuItem onClick={() => router.push('/Dashboard')}>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Box pb={4} display={{ md: 'none' }}>
          <VStack as={'nav'} spacing={4}>
            {['ABOUT', 'CONTACT', 'RESUME', 'EMAIL', 'PROJECTS'].map((link) => (
              <NextLink href={`#${link.toLowerCase()}`} passHref key={link}>
                <Link
                  px={2}
                  py={1}
                  rounded={'md'}
                  _hover={{
                    textDecoration: 'none',
                    color: linkHoverColor,
                    bg: useColorModeValue('gray.200', 'gray.700'),
                  }}
                  color={linkColor}
                  fontSize="md"
                  w="100%"
                  textAlign="center"
                >
                  {link}
                </Link>
              </NextLink>
            ))}

            <HStack spacing={2} justifyContent="center" w="100%">
              <IconButton
                aria-label="GitHub"
                icon={<FaGithub style={{ width: '18px', height: '18px' }} />}
                {...iconButtonStyles}
              />
              <IconButton
                aria-label="LinkedIn"
                icon={<FaLinkedin style={{ width: '18px', height: '18px' }} />}
                {...iconButtonStyles}
              />
              <IconButton
                aria-label="Twitter"
                icon={<FaTwitter style={{ width: '18px', height: '18px' }} />}
                {...iconButtonStyles}
              />
            </HStack>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}