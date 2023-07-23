import memoizerific from 'memoizerific';
import { type ThemeData, type TokenTextStyle } from './types';
import defaultTheme from './theme-default';

const themes = {
  default: defaultTheme,
};

export type ThemeName = keyof typeof themes;

export class Theme {
  private readonly typeStyleMap: Map<string, TokenTextStyle>;

  constructor(public data: ThemeData) {
    this.typeStyleMap = Theme.createTypeStyleMap(data);
  }

  private static createTypeStyleMap(data: ThemeData) {
    const map = new Map<string, TokenTextStyle>();

    for (const properties of data.tokenProperties) {
      const { types, style } = properties;

      for (const type of types) {
        const mixedStyles = map.get(type) ?? {};
        Object.assign(mixedStyles, style);
        map.set(type, mixedStyles);
      }
    }

    return map;
  }

  getTypesStyle(types: string[]) {
    const style: TokenTextStyle = {};
    for (const type of types) {
      const typeStyle = this.typeStyleMap.get(type);
      Object.assign(style, typeStyle);
    }

    return style;
  }

  static getTheme(themeName: ThemeName) {
    return new Theme(themes[themeName]);
  }
}

Theme.getTheme = memoizerific(100)(Theme.getTheme);
