import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, LogOut, Trophy, ExternalLink } from 'lucide-react';

const Repositories = () => {
  const { currentTeam, repositories, logoutTeam } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutTeam();
    navigate('/');
  };

  if (!currentTeam) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Repositories</h1>
            <p className="text-sm text-muted-foreground">Welcome, {currentTeam.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/rankings')}>
              <Trophy className="w-4 h-4 mr-2" />
              Rankings
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map((repo) => (
            <Card key={repo.name} className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  {repo.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline flex items-center gap-1"
                  >
                    View on GitHub
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => navigate(`/issues/${repo.name}`)}
                >
                  View Issues
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Repositories;
