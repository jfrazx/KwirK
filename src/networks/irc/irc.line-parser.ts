import { Tags, extractTags } from './irc.tag-extractor';

const MESSAGE = /^(?:@([^ ]+) )?(?::((?:(?:([^\s!@]+)(?:!([^\s@]+))?)@)?(\S+)) )?((?:[a-zA-Z]+)|(?:[0-9]{3}))(?: ([^:].*?))?(?: :(.*))?$/i;
const CARRIAGE = /^\r+|\r+$/;

export function lineParser(line: string): MessageParams | void {
  if (typeof line !== 'string') {
    return;
  }

  const params = MESSAGE.exec(line.replace(CARRIAGE, ''));

  return params === null ? void 0 : extractParams(params);
}

function extractParams(extracted: RegExpExecArray): MessageParams {
  const params: MessageParams = {
    tags: extractTags(extracted),
    prefix: extracted[2],
    nick: extracted[3] || extracted[2],
    ident: extracted[4] || '',
    hostname: extracted[5] || '',
    command: extracted[6],
    params: extracted[7] ? extracted[7].split(/ +/) : [],
  };

  if (extracted[8] !== undefined) {
    params.params.push(extracted[8].replace(/\s+$/, ''));
  }

  return params;
}

export interface MessageParams {
  tags: Tags;
  prefix: string;
  nick: string;
  ident: string;
  hostname: string;
  command: string;
  params: Array<string>;
}
