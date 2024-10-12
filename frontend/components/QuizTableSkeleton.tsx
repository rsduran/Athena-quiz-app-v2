import React from 'react';
import {
  Box,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Skeleton,
  VStack,
  Badge,
  Progress,
} from '@chakra-ui/react';

interface QuizTableSkeletonProps {
  quizSetCount: number;
}

const QuizTableSkeleton: React.FC<QuizTableSkeletonProps> = ({ quizSetCount }) => {
  return (
    <Box>
      <Flex justifyContent="space-between" p={4}>
        <Skeleton>
          <Button colorScheme="red">Delete Selected</Button>
        </Skeleton>
        <Skeleton>
          <Button colorScheme="red">Delete All</Button>
        </Skeleton>
      </Flex>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th width="5%" textAlign="center">
              <Skeleton height="20px" width="20px" />
            </Th>
            <Th width="15%" textAlign="center">
              <Flex justifyContent="center">
                <Skeleton height="20px" width="80%" />
              </Flex>
            </Th>
            <Th width="15%" textAlign="center">
              <Flex justifyContent="center">
                <Skeleton height="20px" width="80%" />
              </Flex>
            </Th>
            <Th width="20%" textAlign="center">
              <Flex justifyContent="center">
                <Skeleton height="20px" width="80%" />
              </Flex>
            </Th>
            <Th width="15%" textAlign="center">
              <Flex justifyContent="center">
                <Skeleton height="20px" width="80%" />
              </Flex>
            </Th>
            <Th width="15%" textAlign="center">
              <Flex justifyContent="center">
                <Skeleton height="20px" width="80%" />
              </Flex>
            </Th>
            <Th width="15%" textAlign="center">
              <Flex justifyContent="center">
                <Skeleton height="20px" width="80%" />
              </Flex>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {[...Array(quizSetCount)].map((_, index) => (
            <Tr key={index}>
              <Td width="5%" textAlign="center">
                <Skeleton height="20px" width="20px" />
              </Td>
              <Td width="15%" textAlign="center">
                <Flex justifyContent="center">
                  <Skeleton height="20px" width="80%" />
                </Flex>
              </Td>
              <Td width="15%" textAlign="center">
                <VStack spacing={1} align="center">
                  <Skeleton height="20px" width="90%" />
                  <Skeleton height="15px" width="70%" />
                </VStack>
              </Td>
              <Td width="20%" textAlign="center">
                <VStack spacing={1} align="center">
                  <Skeleton>
                    <Badge>Status</Badge>
                  </Skeleton>
                  <Skeleton width="75%">
                    <Progress value={50} size="md" />
                  </Skeleton>
                  <Skeleton height="15px" width="60%" />
                </VStack>
              </Td>
              <Td width="15%" textAlign="center">
                <VStack spacing={1} align="center">
                  <Skeleton>
                    <Badge>Grade</Badge>
                  </Skeleton>
                  <Skeleton height="20px" width="50%" />
                  <Skeleton height="15px" width="40%" />
                </VStack>
              </Td>
              <Td width="15%" textAlign="center">
                <Flex justifyContent="center">
                  <Skeleton height="20px" width="80%" />
                </Flex>
              </Td>
              <Td width="15%" textAlign="center">
                <Flex justifyContent="center">
                  <Skeleton height="20px" width="20px" />
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default QuizTableSkeleton;