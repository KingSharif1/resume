import React from 'react';
import MylesChatInterface from './Component';

export default function App() {
  return (
    <div className="w-full h-screen bg-slate-100 p-4 md:p-8 flex items-center justify-center">
      {/* 
        Container constraints to show responsive behavior 
        In a real app, you might just let it fill the available space
      */}
      <div className="w-full max-w-6xl h-[800px] max-h-[90vh]">
        <MylesChatInterface 
          userName="Recruiter" 
          aiName="Myles"
        />
      </div>
    </div>
  );
}
