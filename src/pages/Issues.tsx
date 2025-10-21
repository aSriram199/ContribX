import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Lock, Clock, GitPullRequest } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Issues = () => {
  const { repo } = useParams<{ repo: string }>();
  const navigate = useNavigate();
  const { issues, currentTeam, occupyIssue, closeIssue } = useApp();
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const repoIssues = useMemo(() => issues.filter(issue => issue.repo === repo), [issues, repo]);
  const openIssues = useMemo(() => repoIssues.filter(i => i.status === 'open'), [repoIssues]);
  const occupiedIssues = useMemo(() => repoIssues.filter(i => i.status === 'occupied'), [repoIssues]);
  const closedIssues = useMemo(() => repoIssues.filter(i => i.status === 'closed'), [repoIssues]);

  const handleOccupy = useCallback((issueId: string) => {
    const result = occupyIssue(issueId);
    if (result.success) {
      toast.success('Issue occupied successfully!');
    } else {
      toast.error(result.error || 'Failed to occupy issue');
    }
  }, [occupyIssue]);

  const handleClose = useCallback((issueId: string) => {
    closeIssue(issueId);
    setShowCloseDialog(false);
    setSelectedIssue(null);
    toast.success('Issue marked as closed! Great work! 🎉', {
      description: 'Your progress has been recorded and will be reviewed by the admin.'
    });
  }, [closeIssue]);

  const confirmClose = useCallback((issueId: string) => {
    setSelectedIssue(issueId);
    setShowCloseDialog(true);
  }, []);

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'easy': return 'bg-success text-white';
      case 'medium': return 'bg-warning text-white';
      case 'hard': return 'bg-destructive text-white';
      default: return 'bg-muted';
    }
  };

  const getTimeRemaining = (issue: any) => {
    if (!issue.occupiedAt) return null;
    
    const duration = issue.tags.includes('easy') ? 20 * 60 * 1000 :
                    issue.tags.includes('medium') ? 40 * 60 * 1000 :
                    60 * 60 * 1000;
    
    const elapsed = Date.now() - issue.occupiedAt;
    const remaining = Math.max(0, duration - elapsed);
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Memoized timer component to prevent unnecessary re-renders
  const Timer = memo(({ issue }: { issue: any }) => {
    const [time, setTime] = useState(getTimeRemaining(issue));

    useEffect(() => {
      const interval = setInterval(() => {
        setTime(getTimeRemaining(issue));
      }, 1000);
      return () => clearInterval(interval);
    }, [issue.occupiedAt, issue.tags]);

    if (!time) return null;

    // Calculate remaining time percentage
    const duration = issue.tags.includes('easy') ? 20 * 60 * 1000 :
                    issue.tags.includes('medium') ? 40 * 60 * 1000 :
                    60 * 60 * 1000;
    const elapsed = Date.now() - issue.occupiedAt;
    const remaining = Math.max(0, duration - elapsed);
    const percentRemaining = (remaining / duration) * 100;

    // Color based on time remaining
    const getTimerColor = () => {
      if (percentRemaining > 50) return 'text-primary';
      if (percentRemaining > 25) return 'text-warning';
      return 'text-destructive';
    };

    return (
      <div className={`flex items-center gap-2 mt-2 text-sm font-medium ${getTimerColor()}`}>
        <Clock className="w-4 h-4" />
        {time}
        {percentRemaining <= 25 && (
          <span className="text-xs">⚠️ Hurry!</span>
        )}
      </div>
    );
  });

  Timer.displayName = 'Timer';

  const IssueCard = memo(
    ({ issue, actions }: { issue: any; actions: React.ReactNode }) => {
      return (
        <Card className="shadow-card hover:shadow-elevated transition-shadow duration-300 card-hover-optimized">
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
            {issue.status === 'occupied' && issue.occupiedAt && (
              <Timer issue={issue} />
            )}
          </CardHeader>
          <CardContent>
            {actions}
          </CardContent>
        </Card>
      );
    },
    (prevProps, nextProps) => {
      // Only re-render if issue data actually changes
      return (
        prevProps.issue.id === nextProps.issue.id &&
        prevProps.issue.status === nextProps.issue.status &&
        prevProps.issue.assignedTo === nextProps.issue.assignedTo &&
        prevProps.issue.occupiedAt === nextProps.issue.occupiedAt
      );
    }
  );

  IssueCard.displayName = 'IssueCard';

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
                        variant="default"
                        onClick={() => confirmClose(issue.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Solved
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

      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <GitPullRequest className="w-5 h-5" />
              Submit Your Solution
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2">
                <p className="font-semibold">Before marking this issue as solved, please ensure you have:</p>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                  <li>Committed all your changes to your branch</li>
                  <li>Pushed your branch to the repository</li>
                  <li>Created a Pull Request (PR) with a clear description</li>
                  <li>Linked the PR to this issue</li>
                </ol>
                <p className="text-sm text-muted-foreground mt-4">
                  ⚠️ The admin will review your PR and verify the solution. Make sure your code is tested and follows the project guidelines.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedIssue && handleClose(selectedIssue)}>
              Yes, I've Created the PR
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Issues;
