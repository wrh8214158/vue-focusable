export interface DefaultConfig {
  KEY_LEFT: (number | string)[];
  KEY_UP: (number | string)[];
  KEY_RIGHT: (number | string)[];
  KEY_DOWN: (number | string)[];
  KEY_ENTER: (number | string)[];
  KEY_BACK: (number | string)[];
  itemAttrname: string;
  focusClassName: string;
  focusedAttrname: string;
  pressedAttrname: string;
  easing: string | ((val: any) => any);
  smoothTime: number;
  offsetDistanceX: number;
  offsetDistanceY: number;
  longPressTime: number;
  dblEnterTime: number;
  scrollDelay: number;
  distanceToCenter: boolean;
  touchpad: boolean;
  autoFocus: boolean;
  setCountAttr: boolean;
  endToNext: boolean;
}

export type DefaultConfigPartial = Partial<DefaultConfig>;
