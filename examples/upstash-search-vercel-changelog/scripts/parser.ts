import { DOMParser } from 'xmldom';

// Define the interface for our entry data
interface FeedEntry {
  id: string;
  title: string;
  link: string;
  updated: string;
  content: string;
  author: string[];
}

// Function to extract text content from XML elements
function getTextContent(element: Element | null): string {
  return element?.textContent?.trim() || '';
}

// Function to get href attribute from link elements
function getLinkHref(element: Element | null): string {
  return element?.getAttribute('href') || '';
}

// Function to extract authors from entry
function getAuthors(entryElement: Element): string[] {
  const authors: string[] = [];
  const authorElements = entryElement.getElementsByTagName('author');
  
  for (let i = 0; i < authorElements.length; i++) {
    const nameElement = authorElements[i].getElementsByTagName('name')[0];
    const authorName = getTextContent(nameElement);
    if (authorName) {
      authors.push(authorName);
    }
  }
  
  return authors;
}

// Function to extract content from the content element
function getContent(entryElement: Element): string {
  const contentElement = entryElement.getElementsByTagName('content')[0];
  if (!contentElement) return '';
  
  // Get the inner content, handling XHTML content
  const divElement = contentElement.getElementsByTagName('div')[0];
  if (divElement) {
    // Extract text content from all paragraphs and elements
    const textContent = divElement.textContent || '';
    return textContent.trim();
  }
  
  return getTextContent(contentElement);
}

// Main function to parse the XML file and extract entries
async function parseXMLFeed(xmlUrl: string): Promise<FeedEntry[]> {
  try {
    // Fetch the XML content
    const response = await fetch(xmlUrl);
    const xmlContent = await response.text();

    // Parse the XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Get all entry elements
    const entries = xmlDoc.getElementsByTagName('entry');
    const feedEntries: FeedEntry[] = [];
    
    // Process each entry
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      const feedEntry: FeedEntry = {
        id: getTextContent(entry.getElementsByTagName('id')[0]),
        title: getTextContent(entry.getElementsByTagName('title')[0]),
        link: getLinkHref(entry.getElementsByTagName('link')[0]),
        updated: getTextContent(entry.getElementsByTagName('updated')[0]),
        content: getContent(entry),
        author: getAuthors(entry)
      };
      
      feedEntries.push(feedEntry);
    }
    
    return feedEntries;
    
  } catch (error) {
    console.error('Error parsing XML file:', error);
    throw error;
  }
}

async function getEntries() {
  const xmlUrl = 'https://vercel.com/atom'; // Update this path to your XML file location
  
  try {
    // Parse the XML and get entries
    const entries = await parseXMLFeed(xmlUrl);
    
    return entries; // Return the array for further use
    
  } catch (error) {
    console.error('Failed to process XML feed:', error);
    return [];
  }
}

// Export the functions for use in other modules
export { parseXMLFeed, type FeedEntry, getEntries };
