'use client';

/**
 * Chat UI component for trip planning conversations
 */

import { useState, useRef, useEffect } from 'react';
import { Message, TripPreferences, TripPlan } from '@/types/trip';

interface ChatProps {
  sessionId?: string;
  onTripPlanUpdate?: (tripPlan: TripPlan | null, isComplete: boolean) => void;
}

export default function Chat({ sessionId, onTripPlanUpdate }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<TripPreferences>({});
  const [isPlanningComplete, setIsPlanningComplete] = useState(false);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  // RESET: Don't persist session ID - each conversation starts fresh
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: currentSessionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      
      // Convert timestamp string to Date object if needed
      const assistantMessage: Message = {
        ...data.message,
        timestamp: data.message.timestamp instanceof Date 
          ? data.message.timestamp 
          : new Date(data.message.timestamp),
      };
      
      // RESET: Update session ID but don't persist it
      setCurrentSessionId(data.sessionId);
      setMessages(prev => [...prev, assistantMessage]);
      setPreferences(data.preferences || {});
      setIsPlanningComplete(data.isPlanningComplete || false);
      
      if (data.tripPlan) {
        setTripPlan(data.tripPlan);
        onTripPlanUpdate?.(data.tripPlan, data.isPlanningComplete);
      } else {
        onTripPlanUpdate?.(null, false);
      }
      
      // RESET: If plan is complete, clear state after a delay so next conversation starts fresh
      if (data.isPlanningComplete && data.tripPlan) {
        setTimeout(() => {
          setMessages([]);
          setPreferences({});
          setTripPlan(null);
          setIsPlanningComplete(false);
          setCurrentSessionId(undefined);
        }, 30000); // Clear after 30 seconds
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: error instanceof Error ? `Error: ${error.message}` : 'An unexpected error occurred',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <h2 className="text-2xl font-bold mb-2">Welcome to TripPlanner AI</h2>
            <p>I'll help you plan your perfect trip! Tell me about your travel plans.</p>
            <p className="text-sm mt-2">For example: &quot;I want to visit Paris from New York in June&quot;</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp instanceof Date 
                  ? message.timestamp.toLocaleTimeString()
                  : new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Trip Plan Display */}
      {tripPlan && isPlanningComplete && (
        <div className="border-t border-gray-300 p-4 bg-green-50">
          <h3 className="font-bold text-lg mb-2">✨ Your Trip Plan is Ready!</h3>
          <div className="text-sm text-gray-700">
            <p><strong>Destination:</strong> {tripPlan.destination}</p>
            <p><strong>Duration:</strong> {tripPlan.duration} days</p>
            {tripPlan.totalEstimatedCost && (
              <p><strong>Estimated Cost:</strong> {tripPlan.totalEstimatedCost}</p>
            )}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-300 p-4">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
