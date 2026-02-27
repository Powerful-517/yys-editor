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

    // 持久化宽高到 properties
    this.setProperty('width', this.width);
    this.setProperty('height', this.height);

    return result;
  }
}

export default VectorNodeModel;
