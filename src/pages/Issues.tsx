import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';

const Issues = () => {
  const { repo } = useParams<{ repo: string }>();
  const navigate = useNavigate();
  const { issues, currentTeam, occupyIssue, closeIssue } = useApp();

  const repoIssues = issues.filter(issue => issue.repo === repo);
  const openIssues = repoIssues.filter(i => i.status === 'open');
  const occupiedIssues = repoIssues.filter(i => i.status === 'occupied');
  const closedIssues = repoIssues.filter(i => i.status === 'closed');

  const handleOccupy = (issueId: string) => {
    occupyIssue(issueId);
    toast.success('Issue occupied successfully!');
  };

  const handleClose = (issueId: string) => {
    closeIssue(issueId);
    toast.success('Issue closed successfully!');
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'easy': return 'bg-success text-white';
      case 'medium': return 'bg-warning text-white';
      case 'hard': return 'bg-destructive text-white';
      default: return 'bg-muted';
    }
  };

  const IssueCard = ({ issue, actions }: { issue: any; actions: React.ReactNode }) => (
    <Card className="shadow-card hover:shadow-elevated transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">#{issue.id} {issue.title}</CardTitle>
        </div>
        <div className="flex gap-2 mt-2">
          {issue.tags.map((tag: string) => (
            <Badge key={tag} className={getTagColor(tag)}>
              {tag}
            </Badge>
          ))}
        </div>
        {issue.assignedTo && (
          <p className="text-sm text-muted-foreground mt-2">
            Assigned to: {issue.assignedTo}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {actions}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/repositories')} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Repositories
          </Button>
          <h1 className="text-2xl font-bold">{repo} - Issues</h1>
          <p className="text-sm text-muted-foreground">Team: {currentTeam?.name}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Open Issues
              <Badge variant="secondary">{openIssues.length}</Badge>
            </h2>
            <div className="space-y-4">
              {openIssues.map(issue => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  actions={
                    <Button
                      className="w-full"
                      onClick={() => handleOccupy(issue.id)}
                    >
                      Occupy Issue
                    </Button>
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Occupied Issues
              <Badge variant="secondary">{occupiedIssues.length}</Badge>
            </h2>
            <div className="space-y-4">
              {occupiedIssues.map(issue => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  actions={
                    issue.assignedTo === currentTeam?.name ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleClose(issue.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Close Issue
                      </Button>
                    ) : (
                      <Button className="w-full" variant="ghost" disabled>
                        <Lock className="w-4 h-4 mr-2" />
                        Occupied by {issue.assignedTo}
                      </Button>
                    )
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Closed Issues
              <Badge variant="secondary">{closedIssues.length}</Badge>
            </h2>
            <div className="space-y-4">
              {closedIssues.map(issue => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  actions={
                    <div className="flex items-center justify-center text-success">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Issues;
