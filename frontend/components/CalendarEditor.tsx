// CalendarEditor.tsx

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box, Flex, useColorMode } from '@chakra-ui/react';
import { Calendar } from '@/components/ui/calendar'; 

import 'react-quill/dist/quill.snow.css';
import './custom-quill.css'; 

const QuillNoSSRWrapper = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
});

const modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
  clipboard: { matchVisual: false },
};

const formats = [
  'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent', 'link', 'image', 'video'
];

const CalendarEditor = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [editorContent, setEditorContent] = useState('');
  const { colorMode } = useColorMode();

  useEffect(() => {
    const localContent = localStorage.getItem('editorContent');
    if (localContent) {
      setEditorContent(localContent);
    } else {
      fetchEditorContent();
    }
  }, [date]);

  const fetchEditorContent = () => {
    fetch(`http://k8s-threetie-backends-8cdf5fd76a-49e658ee327e19e3.elb.ap-southeast-2.amazonaws.com/api/getEditorContent`)
      .then(response => response.json())
      .then(data => {
        setEditorContent(data.content);
        localStorage.setItem('editorContent', data.content);
      })
      .catch(error => console.error('Error fetching editor content:', error));
  };

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    localStorage.setItem('editorContent', content);

    fetch(`http://k8s-threetie-backends-8cdf5fd76a-49e658ee327e19e3.elb.ap-southeast-2.amazonaws.com/api/saveEditorContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    }).catch(error => console.error('Error saving editor content:', error));
  };

  return (
    <Flex width="80%" mx="auto" mt={5} justify="space-between">
      <Box flexShrink={0}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </Box>
      <Box flexGrow={1} ml={4}>
        <QuillNoSSRWrapper
          theme="snow"
          value={editorContent}
          onChange={handleEditorChange}
          modules={modules}
          formats={formats}
          placeholder="Put your study plan here."
          style={{ height: '306.5px', overflowY: 'auto' }}
          className={colorMode === 'dark' ? 'quill-dark-mode' : ''}
        />
      </Box>
    </Flex>
  );
};

export default CalendarEditor;
