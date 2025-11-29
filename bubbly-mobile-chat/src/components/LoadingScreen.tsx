import React from 'react';
import { MessageCircle } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main logo container */}
      <div className="relative z-10 animate-scale-in">
        <div className="relative">
          {/* Outer ring animation */}
          <div className="absolute inset-0 w-32 h-32 -translate-x-4 -translate-y-4">
            <div className="w-full h-full border-4 border-primary/20 rounded-full animate-ping"></div>
          </div>
          
          {/* Middle ring */}
          <div className="absolute inset-0 w-28 h-28 -translate-x-2 -translate-y-2">
            <div className="w-full h-full border-3 border-primary/30 rounded-full animate-pulse"></div>
          </div>

          {/* Main icon container */}
          <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
            <MessageCircle className="w-12 h-12 text-primary-foreground animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
        </div>
      </div>

      {/* Loading text with dots animation */}
      <div className="relative z-10 mt-12 flex items-center gap-1 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <span className="text-muted-foreground text-base font-medium">Bloop</span>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.4s' }}></span>
          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}></span>
          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
