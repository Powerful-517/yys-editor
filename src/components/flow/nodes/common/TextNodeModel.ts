import { HtmlNodeModel } from '@logicflow/core';

const DEFAULT_TEXT_HTML = '<p>请输入文本</p>';
const DEFAULT_TEXT_STYLE = {
  fill: 'transparent',
  stroke: '',
  shadow: {
    color: 'transparent',
    blur: 0,
    offsetX: 0,
    offsetY: 0
  }
};

const parseSize = (value: unknown, fallback: number) => {
  const next = Number(value);
  return Number.isFinite(next) && next > 0 ? next : fallback;
};

const normalizeTextProperty = (rawText: any) => {
  if (typeof rawText === 'string') {
    return {
      content: rawText,
      rich: rawText.trim().startsWith('<')
    };
  }

  if (rawText && typeof rawText === 'object') {
    const content = typeof rawText.content === 'string' ? rawText.content : DEFAULT_TEXT_HTML;
    const rich = rawText.rich == null ? content.trim().startsWith('<') : rawText.rich !== false;
    return {
      ...rawText,
      content,
      rich
    };
  }

  return {
    content: DEFAULT_TEXT_HTML,
    rich: true
  };
};

class TextNodeModel extends HtmlNodeModel {
  initNodeData(data: any) {
    super.initNodeData(data);

    this.width = parseSize(data?.properties?.width, 200);
    this.height = parseSize(data?.properties?.height, 120);

    this.setProperty('width', this.width);
    this.setProperty('height', this.height);
    this.setProperty('text', normalizeTextProperty(data?.properties?.text));

    const hasStyle = Object.prototype.hasOwnProperty.call(data?.properties || {}, 'style');
    if (!hasStyle) {
      this.setProperty('style', DEFAULT_TEXT_STYLE);
    }
  }

  setAttributes() {
    if (!this.width) this.width = 200;
    if (!this.height) this.height = 120;
  }

  resize(deltaX: number, deltaY: number) {
    const result = super.resize?.(deltaX, deltaY);
    this.setProperty('width', this.width);
    this.setProperty('height', this.height);
    return result;
  }
}

export default TextNodeModel;
