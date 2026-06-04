import { useState } from 'react';
import toast from 'react-hot-toast';

const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="btn-secondary !px-3 !py-1.5 text-xs"
      title="Copy to clipboard"
    >
      {copied ? (
        <span className="flex items-center gap-1 text-green-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </span>
      ) : (
        label
      )}
    </button>
  );
};

export default CopyButton;
