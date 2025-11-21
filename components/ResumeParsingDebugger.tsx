'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseResumeFile } from '@/lib/unified-resume-parser';
import { parseToEditableSections } from '@/lib/parse-to-sections';
import { Upload, FileText, Layers, Code, Search, Database } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ParsingLog {
  step: string;
  description: string;
  data?: any;
  timestamp: Date;
}

export function ResumeParsingDebugger() {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [parsedSections, setParsedSections] = useState<any[]>([]);
  const [editableSections, setEditableSections] = useState<any[]>([]);
  const [logs, setLogs] = useState<ParsingLog[]>([]);
  const [useAI, setUseAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const addLog = (step: string, description: string, data?: any) => {
    const log: ParsingLog = {
      step,
      description,
      data,
      timestamp: new Date()
    };
    setLogs(prev => [...prev, log]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLogs([]);
    addLog('File Selected', `File "${selectedFile.name}" selected for parsing`);
  };

  const extractText = async () => {
    if (!file) return;

    setIsLoading(true);
    addLog('Text Extraction', `Starting text extraction from ${file.name}`);

    try {
      // Create a FileReader to read the file contents
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Start the parsing process
          addLog('Parsing', 'Starting unified parser');
          
          // Parse the resume using the unified parser
          const parseResult = await parseResumeFile(file, { useAI });
          
          // Log the raw text
          setRawText(parseResult.sections.map(s => `${s.title}\n${s.content}`).join('\n\n'));
          addLog('Text Extracted', 'Raw text extracted from document', { text: rawText });
          
          // Log the parsed sections
          setParsedSections(parseResult.sections);
          addLog('Sections Detected', `Detected ${parseResult.sections.length} sections`, { sections: parseResult.sections });
          
          // Convert to editable sections
          const sections = await parseToEditableSections(file, useAI);
          setEditableSections(sections);
          addLog('Editable Sections', 'Converted to editable sections', { editableSections: sections });
          
          // Move to the results tab
          setActiveTab('results');
        } catch (error) {
          console.error('Parsing error:', error);
          addLog('Error', `Error parsing document: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        addLog('Error', 'Error reading file');
        setIsLoading(false);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('File reading error:', error);
      addLog('Error', `Error reading file: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resume Parsing Debugger</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Resume</TabsTrigger>
              <TabsTrigger value="results" disabled={parsedSections.length === 0}>
                Parsing Results
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-ai"
                  checked={useAI}
                  onCheckedChange={setUseAI}
                />
                <Label htmlFor="use-ai">Use AI for enhanced parsing</Label>
              </div>
              
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload-debug"
                />
                <label
                  htmlFor="resume-upload-debug"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <Upload className="w-12 h-12 text-slate-400" />
                  <div>
                    <span className="text-base font-medium text-slate-700 block mb-1">
                      {file ? file.name : 'Click to upload resume'}
                    </span>
                    <span className="text-sm text-slate-500">
                      PDF or DOCX files
                    </span>
                  </div>
                </label>
              </div>
              
              {file && (
                <Button 
                  onClick={extractText} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Parsing...' : 'Parse Resume'}
                </Button>
              )}
            </TabsContent>
            
            <TabsContent value="results" className="space-y-6">
              <Tabs defaultValue="raw">
                <TabsList>
                  <TabsTrigger value="raw">Raw Text</TabsTrigger>
                  <TabsTrigger value="sections">Detected Sections</TabsTrigger>
                  <TabsTrigger value="editable">Editable Sections</TabsTrigger>
                  <TabsTrigger value="logs">Parsing Logs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="raw" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Extracted Raw Text</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={rawText}
                        readOnly
                        className="font-mono text-sm h-[400px]"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="sections" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Detected Sections ({parsedSections.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-auto">
                      {parsedSections.map((section, index) => (
                        <div key={index} className="mb-4 border rounded-md p-4">
                          <div className="font-medium mb-1 flex items-center">
                            <Layers className="w-4 h-4 mr-2" />
                            {section.title} <span className="ml-2 text-xs bg-slate-100 px-2 py-1 rounded">{section.type}</span>
                          </div>
                          <div className="text-sm whitespace-pre-wrap bg-slate-50 p-2 rounded">
                            {section.content}
                          </div>
                          {section.structuredData && (
                            <div className="mt-2">
                              <div className="text-xs font-medium text-slate-500 mb-1">Structured Data:</div>
                              <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-[200px]">
                                {JSON.stringify(section.structuredData, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="editable" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Editable Sections ({editableSections.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-auto">
                      {editableSections.map((section, index) => (
                        <div key={index} className="mb-4 border rounded-md p-4">
                          <div className="font-medium mb-1 flex items-center">
                            <Database className="w-4 h-4 mr-2" />
                            {section.title} <span className="ml-2 text-xs bg-slate-100 px-2 py-1 rounded">{section.type}</span>
                          </div>
                          <div className="mt-2">
                            <div className="text-xs font-medium text-slate-500 mb-1">Content:</div>
                            <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-[200px]">
                              {typeof section.content === 'object' 
                                ? JSON.stringify(section.content, null, 2)
                                : section.content}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="logs" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Parsing Logs ({logs.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-auto">
                      {logs.map((log, index) => (
                        <div key={index} className="mb-3 border-b pb-3 last:border-b-0">
                          <div className="flex justify-between">
                            <div className="font-medium">{log.step}</div>
                            <div className="text-xs text-slate-500">
                              {log.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="text-sm mt-1">{log.description}</div>
                          {log.data && (
                            <details className="mt-2">
                              <summary className="text-xs text-blue-600 cursor-pointer">View Details</summary>
                              <pre className="text-xs mt-2 bg-slate-100 p-2 rounded overflow-auto max-h-[200px]">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
