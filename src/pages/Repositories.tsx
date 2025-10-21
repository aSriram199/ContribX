import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, LogOut, Trophy, ExternalLink, Clock, CheckCircle } from 'lucide-react';

const Repositories = () => {
  const { currentTeam, repositories, issues, logoutTeam } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutTeam();
    navigate('/');
  };

  if (!currentTeam) {
    navigate('/');
    return null;
  }

  // Get team's issues counts
  const getTeamIssuesForRepo = (repoName: string) => {
    const repoIssues = issues.filter(issue => issue.repo === repoName && issue.assignedTo === currentTeam.name);
    const inProgress = repoIssues.filter(i => i.status === 'occupied').length;
    const closed = repoIssues.filter(i => i.status === 'closed').length;
    return { inProgress, closed };
  };

  // Get total team stats
  const totalInProgress = issues.filter(i => i.status === 'occupied' && i.assignedTo === currentTeam.name).length;
  const totalClosed = issues.filter(i => i.status === 'closed' && i.assignedTo === currentTeam.name).length;

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
        {/* Team Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Team Points</CardDescription>
              <CardTitle className="text-3xl text-primary">{currentTeam.points}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                In Progress
              </CardDescription>
              <CardTitle className="text-3xl">{totalInProgress}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-success">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Completed
              </CardDescription>
              <CardTitle className="text-3xl text-success">{totalClosed}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mb-4">Repositories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map((repo) => {
            const { inProgress, closed } = getTeamIssuesForRepo(repo.name);
            
            return (
              <Card key={repo.name} className="shadow-card hover:shadow-elevated transition-shadow duration-300">
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
                  
                  {/* Team's issue stats for this repo */}
                  {(inProgress > 0 || closed > 0) && (
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      {inProgress > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {inProgress} In Progress
                        </Badge>
                      )}
                      {closed > 0 && (
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {closed} Closed
                        </Badge>
                      )}
                    </div>
                  )}
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
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Repositories;
