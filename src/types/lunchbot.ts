export interface Team {
  id: string;
  domain: string;
}

export interface User {
  id: string;
  team_id: string;
  preferred_location?: string;
}
