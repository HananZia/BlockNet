import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Blocks,
  Hash,
  Clock,
  File,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  tx_hash: string;
  block_number: number;
  timestamp: string;
  file_name: string;
  file_hash: string;
  owner_name: string;
  status: 'confirmed' | 'pending' | 'failed';
}


export default function BlockchainExplorer() {
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------
   Fetch transactions (polling every 10s)
  --------------------------------------------- */
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Transaction[]>('/blockchain/transactions');
      setTransactions(res);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to load blockchain transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTransactions();

    // Real-time-ish updates via polling
    const interval = setInterval(fetchTransactions, 10000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  /* ---------------------------------------------
   Helpers
  --------------------------------------------- */
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied to clipboard` });
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return '';
    }
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.tx_hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.file_hash.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ---------------------------------------------
   UI
  --------------------------------------------- */
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Blockchain Explorer</h1>
        <p className="text-muted-foreground">Live blockchain file registrations</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by tx hash, file hash, or file name..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading transactions…</span>
        </div>
      )}

      {/* Transaction Details */}
      {selectedTx && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Transaction Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTx(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Transaction Hash</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(selectedTx.tx_hash, 'Transaction hash')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <code className="text-xs bg-muted p-2 rounded block break-all">
                {selectedTx.tx_hash}
              </code>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Block</p>
                <p className="font-medium">{selectedTx.block_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge className={getStatusColor(selectedTx.status)}>
                  {selectedTx.status === 'confirmed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {selectedTx.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                  {selectedTx.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                  {selectedTx.status}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Timestamp</p>
                <p>{new Date(selectedTx.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Owner</p>
                <p>{selectedTx.owner_name}</p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-xs">File</p>
              <div className="flex items-center space-x-2">
                <File className="w-4 h-4 text-primary" />
                <span className="font-medium">{selectedTx.file_name}</span>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-xs">File Hash</p>
              <code className="text-xs bg-muted p-2 rounded block break-all">
                {selectedTx.file_hash}
              </code>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Blocks className="w-5 h-5" />
            <span>Recent Transactions</span>
          </CardTitle>
          <CardDescription>Live blockchain activity</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {filteredTransactions.length === 0 && !loading ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No transactions found
            </p>
          ) : (
            filteredTransactions.map(tx => (
              <div
                key={tx.tx_hash}
                className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedTx(tx)}
              >
                <div className="flex items-center justify-between mb-1">
                  <code className="text-xs">
                    {tx.tx_hash.slice(0, 14)}…{tx.tx_hash.slice(-6)}
                  </code>
                  <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-3">
                    <span>Block {tx.block_number}</span>
                    <span>{tx.file_name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
