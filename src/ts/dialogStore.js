// src/store/dialogStore.js
import { defineStore } from 'pinia';

export const useDialogStore = defineStore('dialog', {
    state: () => ({
        // 对话框可见性
        shikigamiVisible: false,
        yuhunVisible: false,
        propertyVisible: false,

        // 当前选中的节点信息
        selectedNode: null,

        // 当前选中的数据（式神、御魂、属性）
        currentShikigami: { name: '未选择式神', avatar: '', rarity: '' },
        currentYuhun: { name: '未选择御魂', avatar: '', type: '' },
        currentProperty: { type: '未选择属性', priority: 'optional', description: '' },
    }),

    actions: {
        // 打开式神选择对话框
        openShikigamiDialog(node) {
            this.selectedNode = node;
            this.shikigamiVisible = true;
        },

        // 关闭式神选择对话框
        closeShikigamiDialog() {
            this.shikigamiVisible = false;
        },

        // 更新式神信息
        updateShikigami(shikigami) {
            if (this.selectedNode) {
                try {
                    // 获取节点引用，尝试多种方式获取 Vue 组件实例
                    const nodeElement = document.querySelector(`[data-id="${this.selectedNode.id}"]`);
                    if (nodeElement) {
                        let nodeInstance = null;

                        // 方法1：通过 __vueParentComponent (Vue 3)
                        if (nodeElement.__vueParentComponent && nodeElement.__vueParentComponent.ctx) {
                            nodeInstance = nodeElement.__vueParentComponent.ctx;
                        }
                        // 方法2：通过 __vue_app__ (Vue 3)
                        else if (nodeElement.__vue_app__) {
                            nodeInstance = nodeElement.__vue_app__;
                        }

                        // 如果找到实例并且有更新方法，调用它
                        if (nodeInstance && nodeInstance.updateNodeShikigami) {
                            nodeInstance.updateNodeShikigami(shikigami);
                            console.log('式神信息已更新:', shikigami.name);
                        } else {
                            console.warn('无法调用节点更新方法');
                            // 备用方案：通过全局事件总线传递更新
                            window.dispatchEvent(new CustomEvent('update-shikigami', {
                                detail: { nodeId: this.selectedNode.id, shikigami },
                            }));
                        }
                    }
                } catch (error) {
                    console.error('更新式神信息时出错:', error);
                }
            }

            // 关闭对话框
            this.shikigamiVisible = false;
        },

        // 打开御魂选择对话框
        openYuhunDialog(node) {
            this.selectedNode = node;
            this.yuhunVisible = true;
        },

        // 关闭御魂选择对话框
        closeYuhunDialog() {
            this.yuhunVisible = false;
        },

        // 更新御魂信息
        updateYuhun(yuhun) {
            this.currentYuhun = yuhun;
            this.closeYuhunDialog();
            this.updateNodeData('yuhun', yuhun);
        },

        // 打开属性选择对话框
        openPropertyDialog(node) {
            this.selectedNode = node;
            this.propertyVisible = true;
        },

        // 关闭属性选择对话框
        closePropertyDialog() {
            this.propertyVisible = false;
        },

        // 更新属性信息
        updateProperty(property) {
            this.currentProperty = property;
            this.closePropertyDialog();
            this.updateNodeData('property', property);
        },

        // 统一更新节点数据（通过事件总线或直接调用方法）
        updateNodeData(type, data) {
            if (this.selectedNode) {
                // 方法1：通过事件总线触发更新（推荐）
                window.dispatchEvent(new CustomEvent(`update-${type}`, {
                    detail: { nodeId: this.selectedNode.id, data }
                }));

                // 方法2：直接调用节点实例的方法（如果节点组件支持）
                // const nodeElement = document.querySelector(`[data-id="${this.selectedNode.id}"]`);
                // if (nodeElement && nodeElement.__vueParentComponent?.ctx?.[`updateNode${type.charAt(0).toUpperCase() + type.slice(1)}`]) {
                //   nodeElement.__vueParentComponent.ctx[`updateNode${type.charAt(0).toUpperCase() + type.slice(1)}`](data);
                // }
            }
        },
    },
});