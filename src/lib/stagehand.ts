import { chromium } from 'playwright';

type SessionAction = {
  type: 'goto' | 'act' | 'extract' | 'observe';
  value: string;
}

type CreateSessionRequest = {
  actions: SessionAction[];
  options?: {
    browser?: 'chromium' | 'firefox' | 'webkit';
    device?: string;
    location?: string;
    context?: {
      extensions?: boolean;
      captchaSolving?: boolean;
    };
  };
}

export class StagehandClient {
  private apiKey: string;

  constructor(config: { apiKey: string }) {
    if (!config.apiKey) {
      throw new Error('Missing required Stagehand configuration');
    }
    this.apiKey = config.apiKey;
  }

  async createSession(request: CreateSessionRequest) {
    try {
      const browser = await chromium.connect({
        wsEndpoint: `wss://connect.browserbase.com?apiKey=${this.apiKey}`
      });
      
      const context = browser.contexts[0];
      const page = context.pages[0];

      for (const action of request.actions) {
        if (action.type === 'goto') {
          await page.goto(action.value);
          await page.waitForLoadState('networkidle');
        } else if (action.type === 'act') {
          await page.act({ action: action.value });
          await page.waitForLoadState('networkidle');
        } else if (action.type === 'extract') {
          await page.extract({
            instruction: action.value,
            schema: action.schema
          });
        }
      }

      const sessionId = context.browser().connectOptions().wsEndpoint?.split('sessions/')?.[1];
      await browser.close();

      if (!sessionId) {
        throw new Error('Failed to get BrowserBase session ID');
      }

      return { 
        sessionId,
        success: true 
      };
    } catch (error) {
      console.error('Stagehand createSession error:', error);
      throw error;
    }
  }
}

// Initialize with only required fields
export const stagehand = new StagehandClient({
  projectId: process.env.BROWSERBASE_PROJECT_ID!,
  apiKey: process.env.BROWSERBASE_API_KEY!,
  llmProvider: 'anthropic',  // This won't be used in requests
  llmApiKey: process.env.ANTHROPIC_API_KEY!  // This won't be used in requests
});

export function parsePrompt(prompt: string): StagehandAction[] {
  const actions: StagehandAction[] = []
  const lines = prompt.split('\n')

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase()
    
    if (trimmed.startsWith('goto ')) {
      actions.push({
        type: 'goto',
        value: line.slice(5).trim()
      })
    } else if (trimmed.startsWith('act ')) {
      actions.push({
        type: 'act',
        value: line.slice(4).trim()
      })
    } else if (trimmed.startsWith('extract ')) {
      actions.push({
        type: 'extract',
        value: line.slice(8).trim()
      })
    }
  }

  return actions
}

async function createBrowserSession() {
  const browser = await chromium.connect({
    wsEndpoint: `wss://connect.browserbase.com?apiKey=${process.env.BROWSERBASE_API_KEY}`
  });
  const context = browser.contexts[0];
  const page = context.pages[0];
  return { browser, context, page };
}

export { createBrowserSession };