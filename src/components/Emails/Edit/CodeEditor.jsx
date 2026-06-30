import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';

const highlightHTML = (code) => {
  if (!code) return '';
  
  // Es muy importante no agregar padding horizontal ni elementos extra (como anchos fijos o márgenes) 
  // dentro de los spans, ya que eso desfasaría el texto del <pre> respecto al <textarea>.
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // {{variables}}
    .replace(/(\{\{.*?\}\})/g, '<span style="color: #fcd34d; background-color: rgba(252, 211, 77, 0.15);">$1</span>')
    // attributes + hex colors
    .replace(/([a-zA-Z\-]+)=(&quot;.*?&quot;|".*?"|'.*?')/g, (match, attr, val) => {
        const valWithColors = val.replace(/(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/gi, (color) => {
            // Usamos text-decoration para no afectar el modelo de caja ni line-height
            return `<span style="text-decoration: underline; text-decoration-color: ${color}; text-decoration-thickness: 3px;">${color}</span>`;
        });
        return `<span style="color: #c4b5fd;">${attr}</span>=<span style="color: #a7f3d0;">${valWithColors}</span>`;
    })
    // tag names
    .replace(/(&lt;\/?)([a-zA-Z0-9\-]+)/g, '$1<span style="color: #38bdf8;">$2</span>')
    // angle brackets
    .replace(/(&lt;|&gt;)/g, '<span style="color: #64748b;">$1</span>');
};

export default function CodeEditor({ value, onChange }) {
  const [html, setHtml] = useState('');
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  
  useEffect(() => {
    // Es importante añadir un salto de línea invisible al final para que el scroll del <pre>
    // coincida perfectamente cuando el usuario añade saltos de línea al final del textarea.
    setHtml(highlightHTML(value) + (value.endsWith('\n') ? ' ' : ''));
  }, [value]);

  const syncScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Sincronizar scroll en cada actualización visual
  useLayoutEffect(() => {
    syncScroll();
  });

  const sharedStyle = {
    margin: 0,
    padding: '20px',
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    fontSize: '15px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
    border: 'none',
    boxSizing: 'border-box',
    tabSize: 2,
    letterSpacing: 'normal',
    fontVariantLigatures: 'none',
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'antialiased'
  };

  return (
    <div style={{ position: 'relative', flex: 1, width: '100%', minHeight: '400px', backgroundColor: '#0f172a', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
      <pre 
        ref={preRef}
        aria-hidden="true"
        style={{
          ...sharedStyle,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          color: '#e2e8f0', // Color base del texto (blanco/grisáceo)
          overflow: 'auto', // Hacer que tenga el mismo scrollbar que textarea para alinear anchos!
          pointerEvents: 'none' // Para que los clics pasen directamente al textarea
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          syncScroll();
        }}
        onScroll={syncScroll}
        spellCheck="false"
        style={{
          ...sharedStyle,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          color: 'transparent', // Ocultamos el texto crudo del textarea
          background: 'transparent',
          caretColor: '#f8fafc', // El cursor sí debe ser visible
          resize: 'none',
          outline: 'none',
          overflow: 'auto'
        }}
      />
    </div>
  );
}
