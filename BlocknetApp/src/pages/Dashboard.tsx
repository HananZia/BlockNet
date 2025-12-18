import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileUp, 
  Shield, 
  Share2, 
  FolderOpen, 
  CheckCircle2, 
  Clock,
  TrendingUp
} from 'lucide-react';
import { api } from '@/services/api';

interface File {
  id: number;
  name: string;
  created_at: string;
}

interface SharedFile {
  id: number;
  file: File;
  receiver: { email: string };
  created_at: string;
}

interface VerifiedFile {
  id: number;
  name: string;
  verified_at: string;
}

interface Activity {
  id: number;
  type: 'upload' | 'verify' | 'share';
  description: string;
  time: string;
}

interface Stats {
  totalFiles: number;
  sharedFiles: number;
  verifications: number;
  pendingVerifications: number;
}

interface DashboardResponse {
  stats: Stats;
  recentActivity: Activity[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [stats, setStats] = useState<Stats>({
    totalFiles: 0,
    sharedFiles: 0,
    verifications: 0,
    pendingVerifications: 0,
  });

  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get<DashboardResponse>('/dashboard');
      setStats(response.stats);
      setRecentActivity(response.recentActivity);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Optional: refresh every 15 seconds for near real-time updates
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.username} {isAdmin ? '(Admin)' : ''}
        </h1>
        <p className="opacity-90">Manage your files and verify documents securely on the blockchain.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalFiles}</p>
              <p className="text-xs text-muted-foreground">Total Files</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Share2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.sharedFiles}</p>
              <p className="text-xs text-muted-foreground">Shared</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.verifications}</p>
              <p className="text-xs text-muted-foreground">Verifications</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Button onClick={() => navigate('/files?action=upload')} className="h-auto py-4 flex-col space-y-2">
            <FileUp className="w-6 h-6" />
            <span>Upload File</span>
          </Button>
          <Button onClick={() => navigate('/files?action=verify')} variant="secondary" className="h-auto py-4 flex-col space-y-2">
            <Shield className="w-6 h-6" />
            <span>Verify File</span>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <CardDescription>Your latest file operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 && <p className="text-sm text-muted-foreground">No recent activity</p>}
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${
                  activity.type === 'upload' ? 'bg-primary/10' :
                  activity.type === 'verify' ? 'bg-success/10' : 'bg-accent/10'
                }`}>
                  {activity.type === 'upload' ? <FileUp className="w-3 h-3 text-primary" /> :
                   activity.type === 'verify' ? <Shield className="w-3 h-3 text-success" /> :
                   <Share2 className="w-3 h-3 text-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(activity.time).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
