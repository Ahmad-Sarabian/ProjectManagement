
export enum TaskStatus {
  NONE = 'NONE',
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED'
}

export enum TeamName {
  PRODUCT = 'محصول',
  DESIGN = 'دیزاین',
  BACKEND1 = 'بک‌اند ۱',
  BACKEND2 = 'بک‌اند ۲',
  FRONTEND = 'فرانت‌اند',
  QA = 'تست',
  RELEASE = 'انتشار'
}

export interface FeatureProgress {
  team: TeamName;
  status: TaskStatus;
  assignee?: string;
  lastUpdate?: string;
}

export interface Feature {
  id: string;
  name: string;
  projectName: string;
  priority: string;
  teamStatuses: Record<TeamName, TaskStatus>;
  blockageReasons?: Partial<Record<TeamName, string>>;
  completionDates?: Partial<Record<TeamName, string>>;
  estimatedDates?: Partial<Record<TeamName, string>>;
  description: string;
}

export interface ProjectAnalysis {
  summary: string;
  bottlenecks: string[];
  recommendations: string[];
}
