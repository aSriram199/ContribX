import React, { createContext, useContext, useState, useEffect } from 'react';
import { Team, Issue, Repository } from '@/types';

interface AppContextType {
  currentTeam: Team | null;
  teams: Team[];
  issues: Issue[];
  repositories: Repository[];
  loginTeam: (teamName: string) => { success: boolean; error?: string };
  logoutTeam: () => void;
  occupyIssue: (issueId: string) => void;
  closeIssue: (issueId: string) => void;
  isAdmin: boolean;
  loginAdmin: (username: string, password: string) => boolean;
  logoutAdmin: () => void;
  addIssue: (issue: Omit<Issue, 'id' | 'status' | 'assignedTo'>) => void;
  moveIssue: (issueId: string, status: Issue['status']) => void;
  assignIssue: (issueId: string, teamName: string | null) => void;
  awardPoints: (teamName: string, points: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ALLOWED_TEAMS = ["TeamAlpha", "TeamBravo", "TeamCharlie", "TeamDelta"];

const INITIAL_REPOSITORIES: Repository[] = [
  { name: "awesome-repo", url: "https://github.com/example/awesome-repo" },
  { name: "ui-kit", url: "https://github.com/example/ui-kit" },
  { name: "lib-helpers", url: "https://github.com/example/lib-helpers" },
];

const INITIAL_ISSUES: Issue[] = [
  { id: "1", title: "Fix navigation bug", tags: ["easy"], status: "open", assignedTo: null, repo: "awesome-repo" },
  { id: "2", title: "Implement dark mode", tags: ["medium"], status: "open", assignedTo: null, repo: "ui-kit" },
  { id: "3", title: "Optimize performance", tags: ["hard"], status: "open", assignedTo: null, repo: "lib-helpers" },
  { id: "4", title: "Add unit tests", tags: ["medium"], status: "open", assignedTo: null, repo: "awesome-repo" },
  { id: "5", title: "Update documentation", tags: ["easy"], status: "open", assignedTo: null, repo: "ui-kit" },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>(() => {
    const stored = localStorage.getItem('teams');
    if (stored) {
      return JSON.parse(stored);
    }
    return ALLOWED_TEAMS.map(name => ({ name, points: 0, active: false }));
  });
  const [issues, setIssues] = useState<Issue[]>(() => {
    const stored = localStorage.getItem('issues');
    return stored ? JSON.parse(stored) : INITIAL_ISSUES;
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const repositories = INITIAL_REPOSITORIES;

  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('issues', JSON.stringify(issues));
  }, [issues]);

  const loginTeam = (teamName: string) => {
    if (!ALLOWED_TEAMS.includes(teamName)) {
      return { success: false, error: "Team not recognized. Contact admin." };
    }

    const team = teams.find(t => t.name === teamName);
    if (team?.active) {
      return { success: false, error: "This team is already active. Only one active session allowed." };
    }

    setTeams(prev => prev.map(t => 
      t.name === teamName ? { ...t, active: true } : t
    ));
    setCurrentTeam(teams.find(t => t.name === teamName)!);
    return { success: true };
  };

  const logoutTeam = () => {
    if (currentTeam) {
      setTeams(prev => prev.map(t => 
        t.name === currentTeam.name ? { ...t, active: false } : t
      ));
      setCurrentTeam(null);
    }
  };

  const occupyIssue = (issueId: string) => {
    if (!currentTeam) return;
    
    setIssues(prev => prev.map(issue =>
      issue.id === issueId && issue.status === 'open'
        ? { ...issue, status: 'occupied', assignedTo: currentTeam.name }
        : issue
    ));
  };

  const closeIssue = (issueId: string) => {
    if (!currentTeam) return;
    
    setIssues(prev => prev.map(issue =>
      issue.id === issueId && issue.status === 'occupied' && issue.assignedTo === currentTeam.name
        ? { ...issue, status: 'closed' }
        : issue
    ));
  };

  const loginAdmin = (username: string, password: string) => {
    if (username === 'dvadmin' && password === '2025') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  const addIssue = (newIssue: Omit<Issue, 'id' | 'status' | 'assignedTo'>) => {
    const id = (Math.max(...issues.map(i => parseInt(i.id)), 0) + 1).toString();
    setIssues(prev => [...prev, { ...newIssue, id, status: 'open', assignedTo: null }]);
  };

  const moveIssue = (issueId: string, status: Issue['status']) => {
    setIssues(prev => prev.map(issue =>
      issue.id === issueId ? { ...issue, status } : issue
    ));
  };

  const assignIssue = (issueId: string, teamName: string | null) => {
    setIssues(prev => prev.map(issue =>
      issue.id === issueId ? { ...issue, assignedTo: teamName } : issue
    ));
  };

  const awardPoints = (teamName: string, points: number) => {
    setTeams(prev => prev.map(team =>
      team.name === teamName ? { ...team, points: team.points + points } : team
    ));
  };

  return (
    <AppContext.Provider value={{
      currentTeam,
      teams,
      issues,
      repositories,
      loginTeam,
      logoutTeam,
      occupyIssue,
      closeIssue,
      isAdmin,
      loginAdmin,
      logoutAdmin,
      addIssue,
      moveIssue,
      assignIssue,
      awardPoints,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
