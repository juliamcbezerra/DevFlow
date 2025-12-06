import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
  return (
    <div className={`prose prose-invert max-w-none text-zinc-200 text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customização para blocos de código
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="rounded-lg overflow-hidden my-3 border border-zinc-700/50 shadow-lg">
                <div className="bg-zinc-800/50 px-3 py-1 text-xs text-zinc-500 font-mono border-b border-zinc-700/50 flex justify-between">
                    <span>{match[1]}</span>
                    <span>Code Snippet</span>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{ margin: 0, padding: '1rem', background: 'rgba(24, 24, 27, 0.5)' }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-zinc-800 text-violet-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                {children}
              </code>
            );
          },
          // Customização para links
          a: ({ node, ...props }) => (
            <a {...props} className="text-violet-400 hover:text-violet-300 hover:underline transition-colors" target="_blank" rel="noopener noreferrer" />
          ),
          // Customização para parágrafos (evita margem extra)
          p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}