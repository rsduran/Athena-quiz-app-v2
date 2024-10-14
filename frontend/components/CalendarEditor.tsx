// CalendarEditor.tsx

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Box, Flex, useColorMode, useBreakpointValue, Text } from '@chakra-ui/react';
import { Calendar } from '@/components/ui/calendar';
import debounce from 'lodash/debounce';

import 'react-quill/dist/quill.snow.css';
import './custom-quill.css';
import { getBackendUrl } from '@/utils/getBackendUrl';
import { fetchWithAuth } from '@/utils/api';

const backendUrl = getBackendUrl();

const QuillNoSSRWrapper = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
});

const modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],
    ['link', 'image', 'video'],
    ['clean'],
  ],
  clipboard: { matchVisual: false },
};

const formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video',
];

const CalendarEditor: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [editorContent, setEditorContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const { colorMode } = useColorMode();

  useEffect(() => {
    const localContent = localStorage.getItem('editorContent');
    if (localContent) {
      setEditorContent(localContent);
      setIsInitialLoad(false);
    } else {
      fetchEditorContent();
    }
  }, [date]);

  const fetchEditorContent = () => {
    setIsLoading(true);
    setError(null);
    fetchWithAuth(`${backendUrl}/getEditorContent`)
      .then((response) => {
        if (response.status === 404) {
          return { content: '' };
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setEditorContent(data.content);
        localStorage.setItem('editorContent', data.content);
      })
      .catch((error) => {
        console.error('Error fetching editor content:', error);
        if (!isInitialLoad) {
          setError('Failed to fetch editor content. Please try again.');
        }
      })
      .finally(() => {
        setIsLoading(false);
        setIsInitialLoad(false);
      });
  };

  const saveEditorContent = useCallback(
    debounce((content: string) => {
      setIsSaving(true);
      setError(null);
      fetchWithAuth(`${backendUrl}/saveEditorContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
            });
          }
          return response.json();
        })
        .then(data => {
          console.log('Content saved successfully:', data);
        })
        .catch((error) => {
          console.error('Error saving editor content:', error);
          setError(`Failed to save content: ${error.message}`);
        })
        .finally(() => {
          setIsSaving(false);
        });
    }, 3000),
    []
  );

  const handleEditorChange = (content: string) => {
    if (content !== undefined) {
      setEditorContent(content);
      localStorage.setItem('editorContent', content);
      saveEditorContent(content);
    }
  };

  const flexDirection = useBreakpointValue<'column' | 'row'>({
    base: 'column',
    md: 'row',
  }) || 'column';
  const calendarWidth = useBreakpointValue({ base: '100%', md: 'auto' });
  const editorHeight = useBreakpointValue({ base: '200px', md: '306.5px' });

  return (
    <Flex
      width={['95%', '90%', '80%']}
      mx="auto"
      mt={[5, 10]}
      justify="space-between"
      flexDirection={flexDirection}
    >
      <Box flexShrink={0} width={calendarWidth} mb={[4, 0]}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </Box>
      <Box flexGrow={1} ml={[0, 4]} width="100%">
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <>
            {isSaving && <Text fontSize="sm" color="gray.500">Saving...</Text>}
            {!isInitialLoad && error && <Text color="red.500">{error}</Text>}
            <QuillNoSSRWrapper
              theme="snow"
              value={editorContent}
              onChange={handleEditorChange}
              modules={modules}
              formats={formats}
              placeholder="Put your study plan here."
              style={{ height: editorHeight, overflowY: 'auto' }}
              className={colorMode === 'dark' ? 'quill-dark-mode' : ''}
            />
          </>
        )}
      </Box>
    </Flex>
  );
};

export default CalendarEditor;