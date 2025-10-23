import { useState } from "react";
import { Header } from "./components/Header";
import { ChatInterface } from "./components/ChatInterface";
import { PDFPanel } from "./components/PDFPanel";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [chatKey, setChatKey] = useState(0);
  const [currentFileId, setCurrentFileId] = useState<string>('');
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [currentTotalPages, setCurrentTotalPages] = useState<number>(0);

  const handleClearChat = () => {
    setChatKey((prev) => prev + 1);
  };

  const handleFileReady = (fileId: string, fileName: string, totalPages: number) => {
    setCurrentFileId(fileId);
    setCurrentFileName(fileName);  
    setCurrentTotalPages(totalPages);
  };

  return (
    <div className="min-h-screen text-foreground relative overflow-hidden">

      
      <div className="relative z-10">
        <div className="h-screen flex flex-col">
          {/* Header with reduced bottom margin */}
          <div className="max-w-7xl mx-auto w-full">
            <Header />
          </div>

          {/* Main Content - Consistent spacing layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 min-h-0 px-6 pb-6">
            {/* Left Column - Chat Interface (larger) */}
            <div className="flex flex-col min-h-0">
              <ChatInterface
                key={chatKey}
                onClearChat={handleClearChat}
                fileId={currentFileId}
                fileName={currentFileName}
              />
            </div>

            {/* Right Column - PDF Panel (smaller, aligned to right edge) */}
            <div className="flex flex-col min-h-0">
              <PDFPanel 
                onFileReady={handleFileReady}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
        theme="dark"
      />
    </div>
  );
}