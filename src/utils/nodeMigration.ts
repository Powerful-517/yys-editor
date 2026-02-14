/**
 * 节点数据迁移工具
 * 将旧节点类型自动转换为新节点类型
 */

import type { GraphData } from '@logicflow/core';

/**
 * 迁移映射表
 */
const MIGRATION_MAP: Record<string, { newType: string; transform: (node: any) => any }> = {
  shikigamiSelect: {
    newType: 'assetSelector',
    transform: (node) => ({
      ...node,
      type: 'assetSelector',
      properties: {
        ...node.properties,
        assetLibrary: 'shikigami',
        selectedAsset: node.properties?.shikigami || null,
        // 保留原始数据以便回退
        _migrated: {
          from: 'shikigamiSelect',
          originalData: node.properties?.shikigami
        }
      }
    })
  },
  yuhunSelect: {
    newType: 'assetSelector',
    transform: (node) => ({
      ...node,
      type: 'assetSelector',
      properties: {
        ...node.properties,
        assetLibrary: 'yuhun',
        selectedAsset: node.properties?.yuhun || null,
        // 保留原始数据以便回退
        _migrated: {
          from: 'yuhunSelect',
          originalData: node.properties?.yuhun
        }
      }
    })
  },
  imageNode: {
    newType: 'imageNode',
    transform: (node) => node // 保持不变
  },
  textNode: {
    newType: 'textNode',
    transform: (node) => node // 保持不变
  },
  propertySelect: {
    newType: 'propertySelect',
    transform: (node) => node // 保持不变
  },
  rect: {
    newType: 'rect',
    transform: (node) => node // 保持不变
  },
  ellipse: {
    newType: 'ellipse',
    transform: (node) => node // 保持不变
  }
};

/**
 * 迁移单个节点
 */
export function migrateNode(node: any): { node: any; migrated: boolean } {
  const migration = MIGRATION_MAP[node.type];

  if (!migration) {
    // 未知节点类型，保持不变
    return { node, migrated: false };
  }

  const migratedNode = migration.transform(node);
  const migrated = migratedNode.type !== node.type;

  return { node: migratedNode, migrated };
}

/**
 * 迁移图数据
 */
export function migrateGraphData(graphData: GraphData): {
  graphData: GraphData;
  migratedCount: number;
  migrations: Array<{ id: string; from: string; to: string }>;
} {
  if (!graphData || !graphData.nodes) {
    return { graphData, migratedCount: 0, migrations: [] };
  }

  const migrations: Array<{ id: string; from: string; to: string }> = [];
  let migratedCount = 0;

  const migratedNodes = graphData.nodes.map((node) => {
    const { node: migratedNode, migrated } = migrateNode(node);

    if (migrated) {
      migratedCount++;
      migrations.push({
        id: node.id,
        from: node.type,
        to: migratedNode.type
      });
    }

    return migratedNode;
  });

  return {
    graphData: {
      ...graphData,
      nodes: migratedNodes
    },
    migratedCount,
    migrations
  };
}

/**
 * 检查是否需要迁移
 */
export function needsMigration(graphData: GraphData): boolean {
  if (!graphData || !graphData.nodes) {
    return false;
  }

  return graphData.nodes.some((node) => {
    const migration = MIGRATION_MAP[node.type];
    if (!migration) return false;

    const { node: migratedNode } = migrateNode(node);
    return migratedNode.type !== node.type;
  });
}

/**
 * 获取迁移摘要信息
 */
export function getMigrationSummary(graphData: GraphData): string {
  const { migratedCount, migrations } = migrateGraphData(graphData);

  if (migratedCount === 0) {
    return '无需迁移';
  }

  const summary = migrations
    .map((m) => `节点 ${m.id}: ${m.from} → ${m.to}`)
    .join('\n');

  return `迁移了 ${migratedCount} 个节点:\n${summary}`;
}
