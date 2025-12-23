import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';
import { api } from '@/services/api';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const email = location.state?.email;

  const verifyOtp = async () => {
    try {
      await api.post('/auth/verify-otp', { email, otp });
      navigate('/reset-password', { state: { email, otp } });
    } catch (err: any) {
      toast({ title: 'Invalid OTP', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="mx-auto h-10 w-10 text-primary" />
          <CardTitle>Verify OTP</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button className="w-full" onClick={verifyOtp}>
            Verify
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
