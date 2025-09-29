import React, { useState, useRef } from 'react';
import type { BotConfig } from '../types';
import ChatWindow from './ChatWindow';
import { CodeBracketIcon, ClipboardIcon, CheckIcon, EyeIcon, EyeSlashIcon } from './icons';

interface PreviewProps {
  config: BotConfig;
}

interface EmbedOptions {
  width: number;
  height: number;
  showBorder: boolean;
  borderRadius: number;
  showShadow: boolean;
}

// --- Safe Base64 Encoding/Decoding ---
function encodeConfig(config: BotConfig): string {
  const json = JSON.stringify(config);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function decodeConfig(encoded: string): BotConfig {
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

const EmbedCode: React.FC<{ config: BotConfig }> = ({ config }) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [embedOptions, setEmbedOptions] = useState<EmbedOptions>({
    width: 400,
    height: 600,
    showBorder: true,
    borderRadius: 12,
    showShadow: true,
  });

  const codeRef = useRef<HTMLPreElement>(null);

  const encodedConfig = encodeConfig(config);
  const embedUrl = `${window.location.origin}${window.location.pathname}#${encodedConfig}`;

  const generateIframeCode = (options: EmbedOptions) => {
    const styles = [
      options.showBorder && 'border: 1px solid #fed7aa;',
      `border-radius: ${options.borderRadius}px;`,
      options.showShadow && 'box-shadow: 0 4px 12px rgba(249, 115, 22, 0.1);',
    ]
      .filter(Boolean)
      .join(' ');

    return `<iframe
  src="${embedUrl}"
  width="${options.width}"
  height="${options.height}"
  style="${styles}"
  title="${config.name}"
  allow="microphone"
></iframe>`;
  };

  const iframeCode = generateIframeCode(embedOptions);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iframeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      if (codeRef.current) {
        const range = document.createRange();
        range.selectNodeContents(codeRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.execCommand('copy');
        selection?.removeAllRanges();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleOptionChange = (key: keyof EmbedOptions, value: number | boolean) => {
    setEmbedOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CodeBracketIcon className="w-6 h-6 text-orange-500" />
          Embed on Your Website
        </h2>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          {showPreview ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Copy and paste this HTML code into your website where you want the chatbot to appear.
      </p>

      {/* Embed Options */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
          <input
            type="number"
            value={embedOptions.width}
            onChange={(e) => handleOptionChange('width', parseInt(e.target.value) || 400)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            min="200"
            max="800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
          <input
            type="number"
            value={embedOptions.height}
            onChange={(e) => handleOptionChange('height', parseInt(e.target.value) || 600)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            min="300"
            max="1000"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={embedOptions.showBorder}
              onChange={(e) => handleOptionChange('showBorder', e.target.checked)}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            Show Border
          </label>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={embedOptions.showShadow}
              onChange={(e) => handleOptionChange('showShadow', e.target.checked)}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            Show Shadow
          </label>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Border Radius: {embedOptions.borderRadius}px
          </label>
          <input
            type="range"
            min="0"
            max="24"
            value={embedOptions.borderRadius}
            onChange={(e) => handleOptionChange('borderRadius', parseInt(e.target.value))}
            className="w-full h-2 bg-orange-100 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Live Preview</h3>
          <div className="flex justify-center p-4 bg-white rounded-lg border border-orange-100">
            <div
              style={{
                width: '100%',
                maxWidth: `${embedOptions.width}px`,
                height: `${embedOptions.height}px`,
                border: embedOptions.showBorder ? '1px solid #fed7aa' : 'none',
                borderRadius: `${embedOptions.borderRadius}px`,
                boxShadow: embedOptions.showShadow ? '0 4px 12px rgba(249, 115, 22, 0.1)' : 'none',
                overflow: 'hidden',
              }}
            >
              <ChatWindow config={config} isEmbedPreview={true} />
            </div>
          </div>
        </div>
      )}

      {/* Code Block */}
      <div className="relative group">
        <pre
          ref={codeRef}
          className="bg-gray-800 text-gray-200 p-4 rounded-lg text-sm overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700"
        >
          <code>{iframeCode}</code>
        </pre>
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <ClipboardIcon className="w-4 h-4" />
                Copy Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
        <h4 className="font-semibold text-gray-900 mb-2">Implementation Tips:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Place the code in your website&apos;s HTML where you want the chatbot</li>
          <li>• Adjust width and height to fit your layout</li>
          <li>• Test on mobile devices to ensure proper display</li>
          <li>• Make sure your website allows iframe embedding</li>
        </ul>
      </div>
    </div>
  );
};

const Preview: React.FC<PreviewProps> = ({ config }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'embed'>('preview');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Tab Navigation */}
      <div className="flex border-b border-orange-100 mb-8">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Chat Preview
        </button>
        <button
          onClick={() => setActiveTab('embed')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'embed'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Embed Code
        </button>
      </div>

      {/* Content */}
      {activeTab === 'preview' ? (
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="mb-4 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Chat Preview</h2>
              <p className="text-gray-600">Test how your chatbot will look and behave</p>
            </div>
            <ChatWindow config={config} />
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <EmbedCode config={config} />
        </div>
      )}
    </div>
  );
};

export default Preview;
