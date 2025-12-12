import React from 'react';
import ResumeAnalysisDashboard from './Component';

export default function App() {
  return (
    <div className="w-full min-h-screen bg-slate-100 p-4 md:p-12 flex justify-center">
      <ResumeAnalysisDashboard 
        onReply={(id, msg) => {
          console.log(`Sending reply for suggestion ${id}: ${msg}`);
          alert(`Reply sent to chat: "${msg}"`);
        }}
      />
    </div>
  );
}
