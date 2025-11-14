import React, { useState, useRef } from 'react';
import { analyzeImage } from '../services/geminiService';
import { ImageIcon } from './icons';

export const AnalyzeImageView: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('What do you see in this image?');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsLoading(true);
    setAnalysis('');
    
    // Assumes image is data URL: "data:image/jpeg;base64,..."
    const parts = image.split(',');
    if (parts.length !== 2) {
      setAnalysis("Invalid image format.");
      setIsLoading(false);
      return;
    }
    const mimeType = parts[0].split(':')[1].split(';')[0];
    const base64Data = parts[1];

    try {
      const result = await analyzeImage(base64Data, mimeType, prompt);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      setAnalysis('Failed to analyze the image.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
      <div className="w-full max-w-lg mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Analyze Image</h2>
        
        <div 
          className="w-full h-48 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? (
            <img src={image} alt="Upload preview" className="max-h-full max-w-full object-contain rounded-md" />
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <ImageIcon className="w-12 h-12 mb-2" />
              <span>Click to upload an image</span>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />

        {image && (
          <div className="w-full space-y-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask something about the image..."
              className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !image}
              className="w-full px-4 py-3 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-600 text-white font-bold disabled:opacity-50 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/20 focus:ring-cyan-400"
            >
              {isLoading ? 'Analyzing...' : 'Analyze with Gemini'}
            </button>
          </div>
        )}
        
        {analysis && (
          <div className="text-left bg-black/20 p-4 rounded-lg max-h-48 overflow-y-auto">
            <p className="whitespace-pre-wrap">{analysis}</p>
          </div>
        )}
      </div>
    </div>
  );
};
