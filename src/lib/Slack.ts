import request from 'request';
import { AsyncMessage } from '../lib/Debug';

export default class Slack {
  webhook: string;

  constructor(slackConfig: SlackConfig) {
    this.webhook = slackConfig.webhook;
  }

  send(message: SlackMessage): Promise<AsyncMessage> {
    const options: request.Options = {
      method: 'POST',
      url: this.webhook,
      headers: { 'Content-Type': 'application/json' },
      body: message,
      json: true
    };

    return new Promise((resolve) => {
      request(options, (error) => {
        if (error) return resolve({ done: false, message: JSON.stringify(error) });
        resolve({ done: true, message: 'Message sent to slack channel' });
      });
    })
  }
}

export interface SlackConfig {
  webhook: string;
}

export interface Field {
  title: string;
  value: string;
  short?: boolean;
}

export interface Attachment {
  title: string;
  author_name?: string;
  fields?: Field[];
}

export interface SlackMessage {
  username: string;
  ts: number;
  attachments?: Attachment[];
  text?: string;
}
