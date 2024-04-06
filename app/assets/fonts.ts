export interface FontSchemeInterface {
  body: string;
  title: string;
}

export class Font {
  static RedditMono = '"Reddit Mono", monospace';
}

const FontScheme: FontSchemeInterface = {
  body: Font.RedditMono,
  title: Font.RedditMono,
};

export default FontScheme;
