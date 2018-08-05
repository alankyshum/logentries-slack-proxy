import { Request, Response } from 'express';
import Logentries, { Payload } from '../lib/Logentries';
import Slack, { Attachment, SlackMessage, SlackConfig } from '../lib/Slack';
import Debug, { AsyncMessage } from '../lib/Debug';

export default class LogentriesSlack {
  logentries: Logentries;
  slack: Slack;

  constructor(logentriesPayload: Payload, slackConfig: SlackConfig) {
    this.logentries = new Logentries(logentriesPayload);
    this.slack = new Slack(slackConfig);
  }

  static async handler(req: Request, res: Response) {
    let payload = req.body.payload;
    let webhook = req.query.slack_webhook;
    if (!payload) return res.send(`[ERROR] Message body does not contain <payload>`);
    if (!webhook) return res.send(`[ERROR] Message query params does not contain <slack_webhook>`);

    payload = JSON.parse(decodeURIComponent(payload));
    webhook = decodeURIComponent(webhook);

    const slackConfig = { webhook: `https://hooks.slack.com/services/${webhook}` };
    const logentriesToSlack = new LogentriesSlack(payload, slackConfig);

    const sendResult = await logentriesToSlack.sendToSlack();
    if (sendResult.done) return res.status(200).send(sendResult.message);

    Debug.dumpLog(`failed_${req.url}`, req.body);
    res.status(500).send(sendResult.message);
  }

  async sendToSlack(): Promise<AsyncMessage> {
    const logMessage: SlackMessage = this.toSlackMessage();
    return this.slack.send(logMessage);
  }

  private toSlackMessage(): SlackMessage {
    const userBehaviour: Attachment = {
      title: 'User Behaviour Log'
    };

    if (this.logentries.userBehaviourMeta.result) {
      const { result, resultTrace, ...otherProperties } = this.logentries.userBehaviourMeta;
      userBehaviour.fields = [];

      const otherFields = Object.entries(otherProperties).map((otherPropertiesMeta: string[]) => ({
        title: otherPropertiesMeta[0],
        value: otherPropertiesMeta[1],
        short: false
      }));

      userBehaviour.fields.push({
        title: result,
        value: resultTrace || '',
        short: false
      }, ...otherFields);
    }

    const slackMessage: SlackMessage = {
      username: this.logentries.serviceName,
      ts: this.logentries.payloadMeta.timestamp,
      attachments: [userBehaviour]
    };

    if (this.logentries.errorMeta) {
      const errorDetails: Attachment = {
        author_name: `Error Type: ${this.logentries.errorMeta.type}`,
        title: `Error Message: ${this.logentries.errorMeta.message}`,
      }

      slackMessage.text = `*Stacktrace*\n${this.logentries.errorMeta.backtrace.join('\n')}`;
      slackMessage.attachments = slackMessage.attachments || [];
      slackMessage.attachments.push(errorDetails);
    }

    return slackMessage;
  }
}
