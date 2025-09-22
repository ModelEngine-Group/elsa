/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Huawei Technologies Co., Ltd. All rights reserved.
 *  This file is a part of the ModelEngine Project.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as dagre from '@dagrejs/dagre';

export const getLayoutByDagre = (nodes, lines, rankdir = 'LR', align = 'UL', nodeHorizontalPadding = 40, nodeVerticalPadding = 50, ranker = 'tight-tree') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setGraph({rankdir: rankdir, align: align, nodesep: nodeHorizontalPadding, ranksep: nodeVerticalPadding, ranker: ranker});
  nodes.forEach(node => {
    dagreGraph.setNode(node.id, {
      width: node.width,
      height: node.height,
    });
  });
  lines.forEach(line => {
    dagreGraph.setEdge(line.fromShape, line.toShape, {});
  });
  dagre.layout(dagreGraph);
  return dagreGraph;
};