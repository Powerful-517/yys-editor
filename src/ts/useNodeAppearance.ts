import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { EventType } from '@logicflow/core';
import { normalizeNodeStyle, toContainerStyle, toTextStyle, type NodeStyle } from './nodeStyle';

type PropsChangeHandler = (props: any, node: any) => void;

export function useNodeAppearance(options?: { onPropsChange?: PropsChangeHandler }) {
  const getNode = inject('getNode') as (() => any) | undefined;
  const getGraph = inject('getGraph') as (() => any) | undefined;

  const style = ref<NodeStyle>(normalizeNodeStyle());

  const syncFromProps = (props?: any, node?: any) => {
    const target = props ?? node?.properties ?? {};
    // 优先使用 node 的实际尺寸，因为用户缩放时 node.width/height 会先更新
    const currentWidth = node?.width ?? target.width;
    const currentHeight = node?.height ?? target.height;

    style.value = normalizeNodeStyle(target.style, {
      width: currentWidth,
      height: currentHeight
    });
    options?.onPropsChange?.(target, node);
  };

  let offChange: (() => void) | null = null;

  onMounted(() => {
    const node = getNode?.();
    const graph = getGraph?.();

    syncFromProps(node?.properties, node);

    const handler = (eventData: any) => {
      if (eventData.id === node?.id) {
        syncFromProps(eventData.properties, node);
      }
    };
    graph?.eventCenter.on(EventType.NODE_PROPERTIES_CHANGE, handler);
    offChange = () => graph?.eventCenter.off(EventType.NODE_PROPERTIES_CHANGE, handler);
  });

  onBeforeUnmount(() => {
    offChange?.();
  });

  const containerStyle = computed(() => toContainerStyle(style.value));
  const textStyle = computed(() => toTextStyle(style.value));

  return {
    style,
    containerStyle,
    textStyle,
    syncFromProps
  };
}
