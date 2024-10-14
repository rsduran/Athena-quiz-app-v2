// ScrapingSection.tsx

import React, { useState } from 'react';
import { Box, Button, Textarea, Flex, useToast } from '@chakra-ui/react';
import { getBackendUrl } from '@/utils/getBackendUrl';
import { fetchWithAuth } from '@/utils/api';

interface ScrapingSectionProps {
  onScrapeComplete: (success: boolean, quizSetTitle: string) => void;
  quizSetTitle: string;
}

const ScrapingSection: React.FC<ScrapingSectionProps> = ({ onScrapeComplete, quizSetTitle }) => {
  const [scrapeInput, setScrapeInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const toast = useToast();
  const backendUrl = getBackendUrl();

  const handleScrape = async () => {
    if (!quizSetTitle.trim()) {
      console.error('Scrape Error: Quiz set title is empty.');
      toast({
        title: "Invalid Title",
        description: "Quiz set title cannot be empty.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
      return;
    }
  
    console.log('Starting the scraping process...');
    const processingToastId = toast({
      title: 'Processing...',
      description: 'Scraping is in progress. Please wait.',
      status: 'info',
      duration: null,
      isClosable: true,
      position: 'bottom-right',
    });
  
    setIsScraping(true);
  
    const rawUrls = scrapeInput;
    const lines = rawUrls.split('\n');
    let processedUrls = lines
      .map(line => {
        console.log("Processing line:", line);
        line = line.trim();
        if (!line) return null;
  
        // Examveda URL input format: base_url, ?page=1, ?page=10
        if (line.includes("examveda")) {
          const [base_url, start_page_str, end_page_str] = line.split(',').map(s => s.trim());
          
          // Extract start_page and end_page
          const start_page = start_page_str ? start_page_str.split('=')[1] : '1';
          const end_page = end_page_str ? end_page_str.split('=')[1] : start_page;
  
          // Ensure the format is correct for sending to backend
          return { base_url, start_page, end_page };
        } 
        
        // Handle other platforms
        else if (line.includes("sanfoundry.com") || line.includes("pinoybix") || line.includes("web.archive.org")) {
          return { base_url: line }; // Single URL handling
        } else {
          const [base_url, start_url, end_url] = line.split(',').map(s => s.trim());
          return { base_url, start_url, end_url }; // Indiabix format
        }
      })
      .filter(line => line); // Remove null or empty lines
  
    console.log("Raw URLs:", rawUrls);
    console.log("Processed URLs sent to Backend:", JSON.stringify(processedUrls, null, 2));
  
    try {
      const response = await fetchWithAuth(`${backendUrl}/startScraping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: quizSetTitle, 
          rawUrls: scrapeInput,
          urls: processedUrls 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('Scraping completed successfully:', data);
  
      onScrapeComplete(true, quizSetTitle);
      toast({
        title: "Scraping Completed",
        description: "New quiz set added successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    } catch (error) {
      console.error('Error during scraping:', error);
      onScrapeComplete(false, quizSetTitle);
      toast({
        title: "Scraping Failed",
        description: "An error occurred during scraping.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    } finally {
      toast.close(processingToastId);
      setIsScraping(false);
      console.log('Scraping process ended.');
    }
  };  

  // Function to download the quiz set as a PDF
  const downloadQuizPdf = async (quizSetId: string) => {
    try {
      console.log(`Downloading PDF for quiz set ID: ${quizSetId}`); // Corrected string interpolation
      const response = await fetchWithAuth(`${backendUrl}/downloadQuizPdf/${quizSetId}`); // Corrected string interpolation
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${quizSetTitle}.pdf`; // Corrected string interpolation
      document.body.appendChild(link);
      link.click();
      link.remove();
      console.log('PDF download completed.');
    } catch (error) {
      console.error('Error during PDF download:', error);
    }
  };

  return (
    <Box>
      <Textarea
        placeholder={`Sample IndiaBix URL:\nhttps://www.indiabix.com/electronics-and-communication-engineering/power-electronics/, 076001, 076010\n\nSample Examveda URL:\nhttps://www.examveda.com/non-verbal-reasoning/practice-mcq-question-on-mirror-images/, ?page=1, ?page=6\n\nSample PinoyBix URL:\nhttps://pinoybix.org/2019/08/mcq-in-operational-amplifier-floyd.html?__im-TCIRkVzL=12394515221565126198`}
        mb={4}
        value={scrapeInput}
        onChange={(e) => setScrapeInput(e.target.value)}
        height="300px"
      />
      <Flex justify="center">
        <Button 
          onClick={handleScrape} 
          isLoading={isScraping}
          disabled={isScraping || !quizSetTitle.trim()}
          width="100px"
        >
          Scrape
        </Button>
      </Flex>
    </Box>
  );
};

export default ScrapingSection;