import { HtmlNodeModel } from '@logicflow/core';

class VectorNodeModel extends HtmlNodeModel {
  initNodeData(data: any) {
    super.initNodeData(data);

    // 从 properties 读取宽高
    if (data.properties?.width) {
      this.width = data.properties.width;
    } else {
      this.width = 200;
    }

    if (data.properties?.height) {
      this.height = data.properties.height;
    } else {
      this.height = 200;
    }

    // 初始化默认矢量配置
    if (!data.properties?.vector) {
      this.setProperty('vector', {
        kind: 'rect',
        tileWidth: 50,
        tileHeight: 50,
        fill: '#409EFF',
        stroke: '#303133',
        strokeWidth: 1
      });
    }
  }

  resize(deltaX: number, deltaY: number) {
    const result = super.resize?.(deltaX, deltaY);

    const nextWidth = this.width;
    const nextHeight = this.height;

    // 宽高无变化时跳过，避免高频缩放中的无效属性变更事件。
    if (this.properties?.width === nextWidth && this.properties?.height === nextHeight) {
      return result;
    }

    // 持久化宽高到 properties（单次提交，减少事件抖动）。
    const setProperties = (this as any).setProperties as ((props: Record<string, any>) => void) | undefined;
    if (setProperties) {
      setProperties.call(this, {
        width: nextWidth,
        height: nextHeight
      });
    } else {
      this.setProperty('width', nextWidth);
      this.setProperty('height', nextHeight);
    }

    return result;
  }
}

export default VectorNodeModel;
