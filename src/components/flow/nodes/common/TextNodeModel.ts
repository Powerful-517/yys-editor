import { HtmlNodeModel } from '@logicflow/core';

class TextNodeModel extends HtmlNodeModel {
  initNodeData(data: any) {
    super.initNodeData(data);

    // 从 data 中读取宽高，支持调整大小后的持久化
    if (data.properties?.width) {
      this.width = data.properties.width;
    } else {
      this.width = 200;
    }

    if (data.properties?.height) {
      this.height = data.properties.height;
    } else {
      this.height = 120;
    }

    // 计算 Label 宽度
    const labelWidth = this.width - 20;

    // 初始化或更新 Label 配置
    if (data.properties?._label) {
      // 如果已有 _label 配置，更新其宽度和坐标
      // 处理数组情况（兼容旧数据）
      let currentLabel = data.properties._label;
      if (Array.isArray(currentLabel)) {
        currentLabel = currentLabel[0] || {};
      }

      this.setProperty('_label', {
        value: currentLabel.value || '双击编辑文本',
        content: currentLabel.content || currentLabel.value || '双击编辑文本',
        x: data.x,
        y: data.y,
        labelWidth: labelWidth,
        textOverflowMode: 'wrap',
        editable: true,
        draggable: false,
      });
    } else if (data.properties?.text) {
      // 如果有 text 属性但没有 _label，创建 _label
      this.setProperty('_label', {
        value: data.properties.text,
        content: data.properties.text,
        x: data.x,
        y: data.y,
        labelWidth: labelWidth,
        textOverflowMode: 'wrap',
        editable: true,
        draggable: false,
      });
    } else {
      // 如果都没有，初始化一个默认的 label
      this.setProperty('_label', {
        value: '双击编辑文本',
        content: '双击编辑文本',
        x: data.x,
        y: data.y,
        labelWidth: labelWidth,
        textOverflowMode: 'wrap',
        editable: true,
        draggable: false,
      });
    }
  }

  setAttributes() {
    // 设置默认尺寸（如果 initNodeData 中没有设置）
    if (!this.width) {
      this.width = 200;
    }
    if (!this.height) {
      this.height = 120;
    }
  }

  // 监听节点大小变化，更新 Label 宽度
  resize(deltaX: number, deltaY: number) {
    const result = super.resize?.(deltaX, deltaY);

    // 持久化宽高到 properties
    this.setProperty('width', this.width);
    this.setProperty('height', this.height);

    // 更新 Label 宽度和坐标
    let currentLabel = this.properties._label || {};
    if (Array.isArray(currentLabel)) {
      currentLabel = currentLabel[0] || {};
    }

    this.setProperty('_label', {
      value: currentLabel.value || '双击编辑文本',
      content: currentLabel.content || currentLabel.value || '双击编辑文本',
      x: this.x,
      y: this.y,
      labelWidth: this.width - 20,
      textOverflowMode: 'wrap',
      editable: true,
      draggable: false,
    });

    return result;
  }

  // 当文本被编辑后，同步到 properties
  updateText(value: string) {
    super.updateText(value);
    this.setProperty('text', value);

    // 同时更新 _label 中的 value
    let currentLabel = this.properties._label || {};
    if (Array.isArray(currentLabel)) {
      currentLabel = currentLabel[0] || {};
    }

    this.setProperty('_label', {
      value: value,
      content: value,
      x: this.x,
      y: this.y,
      labelWidth: this.width - 20,
      textOverflowMode: 'wrap',
      editable: true,
      draggable: false,
    });
  }
}

export default TextNodeModel;
