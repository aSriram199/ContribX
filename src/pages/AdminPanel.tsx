import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Shield, ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isAdmin, loginAdmin, logoutAdmin, issues, teams, addIssue, moveIssue, assignIssue, awardPoints, repositories } = useApp();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newIssueTags, setNewIssueTags] = useState<string[]>([]);
  const [newIssueRepo, setNewIssueRepo] = useState('');
  
  const [pointsTeam, setPointsTeam] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(username, password)) {
      toast.success('Admin login successful!');
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleAddIssue = () => {
    if (!newIssueTitle || !newIssueRepo || newIssueTags.length === 0) {
      toast.error('Please fill all fields');
      return;
    }
    addIssue({ title: newIssueTitle, tags: newIssueTags, repo: newIssueRepo });
    toast.success('Issue added successfully!');
    setNewIssueTitle('');
    setNewIssueTags([]);
    setNewIssueRepo('');
  };

  const handleAwardPoints = () => {
    if (!pointsTeam || !pointsAmount) {
      toast.error('Please select team and enter points');
      return;
    }
    awardPoints(pointsTeam, parseInt(pointsAmount));
    toast.success(`Awarded ${pointsAmount} points to ${pointsTeam}!`);
    setPointsTeam('');
    setPointsAmount('');
  };

  const toggleTag = (tag: string) => {
    setNewIssueTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-destructive-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold">Admin Panel</CardTitle>
            <CardDescription>Enter admin credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12" size="lg">
                Login
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => navigate('/')}
                className="text-sm text-muted-foreground"
              >
                Back to Team Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-destructive" />
              Admin Panel
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/rankings')}>
              View Rankings
            </Button>
            <Button variant="outline" onClick={() => { logoutAdmin(); navigate('/'); }}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Issue</CardTitle>
            <CardDescription>Create a new issue for teams to work on</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Issue Title</Label>
              <Input
                value={newIssueTitle}
                onChange={(e) => setNewIssueTitle(e.target.value)}
                placeholder="Enter issue title"
              />
            </div>
            <div>
              <Label>Repository</Label>
              <Select value={newIssueRepo} onValueChange={setNewIssueRepo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select repository" />
                </SelectTrigger>
                <SelectContent>
                  {repositories.map(repo => (
                    <SelectItem key={repo.name} value={repo.name}>
                      {repo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                {['easy', 'medium', 'hard'].map(tag => (
                  <Badge
                    key={tag}
                    variant={newIssueTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Button onClick={handleAddIssue} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Issue
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Award Points</CardTitle>
            <CardDescription>Give points to teams for their work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Team</Label>
              <Select value={pointsTeam} onValueChange={setPointsTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.name} value={team.name}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Points</Label>
              <Input
                type="number"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                placeholder="Enter points"
              />
            </div>
            <Button onClick={handleAwardPoints} className="w-full">
              Award Points
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Issues</CardTitle>
            <CardDescription>Move and assign issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {issues.map(issue => (
                <div key={issue.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">#{issue.id} {issue.title}</p>
                    <p className="text-sm text-muted-foreground">{issue.repo}</p>
                  </div>
                  <Select
                    value={issue.status}
                    onValueChange={(value) => moveIssue(issue.id, value as any)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={issue.assignedTo || 'none'}
                    onValueChange={(value) => assignIssue(issue.id, value === 'none' ? null : value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {teams.map(team => (
                        <SelectItem key={team.name} value={team.name}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPanel;
