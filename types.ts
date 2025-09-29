export interface Intent {
  id: string;
  name: string;
  trainingPhrases: string[];
  response: string;
}

export interface BotConfig {
  id: string;
  name: string;
  themeColor: string;
  defaultResponse: string;
  intents: Intent[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export enum View {
  BUILDER,
  PREVIEW,
}