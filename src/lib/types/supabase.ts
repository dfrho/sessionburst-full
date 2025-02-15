export type SessionResult = {
  success: boolean;
  timestamp: string;
  action: {
    type: 'goto' | 'act' | 'extract' | 'observe';
    value: string;
  };
  data?: {
    url?: string;
    text?: string;
    elements?: string[];
    screenshot?: string;
    error?: string;
  };
};

export type Session = {
  id: string;
  created_at: string;
  user_id: string;
  stagehand_session_id: string;
  actions: {
    type: 'goto' | 'act' | 'extract' | 'observe';
    value: string;
  }[];
  options: {
    browser?: string;
    device?: string;
    utm_params?: {
      utm_source: string;
      utm_medium: string;
      utm_campaign: string;
      utm_term?: string;
    };
  };
  status: 'created' | 'running' | 'completed' | 'failed';
  results?: SessionResult[];
  error?: string;
}; 