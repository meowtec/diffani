export interface BaseStyles {
  fontFace: string;
  color: string;
  backgroundColor: string;
}

export interface TokenTextStyle {
  fontWeight?: number | string;
  fontStyle?: string;
  color?: string;
  // not supported
  backgroundColor?: string;
  opacity?: number;
}

export interface ThemeToken {
  types: string[];
  style: TokenTextStyle;
}

export interface ThemeData extends BaseStyles {
  tokenProperties: ThemeToken[];
}
