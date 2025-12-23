import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, Shield } from 'lucide-react';
import { api } from '@/services/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        await api.post('/auth/forgot-password', { email });
        toast({
        title: 'OTP Sent',
        description: 'If the email exists, a 6-digit code has been sent.',
        });
        navigate('/verify-otp', { state: { email } });
    } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <Shield className="mx-auto h-10 w-10 text-primary" />
            <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your registered email</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
