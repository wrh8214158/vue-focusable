export type Next = Element | DirectionString | NextObject;

export type DirectionString = 'left' | 'right' | 'up' | 'down';

export interface NextObject {
  el: Element | DirectionString | { [key: string]: unknown };
  smooth?: boolean;
  smoothTime?: number;
  end?: () => void;
  easing?: string | ((val?: any) => any);
  distanceToCenter?: boolean;
  offsetDistanceX?: number;
  offsetDistanceY?: number;
}
