import { resolve } from 'path';
import { writeFile } from 'fs';

export enum Severity {
  log = 'log',
  error = 'error',
};

export default class Debug {
  static dumpLog(name: string, log: any) {
    const logDumpFileName = `./log_dump/${name.replace(/\W/g, '_')}${(new Date()).valueOf()}.json`;
    const logMessage = typeof log === 'object' ? JSON.stringify(log) : String(log);
    writeFile(resolve(logDumpFileName), logMessage, (err: Error) => {
      Debug.logToConsole(Severity.error, err);
    });
  }

  static logToConsole(type: Severity, msg: any) {
    console[type](msg);
  }
}

export interface AsyncMessage {
  done: boolean,
  message: string;
}
