import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { FileItem, SharedFile } from '@/types';
import {
  Card, CardContent
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Share2, File as FileIcon, Loader2, Download } from 'lucide-react';

interface ShareDialogState {
  open: boolean;
  fileId?: string;
  name?: string;
  recipientEmail: string;
  isSharing: boolean;
}

export default function Sharing() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'my-files' | 'my-shares' | 'shared-with-me'>('my-files');
  const [myFiles, setMyFiles] = useState<FileItem[]>([]);
  const [myShares, setMyShares] = useState<SharedFile[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<SharedFile[]>([]);
  const [shareDialog, setShareDialog] = useState<ShareDialogState>({
    open: false,
    recipientEmail: '',
    isSharing: false,
  });

  // Fetch verified files
  const fetchMyFiles = async () => {
    try {
      const res = await api.get<FileItem[]>('/files/verified');
      // Map backend name to frontend `name`
      const mapped = res.map(file => ({ ...file, name: file.name || file.name }));
      setMyFiles(mapped);
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to fetch verified files', variant: 'destructive' });
    }
  };

  // Fetch files shared by me
  const fetchMyShares = async () => {
    try {
      const res = await api.get<SharedFile[]>('/share/shared-by-me');
      const mapped = res.map(share => ({
        ...share,
        file: { ...share.file, name: share.file.name || share.file.name }
      }));
      setMyShares(mapped);
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to fetch shared files', variant: 'destructive' });
    }
  };

  // Fetch files shared with me
  const fetchSharedWithMe = async () => {
    try {
      const res = await api.get<SharedFile[]>('/share/shared-with-me');
      const mapped = res.map(share => ({
        ...share,
        file: { ...share.file, name: share.file.name || share.file.name }
      }));
      setSharedWithMe(mapped);
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to fetch files shared with you', variant: 'destructive' });
    }
  };

  const openShareDialog = (fileId: string, name: string) => {
    setShareDialog({ open: true, fileId, name, recipientEmail: '', isSharing: false });
  };

  const handleShareFile = async () => {
    if (!shareDialog.recipientEmail || !shareDialog.fileId) {
      toast({ title: 'Error', description: 'Please enter recipient email', variant: 'destructive' });
      return;
    }

    setShareDialog(prev => ({ ...prev, isSharing: true }));

    try {
      await api.post('/share/share', {
        receiver_email: shareDialog.recipientEmail,
        file_id: shareDialog.fileId
      });
      toast({ title: 'Success', description: `File shared with ${shareDialog.recipientEmail}` });
      setShareDialog({ open: false, recipientEmail: '', isSharing: false });
      fetchMyShares();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to share file', variant: 'destructive' });
      setShareDialog(prev => ({ ...prev, isSharing: false }));
    }
  };

  const handleDownload = async (file: FileItem) => {
  const response = await fetch(
    `/api/files/download/${file.id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Download failed");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();

  window.URL.revokeObjectURL(url);
};


  useEffect(() => {
    fetchMyFiles();
    fetchMyShares();
    fetchSharedWithMe();
  }, []);

  const renderSharedFileCard = (share: SharedFile, type: 'myShares' | 'sharedWithMe') => {
    const name = share.file?.name || 'Unknown';
    const email = type === 'myShares' ? share.shared_with?.email : share.shared_by?.email;
    const userLabel = type === 'myShares' ? 'Shared with' : 'From';

    return (
      <Card key={share.id}>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileIcon className="w-5 h-5 text-accent" />
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">{userLabel}: {email || 'Unknown'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-muted-foreground">{new Date(share.shared_at).toLocaleString()}</p>
            {/* Download button only for files shared with me */}
            {type === 'sharedWithMe' && share.file?.id && (
              <Button size="sm" onClick={() => handleDownload(share.file)}>
                <Download className="w-4 h-4 mr-1" /> Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">File Sharing</h1>
        <p className="text-muted-foreground">Manage and share your verified files</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'my-files' | 'my-shares' | 'shared-with-me')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-files">My Files</TabsTrigger>
          <TabsTrigger value="my-shares">My Shares</TabsTrigger>
          <TabsTrigger value="shared-with-me">Shared With Me</TabsTrigger>
        </TabsList>

        {/* My Files */}
        <TabsContent value="my-files" className="space-y-4">
          {myFiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No verified files available to share</p>
          ) : myFiles.map(file => (
            <Card key={file.id}>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileIcon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size} bytes</p>
                  </div>
                </div>
                <Button onClick={() => openShareDialog(file.id, file.name)} size="sm">
                  <Share2 className="w-4 h-4 mr-1" /> Share
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* My Shares */}
        <TabsContent value="my-shares" className="space-y-4">
          {myShares.length === 0 ? (
            <p className="text-sm text-muted-foreground">You have not shared any files yet</p>
          ) : myShares.map(share => renderSharedFileCard(share, 'myShares'))}
        </TabsContent>

        {/* Shared With Me */}
        <TabsContent value="shared-with-me" className="space-y-4">
          {sharedWithMe.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files have been shared with you</p>
          ) : sharedWithMe.map(share => renderSharedFileCard(share, 'sharedWithMe'))}
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={shareDialog.open} onOpenChange={(open) => setShareDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share File</DialogTitle>
            <DialogDescription>Share "{shareDialog.name}" with another user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="user@example.com"
                value={shareDialog.recipientEmail}
                onChange={(e) => setShareDialog(prev => ({ ...prev, recipientEmail: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialog(prev => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button onClick={handleShareFile} disabled={shareDialog.isSharing}>
              {shareDialog.isSharing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sharing...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
