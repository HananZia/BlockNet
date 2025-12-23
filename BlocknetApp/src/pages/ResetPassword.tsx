import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';
import { api } from '@/services/api';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { email, otp } = location.state || {};

  const resetPassword = async () => {
    try {
      await api.post('/auth/reset-password', { email, otp, password });
      toast({ title: 'Success', description: 'Password updated successfully' });
      navigate('/login');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="mx-auto h-10 w-10 text-primary" />
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full" onClick={resetPassword}>
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
