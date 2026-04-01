export default function MarkdownRenderer({ content }) {
  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (!trimmed) { i++; continue; }

    // Tables
    if (trimmed.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      elements.push(<MarkdownTable key={elements.length} lines={tableLines} />);
      continue;
    }

    // H2
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={elements.length} className="text-2xl font-extrabold tracking-tight mt-12 mb-4" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
          {trimmed.replace('## ', '')}
        </h2>
      );
      i++; continue;
    }

    // H3
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={elements.length} className="text-lg font-bold mt-8 mb-3" style={{ color: '#0F172A' }}>
          {trimmed.replace('### ', '')}
        </h3>
      );
      i++; continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={elements.length} className="pl-5 py-2 my-6 italic text-base" style={{ borderLeft: '3px solid #6C5CE7', color: '#64748B' }}>
          <InlineMarkdown text={trimmed.replace('> ', '')} />
        </blockquote>
      );
      i++; continue;
    }

    // Bullet list (collect consecutive)
    if (trimmed.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().replace(/^- /, ''));
        i++;
      }
      elements.push(
        <div key={elements.length} className="my-3 space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0" style={{ background: '#6C5CE7' }} />
              <p className="text-base leading-relaxed"><InlineMarkdown text={item} /></p>
            </div>
          ))}
        </div>
      );
      continue;
    }

    // Numbered list (collect consecutive)
    if (trimmed.match(/^\d+\.\s/)) {
      const items = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s/)) {
        const t = lines[i].trim();
        items.push(t.replace(/^\d+\.\s*/, ''));
        i++;
      }
      elements.push(
        <div key={elements.length} className="my-3 space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-sm font-bold mt-0.5 flex-shrink-0" style={{ color: '#6C5CE7' }}>{idx + 1}.</span>
              <p className="text-base leading-relaxed"><InlineMarkdown text={item} /></p>
            </div>
          ))}
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={elements.length} className="text-base leading-relaxed mb-4">
        <InlineMarkdown text={trimmed} />
      </p>
    );
    i++;
  }

  return <div className="prose prose-lg max-w-none" style={{ color: '#374151' }}>{elements}</div>;
}

function InlineMarkdown({ text }) {
  // Split by bold markers **...**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: '#0F172A' }}>{part.slice(2, -2)}</strong>;
        }
        // Handle italic *...*
        const italicParts = part.split(/(\*[^*]+\*)/g);
        return italicParts.map((ip, j) => {
          if (ip.startsWith('*') && ip.endsWith('*') && !ip.startsWith('**')) {
            return <em key={`${i}-${j}`}>{ip.slice(1, -1)}</em>;
          }
          return <span key={`${i}-${j}`}>{ip}</span>;
        });
      })}
    </>
  );
}

function MarkdownTable({ lines }) {
  if (lines.length < 2) return null;

  const parseRow = (line) =>
    line.split('|').map(c => c.trim()).filter(Boolean);

  const headers = parseRow(lines[0]);
  // Skip separator row (line[1])
  const rows = lines.slice(2).map(parseRow);

  return (
    <div className="my-8 overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'rgba(108,92,231,0.04)' }}>
            {headers.map((h, i) => (
              <th key={i} className="text-left px-5 py-3 font-bold" style={{ color: '#0F172A', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <InlineMarkdown text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? 'white' : 'rgba(0,0,0,0.01)' }}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-5 py-3" style={{ color: '#374151', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <InlineMarkdown text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}