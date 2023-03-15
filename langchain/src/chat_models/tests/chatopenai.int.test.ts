// langchain/src/chat_models/tests/chatopenai.int.test.ts
import { test, expect, jest } from '@jest/globals';
import { ChatOpenAI } from '../openai';
import { UserChatMessage, SystemChatMessage } from '../../schema/index';
import { ChatPromptValue } from '../../prompts/chat';
import {
  PromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate
} from '../../prompts/index';
// import { CallbackManager } from '../../callbacks/index';

test('Test ChatOpenAI', async () => {
  const chat = new ChatOpenAI({ modelName: 'gpt-3.5-turbo', maxTokens: 10 });
  const message = new UserChatMessage('Hello!');
  const res = await chat.call([message]);
  console.log('Test ChatOpenAI', { res });
});

test('Test ChatOpenAI with SystemChatMessage', async () => {
  const chat = new ChatOpenAI({ modelName: 'gpt-3.5-turbo', maxTokens: 10 });
  const system_message = new SystemChatMessage('You are to chat with a user.');
  const message = new UserChatMessage('Hello!');
  const res = await chat.call([system_message, message]);
  console.log('Test ChatOpenAI with SystemChatMessage', { res });
});

test('Test ChatOpenAI Generate Multiple Responses', async () => {
  const chat = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    maxTokens: 10,
    n: 2
  });
  const message = new UserChatMessage('Hello!');
  const res = await chat.generate([[message], [message]]);
  expect(res.generations.length).toBe(2);
  for (const generation of res.generations) {
    expect(generation.length).toBe(2);
    for (const message of generation) {
      console.log(message.text);
    }
  }
  console.log('Test ChatOpenAI Generate Multiple Responses', { res });
});

// //not working yet
// test('Test ChatOpenAI in streaming mode', async () => {
//   let nrNewTokens = 0;
//   let streamedCompletion = '';

//   const model = new ChatOpenAI({
//     modelName: 'gpt-3.5-turbo',
//     streaming: true,
//     callbackManager: CallbackManager.fromHandlers({
//       async handleLLMNewToken(token: string) {
//         nrNewTokens += 1;
//         streamedCompletion += token;
//       }
//     })
//   });
//   const message = new UserChatMessage('Hello!');
//   const res = await model.call([message]);
//   console.log('Test ChatOpenAI in streaming mode', { res });

//   expect(nrNewTokens > 0).toBe(true);
//   expect(res.content).toBe(streamedCompletion);
// });

test('Test ChatOpenAI prompt value', async () => {
  const chat = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    maxTokens: 10,
    n: 2
  });
  const message = new UserChatMessage('Hello!');
  const res = await chat.generatePrompt([new ChatPromptValue([message])]);
  expect(res.generations.length).toBe(1);
  for (const generation of res.generations) {
    expect(generation.length).toBe(2);
    for (const g of generation) {
      console.log(g.text);
    }
  }
  console.log('Test ChatOpenAI prompt value', { res });
});

test('OpenAI Chat, docs, prompt templates', async () => {
  const chat = new ChatOpenAI({ temperature: 0 });

  const systemPrompt = PromptTemplate.fromTemplate(
    'You are a helpful assistant that translates {input_language} to {output_language}.'
  );

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    new SystemMessagePromptTemplate(systemPrompt),
    HumanMessagePromptTemplate.fromTemplate('{text}')
  ]);

  const responseA = await chat.generatePrompt([
    await chatPrompt.formatPromptValue({
      input_language: 'English',
      output_language: 'French',
      text: 'I love programming.'
    })
  ]);

  console.log('OpenAI Chat, docs, prompt templates', responseA.generations);
}, 50000);
