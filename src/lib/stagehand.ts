import { Stagehand } from "@browserbasehq/stagehand";
import { Browserbase } from "@browserbasehq/sdk";
import { z } from "zod";

type SessionAction = {
  type: 'goto' | 'act' | 'extract' | 'observe';
  value: string;
  schema?: z.ZodType<unknown>;
}

type CreateSessionRequest = {
  actions: SessionAction[];
  options?: {
    browser?: 'chromium' | 'firefox' | 'webkit';
    device?: string;
    location?: string;
    utm_params?: Record<string, string>;
    context?: {
      extensions?: boolean;
      captchaSolving?: boolean;
    };
  };
}

export class StagehandClient {
  private apiKey: string;
  private projectId: string;
  private modelName: string;
  private anthropicKey: string;
  private browserbase: Browserbase;

  constructor(config: { 
    apiKey: string;
    projectId?: string;
    modelName?: string;
    anthropicKey?: string;
  }) {
    if (!config.apiKey) {
      throw new Error('Missing required Stagehand configuration: apiKey');
    }

    this.apiKey = config.apiKey;
    this.projectId = config.projectId || process.env.BROWSERBASE_PROJECT_ID || '';
    this.modelName = config.modelName || 'claude-3-5-sonnet-latest';
    this.anthropicKey = config.anthropicKey || process.env.ANTHROPIC_API_KEY || '';
    
    // Log available API keys (without showing the actual values)
    console.log('API Keys available:');
    console.log('- Browserbase:', this.apiKey ? '✓' : '✗');
    console.log('- Anthropic:', this.anthropicKey ? '✓' : '✗');
    
    // Initialize the Browserbase SDK
    this.browserbase = new Browserbase({ apiKey: this.apiKey });
  }

  async createSession(request: CreateSessionRequest) {
    console.log('Starting session creation with Stagehand...');
    let stagehandInstance: Stagehand | null = null;
    
    try {
      // Let Stagehand handle session creation
      stagehandInstance = new Stagehand({
        env: "BROWSERBASE",
        apiKey: this.apiKey,
        projectId: this.projectId,
        modelName: this.modelName,
        modelClientOptions: {
          apiKey: this.anthropicKey,
        }
      });
      
      // Initialize and use the session
      console.log('Initializing Stagehand...');
      await stagehandInstance.init();
      
      const page = stagehandInstance.page;
      
      // Set timeout for navigations (30 seconds)
      page.setDefaultNavigationTimeout(30000);
      page.setDefaultTimeout(30000);
      
      // Process each action in sequence
      console.log(`Processing ${request.actions.length} actions...`);
      
      for (const action of request.actions) {
        console.log(`Processing action: ${action.type} - ${action.value}`);
        
        if (action.type === 'goto') {
          await page.goto(action.value);
          console.log(`Navigated to: ${action.value}`);
          // Wait for load instead of networkidle
          await page.waitForLoadState('load');
        } 
        else if (action.type === 'act') {
          await page.act(action.value);
          console.log(`Performed action: ${action.value}`);
          // Only wait for load after actions
          await page.waitForLoadState('load');
          await page.waitForTimeout(1000); // Additional 1s delay
        } 
        else if (action.type === 'observe') {
          const suggestions = await page.observe(action.value);
          console.log(`Observed actions:`, suggestions);
        } 
        else if (action.type === 'extract') {
          let extractResult;
          
          if (action.schema) {
            extractResult = await page.extract({
              instruction: action.value,
              schema: action.schema
            });
          } else {
            // Default schema if none provided
            extractResult = await page.extract({
              instruction: action.value,
              schema: z.object({
                result: z.any()
              })
            });
          }
          
          console.log(`Extracted data:`, extractResult);
        }
      }
      
      // Take a screenshot before closing
      try {
        await page.screenshot({ path: `session-${this.projectId}.png` });
        console.log('Screenshot saved');
      } catch (screenshotError) {
        console.error('Error taking screenshot:', screenshotError);
      }
      
      // Close the browser session
      await stagehandInstance.close();
      stagehandInstance = null;
      
      return {
        sessionId: this.projectId,
        success: true
      };
      
    } catch (error) {
      console.error('Error in Stagehand session:', error);
      throw error;
    }
  }
}

// Export an initialized client for use throughout the app
export const stagehand = new StagehandClient({
  apiKey: process.env.BROWSERBASE_API_KEY || '',
  projectId: process.env.BROWSERBASE_PROJECT_ID || '',
  modelName: 'claude-3-5-sonnet-latest',
  anthropicKey: process.env.ANTHROPIC_API_KEY || ''
});