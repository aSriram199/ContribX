export interface Team {
  name: string;
  points: number;
  active: boolean;
}

export interface Issue {
  id: string;
  title: string;
  tags: string[];
  status: "open" | "occupied" | "closed";
  assignedTo: string | null;
  repo: string;
  occupiedAt?: number;
  closedAt?: number;
}

export interface Repository {
  name: string;
  url: string;
}
