// AdditionalInfo.tsx

import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Link, Spinner, Flex, Text,
  useColorMode, useColorModeValue, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
} from '@chakra-ui/react';
import { RocketIcon, ExternalLinkIcon, ReloadIcon } from '@radix-ui/react-icons';
import { MathJax } from 'better-react-mathjax';
import { getBackendUrl } from '@/utils/getBackendUrl';
import { fetchWithAuth } from '@/utils/api';

type AdditionalInfoProps = {
  url: string;
  explanation: string;
  discussion_link?: string;
  question_id: number;
  questionDetails: {
    question_text: string;
    options: string[];
    answer: string;
  };
};

type CommentType = {
  username: string;
  yearsAgo: string;
  commentText: string;
};

const AdditionalInfo = ({
  url,
  explanation,
  discussion_link,
  question_id,
  questionDetails,
}: AdditionalInfoProps) => {
  const [loadingRocket, setLoadingRocket] = useState(false);
  const [loadingReload, setLoadingReload] = useState(false);
  const [furtherExplanation, setFurtherExplanation] = useState('');
  const [fetchedExplanation, setFetchedExplanation] = useState(false);
  const [discussionComments, setDiscussionComments] = useState<CommentType[]>([]);
  const { colorMode } = useColorMode();
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const backendUrl = getBackendUrl();

  const fetchDiscussionComments = async () => {
    try {
      const response = await fetchWithAuth(`${backendUrl}/getDiscussionComments/${question_id}`);
      const data = await response.json();
      if (data.discussion_comments) {
        const commentPattern = /(.+?)said:(.+ago):(.+)/;
        const formattedComments: CommentType[] = data.discussion_comments
          .split('\n')
          .map((comment: string) => {
            const match = commentPattern.exec(comment);
            if (match) {
              const [_, username, yearsAgo, commentText] = match;
              return {
                username: username.trim(),
                yearsAgo: yearsAgo.trim(),
                commentText: commentText.trim(),
              };
            }
            return null;
          })
          .filter(Boolean) as CommentType[]; // Type assertion
        setDiscussionComments(formattedComments);
      }
    } catch (error) {
      console.error('Error fetching discussion comments:', error);
    }
  };

  useEffect(() => {
    fetchDiscussionComments();
  }, [question_id]);

  const renderDiscussionComments = () => {
    return discussionComments.map((comment, index) => (
      <Box key={index} borderWidth="1px" borderRadius="lg" p={3} my={2} borderColor={borderColor}>
        <Flex justifyContent="space-between">
          <Text fontWeight="bold">{comment.username} said:</Text>
          <Text fontStyle="italic">{comment.yearsAgo.replace(/:/g, '')}</Text>
        </Flex>
        <div dangerouslySetInnerHTML={{ __html: comment.commentText }} />
      </Box>
    ));
  };

  const processExplanationForImages = (text: string, baseUrl: string = "https://www.indiabix.com"): string => {
    const explanationImagePattern: RegExp = /<img.*?src="(.*?)".*?>/gi;
    
    return text.replace(explanationImagePattern, (match: string, imgUrl: string): string => {
      // Check if the imgUrl is a relative path (i.e., starts with '/')
      if (imgUrl.startsWith('/')) {
        // Prepend the base URL if it's a relative path
        imgUrl = `${baseUrl}${imgUrl}`;
      }
  
      return `<img src="${imgUrl}" alt="Explanation Image" style="display: inline-block; max-width: 100%; height: auto;">`;
    });
  };  

  const formatBotResponse = (response: string) => {
    let formattedResponse = response;

    // Convert URLs into clickable links
    formattedResponse = formattedResponse.replace(/\[(\d+)\]: (https?:\/\/[^\s]+) "(.+)"/g, (match, p1, p2, p3) => {
      return `<a href="${p2}" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;">[${p1}] ${p3}</a><br/>`;
    });

    // Remove subscript references and caret-bracketed references
    formattedResponse = formattedResponse.replace(/\[\^\d+\^\]\[\d+\]\s*|\[\d+\]\[\d+\]\s*/g, '');

    // Apply styling for bold text
    formattedResponse = formattedResponse.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Add new line and space before each option explanation
    formattedResponse = formattedResponse.replace(/- Option [ABCD]:/g, '<br/> $&');

    // Apply formatting for code blocks
    formattedResponse = formattedResponse.replace(/```[a-z]*\n([\s\S]*?)```/g, (match, code) => {
      return `<pre style="overflow-x: auto; padding: 2; font-size: small; background-color: #f0f0f0; border-radius: 4px;"><code>${code}</code></pre>`;
    });

    // Convert markdown tables into HTML tables with inline CSS for proper styling
    const tablePattern = /\|(.+?)\|\n\|(?:\s*[:-]+)+\s*\|\n((?:\|.+?\|\n)*)/g;
    formattedResponse = formattedResponse.replace(tablePattern, (match, headers, rows) => {
      const headerCells = headers.split('|').map((header: string) => header.trim());
      const rowCells = rows.split('\n').map((row: string) => row.split('|').map((cell: string) => cell.trim()));

      const thead = `<thead><tr>${headerCells
        .map((header: string) => `<th style="border: 1px solid #ddd; padding: 8px;">${header}</th>`)
        .join('')}</tr></thead>`;
      const tbody = `<tbody>${rowCells
        .map(
          (cells: string[]) =>
            `<tr>${cells
              .map((cell: string) => `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`)
              .join('')}</tr>`
        )
        .join('')}</tbody>`;
      return `<table style="border-collapse: collapse; width: 100%;">${thead}${tbody}</table>`;
    });

    return formattedResponse;
  };

  const handleRocketClick = async () => {
    setLoadingRocket(true);
    if (!fetchedExplanation) {
      try {
        const response = await fetchWithAuth(`${backendUrl}/getFurtherExplanation/${question_id}`);
        const data = await response.json();
        if (data.explanation) {
          setFurtherExplanation(formatBotResponse(data.explanation));
          setFetchedExplanation(true);
        } else {
          const newResponse = await fetchWithAuth(`${backendUrl}/getFurtherExplanation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(questionDetails),
          });
          const newData = await newResponse.json();
          await fetchWithAuth(`${backendUrl}/saveFurtherExplanation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question_id: question_id, explanation: newData.further_explanation }),
          });
          setFurtherExplanation(
            formatBotResponse(newData.further_explanation || 'Error fetching further explanation')
          );
          setFetchedExplanation(true);
        }
      } catch (error) {
        console.error('Error fetching further explanation:', error);
        setFurtherExplanation('Error fetching further explanation');
      }
    }
    setLoadingRocket(false);
  };

  const handleReloadClick = async () => {
    setLoadingReload(true);
    try {
      const newResponse = await fetchWithAuth(`${backendUrl}/getFurtherExplanation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionDetails),
      });
      const newData = await newResponse.json();
      await fetchWithAuth(`${backendUrl}/saveFurtherExplanation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: question_id, explanation: newData.further_explanation }),
      });
      setFurtherExplanation(
        formatBotResponse(newData.further_explanation || 'Error fetching further explanation')
      );
    } catch (error) {
      console.error('Error fetching further explanation:', error);
      setFurtherExplanation('Error fetching further explanation');
    }
    setLoadingReload(false);
  };

  const openLink = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
      <Heading size="md" mb={4}>
        Additional Info
      </Heading>
      <Accordion allowMultiple defaultIndex={[0]}>
        {/* Explanation Section */}
        <AccordionItem>
          <AccordionButton>
            <Flex flex="1" alignItems="center">
              <Text>Explanation</Text>
              <Box ml={2}>
                {loadingRocket ? (
                  <Spinner size="xs" />
                ) : (
                  <RocketIcon onClick={handleRocketClick} cursor="pointer" />
                )}
              </Box>
            </Flex>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <div
              dangerouslySetInnerHTML={{
                __html: processExplanationForImages(explanation),
              }}
            />
          </AccordionPanel>
        </AccordionItem>

        {/* Further Explanation Section */}
        {furtherExplanation && (
          <AccordionItem>
            <AccordionButton>
              <Flex flex="1" alignItems="center">
                <Text>Further Explanation</Text>
                <Box ml={2}>
                  {loadingReload ? (
                    <Spinner size="xs" />
                  ) : (
                    <ReloadIcon onClick={handleReloadClick} cursor="pointer" />
                  )}
                </Box>
              </Flex>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <MathJax dynamic>
                <div dangerouslySetInnerHTML={{ __html: furtherExplanation }} />
              </MathJax>
            </AccordionPanel>
          </AccordionItem>
        )}

        {/* URL Section */}
        {url && (
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                URL
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Flex alignItems="center">
                <Link href={url} isExternal>
                  {url}
                </Link>
                <Box ml={1}>
                  <ExternalLinkIcon onClick={() => openLink(url)} cursor="pointer" />
                </Box>
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        )}

        {/* Discussion Link Section */}
        {discussion_link && (
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                View in Discussions
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Flex alignItems="center">
                <Link href={discussion_link} isExternal>
                  Go to Discussions Forum
                </Link>
                <Box ml={1}>
                  <ExternalLinkIcon onClick={() => openLink(discussion_link)} cursor="pointer" />
                </Box>
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        )}

        {/* Discussion Comments Section */}
        {discussionComments.length > 0 && (
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Discussion Comments
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>{renderDiscussionComments()}</AccordionPanel>
          </AccordionItem>
        )}
      </Accordion>
    </Box>
  );
};

export default AdditionalInfo;
