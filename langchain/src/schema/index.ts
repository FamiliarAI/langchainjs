// langchain/src/schema/index.ts
/**
 * Output of a single generation.
 */
export interface Generation {
  /**
   * Generated text output
   */
  text: string;
  /**
   * Raw generation info response from the provider.
   * May include things like reason for finishing (e.g. in {@link OpenAI})
   */
  generationInfo?: Record<string, any>;
}

/**
 * Contains all relevant information returned by an LLM.
 */
export type LLMResult = {
  /**
   * List of the things generated. Each input could have multiple {@link Generation | generations}, hence this is a list of lists.
   */
  generations: Generation[][];
  /**
   * Dictionary of arbitrary LLM-provider specific output.
   */
  llmOutput?: Record<string, any>;
};
export type MessageRole = 'user' | 'assistant' | 'system';

export abstract class BaseChatMessage {
  /** The content of the message. */
  content: string;

  /** The role of the message. */
  role: MessageRole;

  /** Optional name string. */
  name?: string;

  constructor(content: string, role: MessageRole, name?: string) {
    this.content = content;
    this.role = role;
    this.name = name;
  }
}

export class UserChatMessage extends BaseChatMessage {
  constructor(content: string, name?: string) {
    super(content, 'user', name);
  }
}

export class AssistantChatMessage extends BaseChatMessage {
  constructor(content: string, name?: string) {
    super(content, 'assistant', name);
  }
}

export class SystemChatMessage extends BaseChatMessage {
  constructor(content: string, name?: string) {
    super(content, 'system', name);
  }
}

export interface ChatGeneration extends Generation {
  message: BaseChatMessage;
}

export interface ChatResult {
  generations: ChatGeneration[];

  llmOutput?: Record<string, any>;
}

/**
 * Base PromptValue class. All prompt values should extend this class.
 */
export abstract class BasePromptValue {
  abstract toString(): string;

  abstract toChatMessages(): BaseChatMessage[];
}

export type AgentAction = {
  tool: string;
  toolInput: string;
  log: string;
};
export type AgentFinish = {
  returnValues: Record<string, any>;
  log: string;
};
export type AgentStep = {
  action: AgentAction;
  observation: string;
};

export type ChainValues = Record<string, any>;
