const ESCAPE = /\\\\|\\:|\\s|\\n|\\r/gi;
const escapeTags: EscapeTags = {
  '\\\\': '\\',
  '\\:': ';',
  '\\s': ' ',
  '\\n': '\n',
  '\\r': '\r',
};

export function extractTags(message: RegExpExecArray): Tags {
  const tags: Tags = Object.create(null);
  const [, content] = message;

  if (!content) {
    return tags;
  }

  return content.split(';').reduce<Tags>((tag, portion) => {
    const [key, value] = portion.split('=');

    return key ? { ...tag, [key.toLowerCase()]: determineValue(value) } : tag;
  }, tags);
}

function determineValue(value?: string): string | boolean {
  return typeof value === 'string' ? value.replace(ESCAPE, matcher) : true;
}

function matcher(match: string): string {
  return escapeTags[match] || '';
}

export interface Tags {
  [tag: string]: string | boolean;
}

interface EscapeTags {
  [index: string]: string;
}
