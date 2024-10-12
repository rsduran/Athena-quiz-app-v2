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
  const iconBg = useColorModeValue('white', 'gray.800');
  const iconHoverBgLight = '#edf2f8';
  const iconHoverBgDark = '#2c323d';

  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAvatar, setUserAvatar] = useState('');

  const chakraIconSize = 5;
  const closeIconSize = 3.5;
  const reactIconSize = '20px';

  const iconButtonStyles = {
    bg: iconBg,
    _hover: {
      bg: colorMode === 'light' ? iconHoverBgLight : iconHoverBgDark,
    },
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
        setUserAvatar(data.avatar || '');
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
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Flex alignItems={'center'}>
          <NextLink href="/" passHref>
            <Link
              _hover={{ textDecoration: 'none' }}
              display="flex"
              alignItems="center"
            >
              <Text fontSize="2xl" fontWeight="extrabold" lineHeight="1" mb={1}>
                athena.
              </Text>
            </Link>
          </NextLink>

          <HStack
            as={'nav'}
            spacing={4}
            display={{ base: 'none', md: 'flex' }}
            ml={4}
          >
            {['About', 'Contact', 'Resume', 'Email', 'Projects'].map((link) => (
              <NextLink href={`#${link.toLowerCase()}`} passHref key={link}>
                <Link
                  px={2}
                  py={1}
                  rounded={'md'}
                  _hover={{
                    textDecoration: 'none',
                    bg: useColorModeValue('gray.200', 'gray.700'),
                  }}
                  fontSize="md"
                >
                  {link}
                </Link>
              </NextLink>
            ))}
          </HStack>
        </Flex>

        <Flex alignItems={'center'}>
          <HStack spacing={2} mr={2} display={{ base: 'none', md: 'flex' }}>
            <Link href="https://github.com/rsduran" isExternal>
              <IconButton
                aria-label="GitHub"
                icon={<FaGithub size={reactIconSize} />}
                {...iconButtonStyles}
              />
            </Link>
            <Link
              href="https://www.linkedin.com/in/reineir-duran-6a4791257"
              isExternal
            >
              <IconButton
                aria-label="LinkedIn"
                icon={<FaLinkedin size={reactIconSize} />}
                {...iconButtonStyles}
              />
            </Link>
            <Link href="https://x.com/rsduran_devops" isExternal>
              <IconButton
                aria-label="Twitter"
                icon={<FaTwitter size={reactIconSize} />}
                {...iconButtonStyles}
              />
            </Link>
          </HStack>

          <IconButton
            aria-label={'Open Menu'}
            icon={
              isOpen ? (
                <CloseIcon w={closeIconSize} h={closeIconSize} />
              ) : (
                <HamburgerIcon w={chakraIconSize} h={chakraIconSize} />
              )
            }
            display={{ md: 'none' }}
            onClick={onToggle}
            mr={2}
            mb={1}
            {...iconButtonStyles}
          />

          <IconButton
            aria-label={'Toggle Dark Mode'}
            icon={
              colorMode === 'dark' ? (
                <SunIcon w={chakraIconSize} h={chakraIconSize} />
              ) : (
                <MoonIcon w={chakraIconSize} h={chakraIconSize} />
              )
            }
            onClick={toggleColorMode}
            {...iconButtonStyles}
            mr={2}
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
                <Avatar size={'sm'} src={userAvatar} />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => router.push('/Dashboard')}>Dashboard</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Box pb={4} display={{ md: 'none' }}>
          <VStack as={'nav'} spacing={4}>
            {['About', 'Contact', 'Resume', 'Email', 'Projects'].map((link) => (
              <NextLink href={`#${link.toLowerCase()}`} passHref key={link}>
                <Link
                  px={2}
                  py={1}
                  rounded={'md'}
                  _hover={{
                    textDecoration: 'none',
                    bg: useColorModeValue('gray.200', 'gray.700'),
                  }}
                  fontSize="md"
                  w="100%"
                  textAlign="center"
                >
                  {link}
                </Link>
              </NextLink>
            ))}

            <HStack spacing={2}>
              <Link href="https://github.com/rsduran" isExternal>
                <IconButton
                  aria-label="GitHub"
                  icon={<FaGithub size={reactIconSize} />}
                  {...iconButtonStyles}
                />
              </Link>
              <Link
                href="https://www.linkedin.com/in/reineir-duran-6a4791257"
                isExternal
              >
                <IconButton
                  aria-label="LinkedIn"
                  icon={<FaLinkedin size={reactIconSize} />}
                  {...iconButtonStyles}
                />
              </Link>
              <Link href="https://x.com/rsduran_devops" isExternal>
                <IconButton
                  aria-label="Twitter"
                  icon={<FaTwitter size={reactIconSize} />}
                  {...iconButtonStyles}
                />
              </Link>
            </HStack>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}