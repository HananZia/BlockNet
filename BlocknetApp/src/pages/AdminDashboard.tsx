import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  File,
  Blocks,
  Search,
  Shield,
  Activity,
  HardDrive,
  TrendingUp,
  UserCheck,
  Mail,
  Calendar
} from 'lucide-react';
import { api } from '@/services/api';

// ----------------------
// Types
// ----------------------
interface StatsResponse {
  total_users: number;
  active_users: number;
  total_files: number;
}

interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  files?: any[]; // optional if backend returns user files
  filesCount?: number;
}

interface FileResponse {
  id: number;
  name: string;
  owner: string;
  size?: string;
  uploadedAt: string;
  verified?: boolean;
}

// ----------------------
// Component
// ----------------------
export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const [stats, setStats] = useState<StatsResponse>({
    total_users: 0,
    active_users: 0,
    total_files: 0,
  });

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [files, setFiles] = useState<FileResponse[]>([]);

  // ----------------------
  // Load data
  // ----------------------
  const loadStats = async () => {
    try {
      const data = await api.get<StatsResponse>('/admin/stats');
      setStats(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load stats', variant: 'destructive' });
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.get<UserResponse[]>('/admin/users');
      const usersWithCount = data.map((u) => ({
        ...u,
        filesCount: u.files?.length ?? 0,
      }));
      setUsers(usersWithCount);
    } catch {
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    }
  };

  const loadFiles = async () => {
    try {
      const data = await api.get<FileResponse[]>('/admin/files');
      setFiles(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load files', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadUsers();
      loadFiles();
    }
  }, [isAdmin]);

  // ----------------------
  // User actions
  // ----------------------
  const handleToggleUser = async (userId: number, currentStatus: boolean) => {
    try {
      await api.toggleUserStatus(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_active: !currentStatus } : u
        )
      );
      toast({
        title: currentStatus ? 'User deactivated' : 'User activated',
        description: 'User status has been updated',
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This will remove all their files.')) return;
    try {
      await api.deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      toast({ title: 'User deleted', description: 'The user has been removed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    }
  };

  // ----------------------
  // File actions
  // ----------------------
  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await api.deleteFile(fileId);
      setFiles(files.filter((f) => f.id !== fileId));
      toast({ title: 'File deleted', description: 'The file has been removed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete file', variant: 'destructive' });
    }
  };

  // ----------------------
  // Filtering
  // ----------------------
  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ----------------------
  // Render
  // ----------------------
  return (
    <div className="space-y-6 animate-fade-in p-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Shield className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.username} {isAdmin ? '(Admin)' : ''}
          </h1>
          <p className="text-muted-foreground">System management and analytics</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="files">All Files</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_users.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <UserCheck className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active_users.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <File className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_files.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Files</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <Card key={u.id} className="border-border/50">
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    u.role === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {u.username.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium truncate">{u.username}</p>
                      {u.role === 'admin' && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{u.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={u.is_active}
                      onCheckedChange={() => handleToggleUser(u.id, u.is_active)}
                    />
                    {u.role !== 'admin' && (
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u.id)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {filteredFiles.map((f) => (
              <Card key={f.id} className="border-border/50">
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <File className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{f.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>Owner: {f.owner}</span>
                      <span>•</span>
                      <span>{f.size ?? '-'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant={f.verified ? 'default' : 'secondary'} className="text-xs">
                      {f.verified ? 'Verified' : 'Pending'}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{f.uploadedAt}</p>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteFile(f.id)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
