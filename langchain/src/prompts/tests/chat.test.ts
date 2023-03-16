// langchain/src/prompts/tests/chat.test.ts
import { expect, test } from '@jest/globals';
import {
  AssistantMessagePromptTemplate,
  ChatPromptTemplate,
  UserMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder
} from '../chat';
import { PromptTemplate } from '../prompt';
import {
  AssistantChatMessage,
  UserChatMessage,
  SystemChatMessage
} from '../../schema/index';

function createChatPromptTemplate(): ChatPromptTemplate {
  const systemPrompt = new PromptTemplate({
    template: "Here's some context: {context}",
    inputVariables: ['context']
  });
  const userPrompt = new PromptTemplate({
    template: "Hello {foo}, I'm {bar}. Thanks for the {context}",
    inputVariables: ['foo', 'bar', 'context']
  });
  const aiPrompt = new PromptTemplate({
    template: "I'm an AI. I'm {foo}. I'm {bar}.",
    inputVariables: ['foo', 'bar']
  });
  return new ChatPromptTemplate({
    promptMessages: [
      new SystemMessagePromptTemplate(systemPrompt),
      new UserMessagePromptTemplate(userPrompt),
      new AssistantMessagePromptTemplate(aiPrompt)
    ],
    inputVariables: ['context', 'foo', 'bar']
  });
}

test('Test format', async () => {
  const chatPrompt = createChatPromptTemplate();
  const messages = await chatPrompt.formatPromptValue({
    context: 'This is a context',
    foo: 'Foo',
    bar: 'Bar'
  });
  expect(messages.toChatMessages()).toEqual([
    new SystemChatMessage("Here's some context: This is a context"),
    new UserChatMessage("Hello Foo, I'm Bar. Thanks for the This is a context"),
    new AssistantChatMessage("I'm an AI. I'm Foo. I'm Bar.")
  ]);
});

test('Test format with invalid input values', async () => {
  const chatPrompt = createChatPromptTemplate();
  await expect(
    chatPrompt.formatPromptValue({
      context: 'This is a context',
      foo: 'Foo'
    })
  ).rejects.toThrow('Missing value for input variable `bar`');
});

test('Test serialize', async () => {
  const chatPrompt = createChatPromptTemplate();
  expect(chatPrompt.serialize()).toMatchSnapshot();
});

test('Test format with invalid input variables', async () => {
  const systemPrompt = new PromptTemplate({
    template: "Here's some context: {context}",
    inputVariables: ['context']
  });
  const userPrompt = new PromptTemplate({
    template: "Hello {foo}, I'm {bar}",
    inputVariables: ['foo', 'bar']
  });
  expect(
    () =>
      new ChatPromptTemplate({
        promptMessages: [
          new SystemMessagePromptTemplate(systemPrompt),
          new UserMessagePromptTemplate(userPrompt)
        ],
        inputVariables: ['context', 'foo', 'bar', 'baz']
      })
  ).toThrow(
    'Input variables `baz` are not used in any of the prompt messages.'
  );

  expect(
    () =>
      new ChatPromptTemplate({
        promptMessages: [
          new SystemMessagePromptTemplate(systemPrompt),
          new UserMessagePromptTemplate(userPrompt)
        ],
        inputVariables: ['context', 'foo']
      })
  ).toThrow(
    'Input variables `bar` are used in prompt messages but not in the prompt template.'
  );
});

test('Test fromPromptMessages', async () => {
  const systemPrompt = new PromptTemplate({
    template: "Here's some context: {context}",
    inputVariables: ['context']
  });
  const userPrompt = new PromptTemplate({
    template: "Hello {foo}, I'm {bar}",
    inputVariables: ['foo', 'bar']
  });
  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    new SystemMessagePromptTemplate(systemPrompt),
    new UserMessagePromptTemplate(userPrompt)
  ]);
  expect(chatPrompt.inputVariables).toEqual(['context', 'foo', 'bar']);
  const messages = await chatPrompt.formatPromptValue({
    context: 'This is a context',
    foo: 'Foo',
    bar: 'Bar'
  });
  expect(messages.toChatMessages()).toEqual([
    new SystemChatMessage("Here's some context: This is a context"),
    new UserChatMessage("Hello Foo, I'm Bar")
  ]);
});

test('Test SimpleMessagePromptTemplate', async () => {
  const prompt = new MessagesPlaceholder('foo');
  const values = { foo: [new UserChatMessage("Hello Foo, I'm Bar")] };
  const messages = await prompt.formatMessages(values);
  expect(messages).toEqual([new UserChatMessage("Hello Foo, I'm Bar")]);
});
