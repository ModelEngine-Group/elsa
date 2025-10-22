# @fit-elsa/elsa

## 简介

@fit-elsa/elsa 是 ELSA（Enterprise Layout and Structure Assistant）的核心框架模块，提供统一的抽象数据结构和拖拽式流程编排能力。

## 功能亮点

### 统一的抽象数据结构
- Graph、Page、Shape结构通用于任意业务场景
- 全链路JSON序列化能力，兼容任何持久化存储方案

### 拖拽式流程编排
- 支持图形拖拽和画布拖拽
- 提供节点整理和一键显示所有节点的能力

## 安装

```bash
npm install @fit-elsa/elsa
```

## 快速开始

```javascript
import { ELSA, graph, page, shape, rectangle, line } from '@fit-elsa/elsa';

// 创建一个新的图形实例
const newGraph = graph.create();

// 创建一个页面
const newPage = page.create();
newGraph.add(newPage);

// 创建一个矩形
const rect = rectangle.create({
  x: 100,
  y: 100,
  width: 200,
  height: 100,
  text: '示例矩形'
});
newPage.add(rect);

// 创建一条线
const lineShape = line.create({
  startPoint: { x: 300, y: 150 },
  endPoint: { x: 400, y: 150 }
});
newPage.add(lineShape);

// 序列化图形数据
const graphData = ELSA.serialize(newGraph);
console.log('图形数据:', graphData);

// 反序列化图形数据
const deserializedGraph = ELSA.deserialize(graphData);
```

## API 参考

### 核心类
- **ELSA**: 主类，提供序列化和反序列化功能
- **graph**: 图形相关API
- **page**: 页面相关API
- **shape**: 形状相关API

### 形状类型
- **rectangle**: 矩形
- **line**: 线条
- **diamond**: 菱形
- **container**: 容器
- **reference**: 引用

## 开发

### 构建命令

```bash
# 安装依赖
npm install

# 构建开发版本
npm run build

# 构建调试版本
npm run build:debug

# 构建生产版本
npm run build:pro
```

## 许可证

MIT License

## 版权

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Huawei Technologies Co., Ltd. All rights reserved.
 *  This file is a part of the ModelEngine Project.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/