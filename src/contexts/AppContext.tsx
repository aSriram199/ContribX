import React, { createContext, useContext, useState, useEffect } from 'react';
import { Team, Issue, Repository } from '@/types';

interface AppContextType {
  currentTeam: Team | null;
  teams: Team[];
  issues: Issue[];
  repositories: Repository[];
  loginTeam: (teamName: string, password: string) => { success: boolean; error?: string };
  logoutTeam: () => void;
  occupyIssue: (issueId: string) => { success: boolean; error?: string };
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

const ALLOWED_TEAMS = ["123", "TeamBravo", "TeamCharlie", "TeamDelta"];

// Team passwords - each team has their own password
const TEAM_PASSWORDS: { [key: string]: string } = {
  "123": "123",
  "TeamBravo": "bravo123",
  "TeamCharlie": "charlie123",
  "TeamDelta": "delta123",
};

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
      // Clear all active states on page load (handle page refresh)
      const parsedTeams = JSON.parse(stored);
      return parsedTeams.map((team: Team) => ({ ...team, active: false }));
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

  const loginTeam = (teamName: string, password: string) => {
    if (!ALLOWED_TEAMS.includes(teamName)) {
      return { success: false, error: "Team not recognized. Contact admin." };
    }

    // Check password
    if (TEAM_PASSWORDS[teamName] !== password) {
      return { success: false, error: "Invalid password. Please check your team password." };
    }

    const team = teams.find(t => t.name === teamName);
    if (team?.active) {
      return { success: false, error: "This team is already active. Only one active session allowed." };
    }

    const updatedTeam = { ...team!, active: true };
    setTeams(prev => prev.map(t => 
      t.name === teamName ? { ...t, active: true } : t
    ));
    setCurrentTeam(updatedTeam);
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
    if (!currentTeam) {
      return { success: false, error: "No team logged in" };
    }
    
    // Check how many issues the team currently has occupied
    const occupiedCount = issues.filter(
      issue => issue.status === 'occupied' && issue.assignedTo === currentTeam.name
    ).length;
    
    // Prevent occupying more than 3 issues
    if (occupiedCount >= 3) {
      return { success: false, error: "Your team has already occupied 3 issues. Please close an issue before occupying a new one." };
    }
    
    setIssues(prev => prev.map(issue =>
      issue.id === issueId && issue.status === 'open'
        ? { ...issue, status: 'occupied', assignedTo: currentTeam.name, occupiedAt: Date.now() }
        : issue
    ));
    
    return { success: true };
  };

  const checkExpiredIssues = () => {
    const now = Date.now();
    setIssues(prev => {
      const updated = prev.map(issue => {
        if (issue.status === 'occupied' && issue.occupiedAt) {
          const duration = issue.tags.includes('easy') ? 20 * 60 * 1000 :
                          issue.tags.includes('medium') ? 40 * 60 * 1000 :
                          60 * 60 * 1000;
          
          if (now - issue.occupiedAt > duration) {
            // Issue expired - deduct points from the team
            const teamName = issue.assignedTo;
            if (teamName) {
              // Deduct points based on difficulty
              const penalty = issue.tags.includes('easy') ? 5 :
                            issue.tags.includes('medium') ? 10 :
                            15;
              
              setTeams(prevTeams => prevTeams.map(team =>
                team.name === teamName 
                  ? { ...team, points: Math.max(0, team.points - penalty) }
                  : team
              ));
            }
            
            return { 
              ...issue, 
              status: 'open' as const, 
              assignedTo: null, 
              occupiedAt: undefined 
            };
          }
        }
        return issue;
      });
      return updated;
    });
  };

  const closeIssue = (issueId: string) => {
    if (!currentTeam) return;
    
    setIssues(prev => prev.map(issue =>
      issue.id === issueId && issue.status === 'occupied' && issue.assignedTo === currentTeam.name
        ? { ...issue, status: 'closed', closedAt: Date.now() }
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

  useEffect(() => {
    const interval = setInterval(checkExpiredIssues, 1000);
    return () => clearInterval(interval);
  }, []);

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
