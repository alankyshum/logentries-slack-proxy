export default class Logentries {
  serviceName = '';
  payloadMeta: PayloadMeta;
  userBehaviourMeta: UserBehaviourMeta;
  errorMeta: ErrorMeta | null;

  constructor(payload: Payload) {
    const messageHash = JSON.parse(payload.event.m);
    this.serviceName = messageHash.properties.service;
    this.payloadMeta = Logentries.getPayloadMeta(payload);
    this.userBehaviourMeta = Logentries.getUserBehaviourMeta(messageHash);
    this.errorMeta = Logentries.getErrorMeta(messageHash);
  }

  static getPayloadMeta(payload: Payload): PayloadMeta {
    return {
      timestamp: payload.event.t
    };
  }

  static getUserBehaviourMeta(messageHash: MessageHash): UserBehaviourMeta {
    const resultRawMsgPattern = /(?<result>[^\{]+)(?<resultTrace>\{.+\})?/;
    const resultMeta: RegExpMatchExtended | null = messageHash.message.match(resultRawMsgPattern);
    const actionMeta = {
      companyID: messageHash.properties.company_id,
      userID: messageHash.properties.user_id,
      action: messageHash.properties.method,
      actionPage: messageHash.properties.path,
    }

    if (!resultMeta) return actionMeta;
    return { ...actionMeta, ...resultMeta.groups };
  }

  static getErrorMeta(messageHash: MessageHash): ErrorMeta | null {
    if (!messageHash.error) return null;

    return {
      type: messageHash.error.type,
      message: messageHash.error.message,
      backtrace: Logentries.groomTrace(messageHash.error.backtrace)
    }
  }

  static groomTrace(stacktrace: string[]): ErrorMeta['backtrace'] {
    const outFilters = [
      /vendor\/bundle/
    ];

    return stacktrace.filter(trace => !outFilters.some(filter => filter.test(trace)));
  }
}

export interface PayloadMeta {
  timestamp: number;
}

export interface UserBehaviourMeta {
  companyID: string;
  userID: string;
  action: string;
  actionPage: string;
  result?: string;
  resultTrace?: string;
}

export interface ErrorMeta {
  type: string;
  message: string;
  backtrace: string[];
}

export interface Payload {
  event: {
    m: string;
    t: number;
  };
}

export interface MessageHash {
  message: string;
  properties: {
    company_id: string;
    user_id: string;
    method: string;
    path: string;
  };
  error?: {
    type: string;
    message: string;
    backtrace: string[];
  };
}

export interface RegExpMatchExtended extends RegExpMatchArray {
  groups?: {
    [key: string]: string;
  }
}
