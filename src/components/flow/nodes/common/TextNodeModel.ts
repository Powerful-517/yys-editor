import { HtmlNodeModel } from '@logicflow/core';

class TextNodeModel extends HtmlNodeModel {
  initNodeData(data: any) {
    super.initNodeData(data);
    // 启用文本编辑功能，支持双击编辑
    this.text.editable = true;
    this.text.draggable = false;

    // 如果有 text 属性，设置为文本内容
    if (data.properties?.text) {
      this.text.value = data.properties.text;
    }
  }

  setAttributes() {
    // 设置默认尺寸
    this.width = 200;
    this.height = 120;
  }

  // 自定义文本样式
  getTextStyle() {
    const style = super.getTextStyle();
    style.fontSize = 14;
    style.color = '#333';
    return style;
  }

  // 当文本被编辑后，同步到 properties
  updateText(value: string) {
    super.updateText(value);
    this.setProperty('text', value);
  }
}

export default TextNodeModel;
