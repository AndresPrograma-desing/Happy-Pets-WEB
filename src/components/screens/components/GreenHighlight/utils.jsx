import React from 'react';
import GreenHighlight from './Index.jsx';
import BlueLink from '../BlueLink/Index.jsx';
import CopyableText from '../CopyText/Index.jsx';

export const formatHighlightedText = (content, GreenHighlightComponent = GreenHighlight) => {
    if (typeof content !== 'string') return content;
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <GreenHighlightComponent key={index}>{part.slice(2, -2)}</GreenHighlightComponent>;
        }
        return part;
    });
};

export const renderFormattedText = (content, navigate) => {
    if (typeof content !== 'string') return content;
    const parts = content.split(/(\*\*[^*]+\*\*|\$[^\$]+\$|\([^)]+\))/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <GreenHighlight key={index}>{part.slice(2, -2)}</GreenHighlight>;
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        const rawContent = part.slice(1, -1).trim();
        let label = rawContent, url = rawContent;
        if (rawContent.includes('|')) {
          const segments = rawContent.split('|');
          label = segments[0].trim();
          url = segments[1].trim();
        }
        return <BlueLink key={index} label={label} url={url} navigate={navigate} />;
      }
      if (part.startsWith('(') && part.endsWith(')')) {
        return <CopyableText key={index} text={part.slice(1, -1)} />;
      }
      return part;
    });
};
