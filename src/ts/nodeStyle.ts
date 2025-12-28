import type { CSSProperties } from 'vue';
import { DefaultNodeStyle, type NodeStyle } from './schema';

const toNumber = (value: any, fallback: number | undefined): number | undefined => {
  const num = Number(value);
  if (Number.isFinite(num)) return num;
  return fallback;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeRadius = (radius: NodeStyle['radius']): NodeStyle['radius'] => {
  const defaultRadius = DefaultNodeStyle.radius ?? 0;
  if (Array.isArray(radius)) {
    const fallback = Array.isArray(DefaultNodeStyle.radius)
      ? DefaultNodeStyle.radius
      : [defaultRadius, defaultRadius, defaultRadius, defaultRadius];
    return [
      toNumber(radius[0], fallback[0]) ?? 0,
      toNumber(radius[1], fallback[1]) ?? 0,
      toNumber(radius[2], fallback[2]) ?? 0,
      toNumber(radius[3], fallback[3]) ?? 0
    ];
  }
  return toNumber(radius, defaultRadius) ?? defaultRadius;
};

export function normalizeNodeStyle(
  style?: Partial<NodeStyle>,
  sizeFallback?: { width?: number; height?: number }
): NodeStyle {
  const incoming = style ?? {};
  const width = toNumber(incoming.width, sizeFallback?.width ?? DefaultNodeStyle.width) ?? DefaultNodeStyle.width;
  const height =
    toNumber(incoming.height, sizeFallback?.height ?? DefaultNodeStyle.height) ?? DefaultNodeStyle.height;

  const shadow = incoming.shadow ?? {};
  const textStyle = incoming.textStyle;
  const hasTextStyle = textStyle != null;

  const resolvedOpacity = incoming.opacity != null
    ? clamp(toNumber(incoming.opacity, DefaultNodeStyle.opacity ?? 1) ?? 1, 0, 1)
    : DefaultNodeStyle.opacity ?? 1;

  return {
    ...DefaultNodeStyle,
    ...incoming,
    width,
    height,
    opacity: resolvedOpacity,
    radius: normalizeRadius(incoming.radius),
    strokeWidth: toNumber(incoming.strokeWidth, DefaultNodeStyle.strokeWidth) ?? DefaultNodeStyle.strokeWidth,
    shadow: {
      ...DefaultNodeStyle.shadow,
      ...shadow,
      blur: toNumber(shadow.blur, DefaultNodeStyle.shadow?.blur) ?? DefaultNodeStyle.shadow?.blur,
      offsetX: toNumber(shadow.offsetX, DefaultNodeStyle.shadow?.offsetX) ?? DefaultNodeStyle.shadow?.offsetX,
      offsetY: toNumber(shadow.offsetY, DefaultNodeStyle.shadow?.offsetY) ?? DefaultNodeStyle.shadow?.offsetY
    },
    textStyle: hasTextStyle
      ? {
          color: textStyle?.color,
          fontFamily: textStyle?.fontFamily,
          fontSize: textStyle?.fontSize != null
            ? toNumber(textStyle.fontSize, DefaultNodeStyle.textStyle?.fontSize)
            : undefined,
          fontWeight: textStyle?.fontWeight,
          lineHeight: textStyle?.lineHeight,
          align: textStyle?.align,
          verticalAlign: textStyle?.verticalAlign,
          letterSpacing: textStyle?.letterSpacing,
          padding: textStyle?.padding,
          background: textStyle?.background
        }
      : textStyle
  };
}

export function normalizePropertiesWithStyle<T extends Record<string, any>>(
  props: T,
  sizeFallback?: { width?: number; height?: number }
): T & { style: NodeStyle } {
  const normalizedStyle = normalizeNodeStyle(props?.style, sizeFallback);
  return {
    ...props,
    style: normalizedStyle,
    width: normalizedStyle.width,
    height: normalizedStyle.height
  };
}

export function styleEquals(a?: Partial<NodeStyle>, b?: Partial<NodeStyle>): boolean {
  return JSON.stringify(normalizeNodeStyle(a)) === JSON.stringify(normalizeNodeStyle(b));
}

export function radiusToCss(radius?: NodeStyle['radius']): string | undefined {
  if (radius == null) return undefined;
  if (Array.isArray(radius)) {
    return radius.map((r) => `${r}px`).join(' ');
  }
  return `${radius}px`;
}

export function buildBoxShadow(shadow?: NodeStyle['shadow']): string | undefined {
  if (!shadow || shadow.color == null) return undefined;
  const blur = toNumber(shadow.blur, 0) ?? 0;
  const offsetX = toNumber(shadow.offsetX, 0) ?? 0;
  const offsetY = toNumber(shadow.offsetY, 0) ?? 0;
  return `${offsetX}px ${offsetY}px ${blur}px ${shadow.color}`;
}

export function toContainerStyle(style: NodeStyle): CSSProperties {
  return {
    background: style.fill,
    borderColor: style.stroke,
    borderWidth: style.stroke ? `${style.strokeWidth ?? 1}px` : undefined,
    borderStyle: style.stroke ? 'solid' : undefined,
    borderRadius: radiusToCss(style.radius),
    boxShadow: buildBoxShadow(style.shadow),
    opacity: style.opacity ?? 1
  };
}

export function toTextStyle(style: NodeStyle): CSSProperties {
  const text = style.textStyle ?? {};
  return {
    color: text.color,
    fontFamily: text.fontFamily,
    fontSize: text.fontSize != null ? `${text.fontSize}px` : undefined,
    fontWeight: text.fontWeight,
    lineHeight: text.lineHeight as CSSProperties['lineHeight'],
    textAlign: text.align
  };
}

export function extractStyleFromNode(node?: any): NodeStyle {
  const props = node?.properties ?? {};
  return normalizeNodeStyle(props.style, { width: props.width ?? node?.width, height: props.height ?? node?.height });
}
