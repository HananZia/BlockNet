import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  FileUp,
  Shield,
  File,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  MoreVertical,
  Loader2,
  Upload
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/config/api';

interface FileItem {
  id: number;
  name: string;
  filehash: string;
  size?: string;
  verified: boolean;
  created_at: string;
}

interface VerificationResult {
  verified: boolean;
  status: string;
  message?: string;
  file?: FileItem;
}

export default function Files() {
  const [activeTab, setActiveTab] = useState('my-files');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const verifyInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // ---------------- FETCH FILES ----------------
  const fetchFiles = async () => {
    try {
      const data: FileItem[] = await api.get(ENDPOINTS.FILES);
      setFiles(data);
    } catch (err: any) {
      console.error('Failed to fetch files:', err);
      toast({ title: 'Error', description: err.message || 'Failed to fetch your files', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // ---------------- UPLOAD FILE ----------------
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await api.uploadFile(ENDPOINTS.FILE_UPLOAD, file, (percent) => setUploadProgress(percent));
      toast({ title: 'Success', description: `${file.name} uploaded successfully` });
      setIsUploading(false);
      setUploadProgress(0);
      fetchFiles();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Failed to upload file', variant: 'destructive' });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // ---------------- VERIFY FILE ----------------
  const handleVerifySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVerifyFile(file);
      setVerificationResult(null);
    }
  };

  const handleVerify = async () => {
    if (!verifyFile) return;

    setIsVerifying(true);
    setVerificationResult(null);

    const formData = new FormData();
    formData.append('file', verifyFile);

    try {
      const data = await api.post<VerificationResult>(ENDPOINTS.FILE_VERIFY, formData, true);
      setVerificationResult(data);

      // Display toast based on verification status
      switch (data.status) {
        case 'VERIFIED':
          toast({
            title: 'File Verified!',
            description: 'This file exists on the blockchain and is authentic.',
            variant: 'default',
          });
          break;
        case 'TAMPERED':
          toast({
            title: 'File Tampered!',
            description: data.message || 'The file content has been modified.',
            variant: 'destructive',
          });
          break;
        case 'NOT_FOUND':
          toast({
            title: 'File Not Found',
            description: data.message || 'This file is not registered.',
            variant: 'destructive',
          });
          break;
        case 'NO_CERTIFICATE':
          toast({
            title: 'No Certificate',
            description: data.message || 'No blockchain certificate found.',
            variant: 'destructive',
          });
          break;
        case 'BLOCK_NOT_FOUND':
          toast({
            title: 'Blockchain Error',
            description: 'The blockchain block for this file could not be found.',
            variant: 'destructive',
          });
          break;
        case 'INVALID_BLOCK_DATA':
          toast({
            title: 'Blockchain Error',
            description: 'The blockchain block data is invalid.',
            variant: 'destructive',
          });
          break;
        default:
          toast({
            title: 'Unknown Error',
            description: 'Verification returned an unexpected status.',
            variant: 'destructive',
          });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Verification failed', variant: 'destructive' });
    } finally {
      setIsVerifying(false);
    }
  };

  // ---------------- COPY HASH ----------------
  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({ title: 'Hash copied to clipboard' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Files</h1>
        <p className="text-muted-foreground">Upload, verify, and manage your files</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-files">My Files</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="verify">Verify</TabsTrigger>
        </TabsList>

        {/* ---------------- MY FILES ---------------- */}
        <TabsContent value="my-files" className="space-y-4">
          {files.length === 0 && <p className="text-sm text-muted-foreground">No files uploaded yet.</p>}
          <div className="space-y-3">
            {files.map((file) => (
              <Card key={file.id} className="border-border/50">
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <File className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{file.size || '—'}</span>
                      <span>•</span>
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant={file.verified ? 'default' : 'secondary'} className="shrink-0">
                    {file.verified ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" /> Pending</>
                    )}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => copyHash(file.filehash)}>
                        <Copy className="w-4 h-4 mr-2" /> Copy Hash
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="w-4 h-4 mr-2" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className="w-4 h-4 mr-2" /> View Certificate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ---------------- UPLOAD ---------------- */}
        <TabsContent value="upload" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileUp className="w-5 h-5" />
                <span>Upload File</span>
              </CardTitle>
              <CardDescription>Upload a file to register it on the blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
              {isUploading ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/30">
                    <div className="text-center space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      <p className="text-sm font-medium">Uploading...</p>
                    </div>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">{uploadProgress}% complete</p>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Click to select a file</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, Images up to 50MB</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- VERIFY ---------------- */}
        <TabsContent value="verify" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Verify File</span>
              </CardTitle>
              <CardDescription>Check if a file exists on the blockchain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input ref={verifyInputRef} type="file" className="hidden" onChange={handleVerifySelect} />
              <div
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => verifyInputRef.current?.click()}
              >
                {verifyFile ? (
                  <div className="text-center">
                    <File className="w-10 h-10 text-primary mx-auto mb-2" />
                    <p className="font-medium">{verifyFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to select a different file</p>
                  </div>
                ) : (
                  <>
                    <Shield className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">Select a file to verify</p>
                    <p className="text-xs text-muted-foreground mt-1">We'll check if it exists on the blockchain</p>
                  </>
                )}
              </div>

              {verifyFile && !verificationResult && (
                <Button onClick={handleVerify} className="w-full" disabled={isVerifying}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Verify File
                    </>
                  )}
                </Button>
              )}

              {verificationResult && (
  <Card
    className={`border-2 ${
      verificationResult.status === 'VERIFIED'
        ? 'border-success bg-success/5'
        : verificationResult.status === 'TAMPERED'
        ? 'border-destructive bg-destructive/5'
        : 'border-warning bg-warning/5'
    }`}
  >
    <CardContent className="p-4 flex items-center space-x-3">
      {verificationResult.status === 'VERIFIED' ? (
        <CheckCircle2 className="w-8 h-8 text-success shrink-0" />
      ) : verificationResult.status === 'TAMPERED' ? (
        <XCircle className="w-8 h-8 text-destructive shrink-0" />
      ) : (
        <Shield className="w-8 h-8 text-warning shrink-0" />
      )}
      <div>
        <p className="font-semibold">
          {verificationResult.status === 'VERIFIED'
            ? 'File Verified!'
            : verificationResult.status === 'TAMPERED'
            ? 'File Tampered!'
            : verificationResult.status === 'NOT_FOUND'
            ? 'File Not Registered'
            : verificationResult.status === 'NO_CERTIFICATE'
            ? 'No Certificate'
            : verificationResult.status === 'BLOCK_NOT_FOUND'
            ? 'Blockchain Block Not Found'
            : verificationResult.status === 'INVALID_BLOCK_DATA'
            ? 'Invalid Blockchain Data'
            : 'Unknown Status'}
        </p>
        <p className="text-sm text-muted-foreground">
          {verificationResult.status === 'VERIFIED'
            ? 'This file exists on the blockchain and is authentic.'
            : verificationResult.status === 'TAMPERED'
            ? 'The file content has been modified since issuance.'
            : verificationResult.status === 'NOT_FOUND'
            ? 'This file has never been uploaded or name does not match.'
            : verificationResult.status === 'NO_CERTIFICATE'
            ? 'The file is uploaded but no blockchain certificate exists yet.'
            : verificationResult.status === 'BLOCK_NOT_FOUND'
            ? 'The blockchain block for this file could not be found.'
            : verificationResult.status === 'INVALID_BLOCK_DATA'
            ? 'The blockchain block data is invalid.'
            : verificationResult.message || 'An unknown error occurred.'}
        </p>

        {verificationResult.file?.filehash && (
          <div className="mt-3 p-2 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground mb-1">Blockchain Hash</p>
            <div className="flex items-center space-x-2">
              <code className="text-xs flex-1 truncate">{verificationResult.file.filehash}</code>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-6 w-6"
                onClick={() => navigator.clipboard.writeText(verificationResult.file!.filehash)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}