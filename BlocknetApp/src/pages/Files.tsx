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
  Loader2,
  Upload,
  MoreVertical
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
  file?: FileItem | null;
}

export default function Files() {
  const [activeTab, setActiveTab] = useState('my-files');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [verifiedFiles, setVerifiedFiles] = useState<FileItem[]>([]);
  const [pendingFiles, setPendingFiles] = useState<FileItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const verifyInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // ---------------- UTIL ----------------
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({ title: 'Hash copied to clipboard', variant: 'default' });
  };

  const getVerificationSummary = (result: VerificationResult) => {
    switch (result.status) {
      case 'VERIFIED':
        return 'This file is authentic. No changes were detected since it was registered on the blockchain.';
      case 'TAMPERED':
        return 'This file has been altered. Its contents do not match the original blockchain record.';
      case 'NOT_FOUND':
        return 'This file does not exist on the blockchain.';
      default:
        return result.message || 'Unable to determine file authenticity.';
    }
  };

  // ---------------- FETCH FILES ----------------
  const fetchFiles = async () => {
    try {
      const data: FileItem[] = await api.get(ENDPOINTS.FILES);
      setFiles(data);

      const verified: FileItem[] = [];
      const pending: FileItem[] = [];
      data.forEach((f) => (f.verified ? verified.push(f) : pending.push(f)));
      setVerifiedFiles(verified);
      setPendingFiles(pending);
    } catch (err: any) {
      console.error('Failed to fetch files:', err);
      toast({ title: 'Error', description: err.message || 'Failed to fetch files', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // ---------------- UPLOAD FILE ----------------
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeMB = 50;
    if (file.size / 1024 / 1024 > maxSizeMB) {
      toast({ title: 'File too large', description: `Max size is ${maxSizeMB}MB`, variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await api.uploadFile(ENDPOINTS.FILE_UPLOAD, file, (percent) => setUploadProgress(percent));
      toast({ title: 'Success', description: `${file.name} uploaded successfully` });
      fetchFiles();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Upload Failed', description: err.message || 'Failed to upload file', variant: 'destructive' });
    } finally {
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
      if (data.status === 'VERIFIED') {
        toast({ title: 'File Verified!', description: 'This file is authentic on the blockchain.', variant: 'default' });
      } else {
        toast({ title: data.status, description: data.message || '', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Verification failed', variant: 'destructive' });
    } finally {
      setIsVerifying(false);
    }
  };

  // ---------------- DOWNLOAD FILE ----------------
  const handleDownloadFile = async (file: FileItem) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      toast({ title: 'Error', description: 'You are not authenticated', variant: 'destructive' });
      return;
    }

    try {
      const res = await fetch(`/api/files/download/${file.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to download file');

      const blob = await res.blob();

      // Extract filename from headers if provided
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = file.name;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Failed to download file', variant: 'destructive' });
    }
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
              <Card key={file.id} className={`border-border/50 ${file.verified ? '' : 'bg-yellow-50'}`}>
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
                  <Badge variant={file.verified ? 'default' : 'secondary'} className="shrink-0"></Badge>

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
                  <p className="text-xs text-muted-foreground mt-1">Any file type up to 50MB</p>
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" /> Verify File
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
                    <div className="space-y-1">
                      <p className="font-semibold text-base">{verificationResult.status}</p>
                      <p className="text-sm">{getVerificationSummary(verificationResult)}</p>
                      {verificationResult.file && (
                        <p className="text-xs text-muted-foreground">
                          Registered on {new Date(verificationResult.file.created_at).toLocaleDateString()}
                        </p>
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
