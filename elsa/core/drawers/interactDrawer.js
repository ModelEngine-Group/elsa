/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Huawei Technologies Co., Ltd. All rights reserved.
 *  This file is a part of the ModelEngine Project.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {pixelRateAdapter} from '../../common/util.js';
import {cursorDrawer} from './cursorDrawer.js';
import {PAGE_OPERATION_MODE} from '../../common/const.js';

const CURSOR_DEFAULT_SIZE = 30;
/**
 * 鼠标移动时交互层绘制
 * 绘制鼠标，鼠标圈定的范围
 * 辉子 2021
 */
const interactDrawer = (graph, page, div) => {
  let self = {};
  self.type = 'interact drawer';

  const sensorId = (p) => {
    return `interactLayer:${p.id}`;
  };

  const getZoom = () => {
    let parent = div.parentNode;
    let zoom = 1;
    while (parent) {
      if (parent.nodeName !== '#document') {
        const parentZoom = getComputedStyle(parent).zoom;
        if (parentZoom !== '') {
          zoom *= parseFloat(parentZoom);
        }
      }
      parent = parent.parentNode;
    }
    return zoom;
  };

  self.zoom = getZoom();

  /**
   * 刷新zoom.
   */
  self.refreshZoom = () => {
    self.zoom = getZoom();
  };

  /**
   * 交互层，这层配对interactDrawer
   */
  self.sensor = (() => {
    const id = sensorId(page);
    const sensor = graph.createDom(div, 'div', id, page.id);
    sensor.classList.add('interactLayer');
    // 如果不是父子关系，那么可能是display. 此时需要创建新的dom.
    if (!div.contains(sensor)) {
      sensor.style.zIndex = 2;
      div.appendChild(sensor);
    }
    return sensor;
  })();

  const selectionId = (p) => {
    return `selection:${p.id}`;
  };

  self.selection = (() => {
    const id = selectionId(page);

    // 如果不是父子关系，那么可能是display. 此时需要创建新的dom.
    const selection = graph.createDom(div, 'div', id, page.id);
    if (!self.sensor.contains(selection)) {
      selection.style.border = '1px dashed';
      selection.style.borderColor = 'gray';
      selection.style.background = 'rgba(232,232,232,0.1)';
      selection.style.pointerEvents = 'none';
      self.sensor.appendChild(selection);
    }
    return selection;
  })();

  /**
   * 闭包构造一个拖拽缩放的工具栏
   *
   * @type {{}}
   */
  self.positonBar = (() => {
    /**
     * 基础工具工厂函数。
     *
     * @param {Object} options 配置项。
     * @param {string} options.icon SVG 图标。
     * @param {string} options.className CSS 类名。
     * @param {Function} [options.onClick] 点击事件回调。
     * @param {string} [options.tooltip] 工具说明。
     * @returns {{ getComponent: Function, update: Function }}
     */
    const createBaseTool = ({icon, className, onClick, tooltip}) => {
      const button = graph.createDom('div', 'div', className, page.id);
      button.innerHTML = icon;
      button.title = tooltip;
      Object.assign(button.style, {
        display: 'flex',
        width: '22px',
        height: '22px',
        background: 'white',
        cursor: 'pointer',
        margin: '0 3px',
        alignItems: 'center',
        justifyContent: 'center',
      });
      if (onClick) {
        button.onclick = onClick;
      }

      return {
        getComponent: () => button,
        update: () => {
        },
      };
    };

    /**
     * 构造一个适配屏幕的工具。
     *
     * @return {{}}。
     */
    const fitTool = () => {
      const PAGE_FIT_SCREEN_SCALE_MIN = 0.1;
      const PAGE_FIT_SCREEN_SCALE_MAX = 1.0;
      return createBaseTool({
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 500 500"><path xmlns="http://www.w3.org/2000/svg" fill="#121331" d="M57.294 187.526c-8.644 0-15.651-7.007-15.651-15.65v-52.083c0-20.117 16.367-36.483 36.484-36.483h52.083c8.644 0 15.651 7.007 15.651 15.65s-7.007 15.65-15.651 15.65H78.127a5.189 5.189 0 0 0-5.183 5.183v52.083c0 8.643-7.006 15.65-15.65 15.65zm72.917 229.169H78.128c-20.117 0-36.483-16.366-36.483-36.483v-50.781c0-8.643 7.006-15.65 15.65-15.65s15.65 7.007 15.65 15.65v50.781a5.19 5.19 0 0 0 5.183 5.183h52.083c8.644 0 15.65 7.007 15.65 15.65s-7.006 15.65-15.65 15.65zm291.668 0h-52.083c-8.644 0-15.651-7.007-15.651-15.65s7.007-15.65 15.651-15.65h52.083a5.189 5.189 0 0 0 5.183-5.183v-52.083c0-8.643 7.006-15.65 15.65-15.65s15.651 7.007 15.651 15.65v52.083c0 20.117-16.367 36.483-36.484 36.483zm20.833-229.168c-8.644 0-15.65-7.007-15.65-15.65v-52.083a5.19 5.19 0 0 0-5.183-5.184h-52.083c-8.644 0-15.651-7.006-15.651-15.649 0-8.643 7.007-15.65 15.651-15.65h52.083c20.117 0 36.484 16.366 36.484 36.483v52.083c0 8.643-7.007 15.65-15.651 15.65zm-62.499 166.668H119.795c-8.644 0-15.65-7.007-15.65-15.65V161.461c0-8.643 7.006-15.65 15.65-15.65h260.418c8.644 0 15.65 7.007 15.65 15.65v177.084c0 8.643-7.006 15.65-15.65 15.65zm-244.768-31.3h229.118V177.111H135.445v145.784z" class="primary"/></svg>`,
        className: 'barToolsFit',
        onClick: (e) => {
          page.fitScreen(PAGE_FIT_SCREEN_SCALE_MIN, PAGE_FIT_SCREEN_SCALE_MAX);
          e.stopPropagation();
        },
        tooltip: graph.i18n.t('displayAllNodes'),
      });
    };

    /**
     * 构造一个拖拽工具。
     *
     * @return {{}}。
     */
    const dragTool = () => {
      const tool = createBaseTool({
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 14 16"><path fill="currentColor" fill-opacity="0.8" fill-rule="evenodd" d="M8.23 2.625v.059a.367.367 0 0 0-.002.04v4.543a.365.365 0 0 0 .73 0V2.772a.987.987 0 0 1 .258-.034h.014a.986.986 0 0 1 .972.986v5.16-3.917 2.4a.365.365 0 1 0 .73 0V4.044a.987.987 0 0 1 .256-.033h.014a.986.986 0 0 1 .972.986v4.688c0 .067-.003.133-.006.2a4.87 4.87 0 0 1-1.455 3.237v.426a.667.667 0 0 1-.666.666H5.538a.667.667 0 0 1-.666-.666v-.519L1.733 9.721a.867.867 0 0 1 .225-1.363l.082-.043a1.334 1.334 0 0 1 1.5.175l.753.66V3.866A1.13 1.13 0 0 1 5.82 2.81v4.797a.365.365 0 1 0 .73 0V2.625a.84.84 0 1 1 1.68 0ZM7.39.785c.699 0 1.307.39 1.618.964a1.987 1.987 0 0 1 2.062 1.264l.118-.003c1.097 0 1.986.889 1.986 1.986v4.648a5.87 5.87 0 0 1-1.46 3.874v.029c0 .92-.747 1.666-1.667 1.666H5.538c-.92 0-1.666-.746-1.666-1.666v-.12L1.008 10.41a1.867 1.867 0 0 1 .483-2.936l.082-.043a2.333 2.333 0 0 1 1.72-.182v-3.38a2.13 2.13 0 0 1 2.47-2.103A1.84 1.84 0 0 1 7.39.785Z" clip-rule="evenodd"></path></svg>`,
        className: 'barToolsDrag',
        onClick: (e) => {
          page.operationMode = page.operationMode === PAGE_OPERATION_MODE.DRAG ? PAGE_OPERATION_MODE.SELECTION : PAGE_OPERATION_MODE.DRAG;
          tool.update(); // 触发更新
          e.stopPropagation();
        },
        tooltip: graph.i18n.t('handMode'),
      });

      /**
       * @override
       */
      tool.update = () => {
        tool.getComponent().style.background =
          page.operationMode === PAGE_OPERATION_MODE.SELECTION ? 'white' : '#D9DCFA';
      };

      return tool;
    };

    /**
     * 构造一个整理排列节点的工具。
     *
     * @return {{}}。
     */
    const reorganizeTool = () => {
      const PAGE_REORGANIZE_SCREEN_SCALE = 0.6;
      return createBaseTool({
        icon: `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.44631 3.25C8.31349 3.24998 7.38774 3.24996 6.65689 3.34822C5.89294 3.45093 5.2306 3.67321 4.70191 4.20191C4.17321 4.7306 3.95093 5.39294 3.84822 6.15689C3.74996 6.88775 3.74998 7.81348 3.75 8.94631L3.75 14.2559C3.60156 14.2599 3.46384 14.2667 3.33735 14.2782C3.00817 14.308 2.68222 14.3741 2.375 14.5514C2.03296 14.7489 1.74892 15.033 1.55145 15.375C1.37408 15.6822 1.30802 16.0082 1.27818 16.3374C1.24997 16.6486 1.24999 17.028 1.25 17.4677V17.5322C1.24999 17.972 1.24997 18.3514 1.27818 18.6627C1.30802 18.9918 1.37408 19.3178 1.55145 19.625C1.74892 19.967 2.03296 20.2511 2.375 20.4486C2.68222 20.6259 3.00817 20.692 3.33735 20.7218C3.64862 20.75 4.02793 20.75 4.46768 20.75H4.53223C4.97198 20.75 5.35138 20.75 5.66265 20.7218C5.99184 20.692 6.31779 20.6259 6.625 20.4486C6.96705 20.2511 7.25108 19.967 7.44856 19.625C7.62593 19.3178 7.69199 18.9918 7.72182 18.6627C7.75003 18.3514 7.75002 17.972 7.75 17.5322V17.4678C7.75002 17.028 7.75003 16.6486 7.72182 16.3374C7.69199 16.0082 7.62593 15.6822 7.44856 15.375C7.25108 15.033 6.96705 14.7489 6.625 14.5514C6.31779 14.3741 5.99184 14.308 5.66265 14.2782C5.53617 14.2667 5.39845 14.2599 5.25 14.2559V9C5.25 7.80029 5.2516 6.97595 5.33484 6.35676C5.41519 5.75914 5.55903 5.46611 5.76257 5.26257C5.96611 5.05903 6.25914 4.91519 6.85676 4.83484C7.47595 4.7516 8.30029 4.75 9.5 4.75H14.5C15.6997 4.75 16.5241 4.7516 17.1432 4.83484C17.7409 4.91519 18.0339 5.05903 18.2374 5.26257C18.441 5.46611 18.5848 5.75914 18.6652 6.35676C18.7484 6.97595 18.75 7.80029 18.75 9V10.1893L18.0303 9.46967C17.7374 9.17678 17.2626 9.17678 16.9697 9.46967C16.6768 9.76257 16.6768 10.2374 16.9697 10.5303L18.9697 12.5303C19.2626 12.8232 19.7374 12.8232 20.0303 12.5303L22.0303 10.5303C22.3232 10.2374 22.3232 9.76257 22.0303 9.46967C21.7374 9.17678 21.2626 9.17678 20.9697 9.46967L20.25 10.1893V8.94632C20.25 7.81348 20.25 6.88775 20.1518 6.15689C20.0491 5.39294 19.8268 4.7306 19.2981 4.20191C18.7694 3.67321 18.1071 3.45093 17.3431 3.34822C16.6123 3.24996 15.6865 3.24998 14.5537 3.25H9.44631ZM4.5 15.75C4.01889 15.75 3.7082 15.7507 3.47275 15.7721C3.2476 15.7925 3.16587 15.8269 3.125 15.8505C3.01099 15.9163 2.91631 16.011 2.85048 16.125C2.82689 16.1659 2.79247 16.2476 2.77206 16.4727C2.75072 16.7082 2.75 17.0189 2.75 17.5C2.75 17.9811 2.75072 18.2918 2.77206 18.5273C2.79247 18.7524 2.82689 18.8341 2.85048 18.875C2.91631 18.989 3.01099 19.0837 3.125 19.1495C3.16587 19.1731 3.2476 19.2075 3.47275 19.2279C3.7082 19.2493 4.01889 19.25 4.5 19.25C4.98111 19.25 5.2918 19.2493 5.52726 19.2279C5.7524 19.2075 5.83414 19.1731 5.875 19.1495C5.98902 19.0837 6.0837 18.989 6.14952 18.875C6.17311 18.8341 6.20754 18.7524 6.22794 18.5273C6.24928 18.2918 6.25 17.9811 6.25 17.5C6.25 17.0189 6.24928 16.7082 6.22794 16.4727C6.20754 16.2476 6.17311 16.1659 6.14952 16.125C6.0837 16.011 5.98902 15.9163 5.875 15.8505C5.83414 15.8269 5.7524 15.7925 5.52726 15.7721C5.2918 15.7507 4.98111 15.75 4.5 15.75Z" fill="#1C274C"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11.9678 14.25C11.528 14.25 11.1486 14.25 10.8374 14.2782C10.5082 14.308 10.1822 14.3741 9.875 14.5514C9.53296 14.7489 9.24892 15.033 9.05145 15.375C8.87408 15.6822 8.80802 16.0082 8.77818 16.3374C8.74997 16.6486 8.74999 17.028 8.75 17.4677V17.5322C8.74999 17.972 8.74997 18.3514 8.77818 18.6627C8.80802 18.9918 8.87408 19.3178 9.05145 19.625C9.24892 19.967 9.53296 20.2511 9.875 20.4486C10.1822 20.6259 10.5082 20.692 10.8374 20.7218C11.1486 20.75 11.5279 20.75 11.9677 20.75H12.0322C12.472 20.75 12.8514 20.75 13.1627 20.7218C13.4918 20.692 13.8178 20.6259 14.125 20.4486C14.467 20.2511 14.7511 19.967 14.9486 19.625C15.1259 19.3178 15.192 18.9918 15.2218 18.6627C15.25 18.3514 15.25 17.9721 15.25 17.5323V17.4678C15.25 17.028 15.25 16.6486 15.2218 16.3374C15.192 16.0082 15.1259 15.6822 14.9486 15.375C14.7511 15.033 14.467 14.7489 14.125 14.5514C13.8178 14.3741 13.4918 14.308 13.1627 14.2782C12.8514 14.25 12.472 14.25 12.0323 14.25H11.9678ZM10.625 15.8505C10.6659 15.8269 10.7476 15.7925 10.9727 15.7721C11.2082 15.7507 11.5189 15.75 12 15.75C12.4811 15.75 12.7918 15.7507 13.0273 15.7721C13.2524 15.7925 13.3341 15.8269 13.375 15.8505C13.489 15.9163 13.5837 16.011 13.6495 16.125C13.6731 16.1659 13.7075 16.2476 13.7279 16.4727C13.7493 16.7082 13.75 17.0189 13.75 17.5C13.75 17.9811 13.7493 18.2918 13.7279 18.5273C13.7075 18.7524 13.6731 18.8341 13.6495 18.875C13.5837 18.989 13.489 19.0837 13.375 19.1495C13.3341 19.1731 13.2524 19.2075 13.0273 19.2279C12.7918 19.2493 12.4811 19.25 12 19.25C11.5189 19.25 11.2082 19.2493 10.9727 19.2279C10.7476 19.2075 10.6659 19.1731 10.625 19.1495C10.511 19.0837 10.4163 18.989 10.3505 18.875C10.3269 18.8341 10.2925 18.7524 10.2721 18.5273C10.2507 18.2918 10.25 17.9811 10.25 17.5C10.25 17.0189 10.2507 16.7082 10.2721 16.4727C10.2925 16.2476 10.3269 16.1659 10.3505 16.125C10.4163 16.011 10.511 15.9163 10.625 15.8505Z" fill="#1C274C"/><path fill-rule="evenodd" clip-rule="evenodd" d="M19.4678 14.25H19.5322C19.972 14.25 20.3514 14.25 20.6627 14.2782C20.9918 14.308 21.3178 14.3741 21.625 14.5514C21.967 14.7489 22.2511 15.033 22.4486 15.375C22.6259 15.6822 22.692 16.0082 22.7218 16.3374C22.75 16.6486 22.75 17.0279 22.75 17.4677V17.5322C22.75 17.972 22.75 18.3514 22.7218 18.6627C22.692 18.9918 22.6259 19.3178 22.4486 19.625C22.2511 19.967 21.967 20.2511 21.625 20.4486C21.3178 20.6259 20.9918 20.692 20.6627 20.7218C20.3514 20.75 19.9721 20.75 19.5323 20.75H19.4678C19.028 20.75 18.6486 20.75 18.3374 20.7218C18.0082 20.692 17.6822 20.6259 17.375 20.4486C17.033 20.2511 16.7489 19.967 16.5514 19.625C16.3741 19.3178 16.308 18.9918 16.2782 18.6627C16.25 18.3514 16.25 17.972 16.25 17.5323V17.4678C16.25 17.028 16.25 16.6486 16.2782 16.3374C16.308 16.0082 16.3741 15.6822 16.5514 15.375C16.7489 15.033 17.033 14.7489 17.375 14.5514C17.6822 14.3741 18.0082 14.308 18.3374 14.2782C18.6486 14.25 19.028 14.25 19.4678 14.25ZM18.4727 15.7721C18.2476 15.7925 18.1659 15.8269 18.125 15.8505C18.011 15.9163 17.9163 16.011 17.8505 16.125C17.8269 16.1659 17.7925 16.2476 17.7721 16.4727C17.7507 16.7082 17.75 17.0189 17.75 17.5C17.75 17.9811 17.7507 18.2918 17.7721 18.5273C17.7925 18.7524 17.8269 18.8341 17.8505 18.875C17.9163 18.989 18.011 19.0837 18.125 19.1495C18.1659 19.1731 18.2476 19.2075 18.4727 19.2279C18.7082 19.2493 19.0189 19.25 19.5 19.25C19.9811 19.25 20.2918 19.2493 20.5273 19.2279C20.7524 19.2075 20.8341 19.1731 20.875 19.1495C20.989 19.0837 21.0837 18.989 21.1495 18.875C21.1731 18.8341 21.2075 18.7524 21.2279 18.5273C21.2493 18.2918 21.25 17.9811 21.25 17.5C21.25 17.0189 21.2493 16.7082 21.2279 16.4727C21.2075 16.2476 21.1731 16.1659 21.1495 16.125C21.0837 16.011 20.989 15.9163 20.875 15.8505C20.8341 15.8269 20.7524 15.7925 20.5273 15.7721C20.2918 15.7507 19.9811 15.75 19.5 15.75C19.0189 15.75 18.7082 15.7507 18.4727 15.7721Z" fill="#1C274C"/></svg>`,
        className: 'barToolsReorganize',
        onClick: (e) => {
          page.reorganizeNodes(PAGE_REORGANIZE_SCREEN_SCALE);
          e.stopPropagation() // 阻止事件冒泡
        },
        tooltip: graph.i18n.t('reorganizeNodes'),
      });
    };

    /**
     * 缩放工具
     *
     * @return {{}}
     */
    const zoomTool = () => {
      const me = {};

      const createZoomOut = () => {
        const button = graph.createDom(div, 'div', 'barToolsZoomIn', page.id);
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path fill="#1D1C23" fill-opacity="0.8" d="M1.333 8c0-.368.299-.666.667-.666h12a.667.667 0 1 1 0 1.333H2a.667.667 0 0 1-.667-.666Z"></path></svg>`;
        button.style.display = 'flex';
        button.style.width = '22px';
        button.style.height = '22px';
        button.style.background = 'white';
        button.style.alignItems = 'center';
        button.style.margin = '0px 3px 0px 3px';
        button.onclick = () => {
          me.zoomTo(page.scaleX - 0.1);
        };
        button.title = graph.i18n.t('zoomOut');
        return button;
      };

      const createZoomSlider = () => {
        const button = graph.createDom(div, 'input', 'barToolsZoomSlider', page.id);
        button.type = 'range';
        button.max = 100;
        button.min = 5;
        button.step = 5;
        button.value = 50;
        button.style.width = '80px';
        button.style.height = '22px';
        button.style.background = 'white';
        button.style.cursor = 'pointer';
        button.style.alignContent = 'center';
        button.style.margin = '3px';
        button.oninput = (value) => {
          me.sliderZoom(parseInt(button.value));
        };
        return button;
      };

      const createZoomText = () => {
        const button = graph.createDom(div, 'span', 'barToolsZoomText', page.id);
        button.style.width = '40px';
        button.style.height = '22px';
        button.style.background = 'white';
        button.style.alignContent = 'center';
        button.style.userSelect = 'none';
        button.style.margin = '3px';
        return button;
      };

      const createZoomIn = () => {
        const button = graph.createDom(div, 'div', 'barToolsZoomOut', page.id);
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" style="align-items: center;"><path fill="#1D1C23" fill-opacity="0.8" d="M8 1.334a.667.667 0 0 0-.667.667v5.333H2a.667.667 0 0 0 0 1.333h5.333v5.334a.667.667 0 0 0 1.334 0V8.667H14a.667.667 0 1 0 0-1.333H8.667V2.001A.667.667 0 0 0 8 1.334Z"></path></svg>`;
        button.style.display = 'flex';
        button.style.width = '22px';
        button.style.height = '22px';
        button.style.background = 'white';
        button.style.alignItems = 'center';
        button.style.margin = '0px 3px 0px 3px';
        button.onclick = () => {
          me.zoomTo(page.scaleX + 0.1);
        };
        button.title = graph.i18n.t('zoomIn');
        return button;
      };

      const zoomWrapper = graph.createDom(div, 'div', 'zoomWrapper', page.id);
      zoomWrapper.style.display = 'flex';
      zoomWrapper.style.alignItems = 'center';
      zoomWrapper.style.width = 'fit-content';
      zoomWrapper.style.height = 'fit-content';

      const zoomOut = createZoomOut();
      const zoomSlider = createZoomSlider();
      const zoomText = createZoomText();
      const zoomIn = createZoomIn();

      zoomWrapper.appendChild(zoomOut);
      zoomWrapper.appendChild(zoomSlider);
      zoomWrapper.appendChild(zoomText);
      zoomWrapper.appendChild(zoomIn);

      /**
       * 获取缩放工具组件
       * @return {*}
       */
      me.getComponent = () => zoomWrapper;

      /**
       * 缩放，内部方法
       *
       * @param scale
       */
      me.zoomTo = (scale) => {
        let centerX = page.width / page.scaleX / 2 - page.x;
        let centerY = page.height / page.scaleY / 2 - page.y;
        page.zoomTo(scale, scale, centerX, centerY);
        me.update();
      };

      /**
       * 刷新页面缩放比展示，内部方法
       */
      me.updateText = () => {
        zoomText.innerHTML = `${Math.round(page.scaleX * 100)}%`;
      };

      /**
       * 根据滑块计算缩放比，控制缩放，内部方法
       *
       * @param sliderValue
       */
      me.sliderZoom = (sliderValue) => {
        let scale;
        if (sliderValue <= 75) {
          scale = 1.0 - (50 - sliderValue) / 5 * 0.1;
        } else {
          scale = 1.5 + 5 * (sliderValue - 75) / 50;
        }
        me.zoomTo(scale);
      };

      /**
       * 响应外部变化，刷新滑块位置，内部方法
       */
      me.updateSlider = () => {
        let sliderValue;
        if (page.scaleX < 1.5) {
          sliderValue = 50 - (1.0 - page.scaleX) / 0.1 * 5;
        } else {
          sliderValue = (page.scaleX - 1.5) * 50 / 5 + 75;
        }
        zoomSlider.value = sliderValue;
      };

      /**
       * 更新缩放工具
       */
      me.update = () => {
        me.updateText();
        me.updateSlider();
      };

      me.update();
      return me;
    };

    const createSplitter = () => {
      const barSplitter = graph.createDom(div, 'div', 'barSplitter', page.id);
      barSplitter.style.width = '1px';
      barSplitter.style.height = '16px';
      barSplitter.style.background = 'lightGray';
      barSplitter.style.marginLeft = '5px';
      barSplitter.style.marginRight = '10px';
      barSplitter.style.alignSelf = 'center';
      return barSplitter;
    };

    const bars = {};
    bars.isDragging = false;
    bars.draggingBar = null;

    const barTools = graph.createDom(div, 'div', 'barTools', page.id);
    barTools.style.position = 'absolute';
    barTools.style.display = 'flex';
    barTools.style.alignItems = 'center';
    barTools.style.zIndex = 600;
    barTools.style.bottom = '20px';
    barTools.style.right = '20px';
    barTools.style.width = 'fit-content';
    barTools.style.height = 'fit-content';
    barTools.style.borderRadius = '12px';
    barTools.style.padding = '6px';
    barTools.style.boxShadow = '0 0 1px 0 rgba(0,0,0,.3),0 4px 14px 0 rgba(0,0,0,.1)';
    barTools.style.background = 'white';

    barTools.onmousedown = (e) => {
      e.stopPropagation();
    };

    self.sensor.appendChild(barTools);
    let drag = dragTool();
    barTools.appendChild(drag.getComponent());

    let reorganize = reorganizeTool();
    barTools.appendChild(reorganize.getComponent());

    let fit = fitTool();
    barTools.appendChild(fit.getComponent());

    const barSplitter = createSplitter();
    barTools.appendChild(barSplitter);

    let zoom = zoomTool();
    barTools.appendChild(zoom.getComponent());

    /**
     * 工具栏对外的更新方法，更新拖拽、缩放信息
     */
    bars.update = () => {
      if (!page.moveable || !page.canvasMoveAble) {
        barTools.style.display = 'none';
        return;
      }
      drag.update();
      zoom.update();
    };

    /**
     * 是否显示的开关
     *
     * @param isShow
     */
    bars.show = isShow => {
      barTools.style.display = isShow ? 'flex' : 'none';
    };
    return bars;
  })();

  /**
   * 闭包构造一个滚动条
   *
   * @type {{}}
   */
  self.scrollbar = (() => {
    const barSize = '10px';
    const barColor = 'lightgray';

    const bars = {};

    const bar = (type) => {
      let me = {};
      me.dragStartX = 0;
      me.dragStartY = 0;
      let container;

      me.init = () => {
        container = graph.createDom(div, 'div', `${type}Container`, page.id);
        container.style.position = 'absolute';
        container.style.display = 'block';
        container.style.zIndex = 3;
        me.containerStyle(container);
        me.container = container;
        self.sensor.appendChild(container);

        const mask = graph.createDom(div, 'div', `${type}ScrollbarMask`, page.id);
        mask.style.position = 'fixed';
        mask.style.width = '100%';
        mask.style.height = '100%';
        mask.style.left = 0;
        mask.style.top = 0;
        mask.style.display = 'none';
        mask.style.cursor = 'pointer';
        container.appendChild(mask);

        const scrollbar = graph.createDom(div, 'div', `${type}Scrollbar`, page.id);
        scrollbar.style.background = barColor;
        scrollbar.style.borderRadius = '12px';
        scrollbar.style.cursor = 'pointer';
        scrollbar.style.position = 'absolute';
        scrollbar.style.display = 'none';
        me.barStyle(scrollbar);
        me.scrollbar = scrollbar;
        container.appendChild(scrollbar);

        const handleMouseEnter = (e) => {
          me.mouseEnter = true;
          scrollbar.style.display = 'block';
          bars.update();
        };

        const handleMouseLeave = (e) => {
          me.mouseEnter = false;
          if (bars.isDragging) {
            return;
          }
          scrollbar.style.display = 'none';
        };

        const handleMouseDown = (e) => {
          bars.isDragging = true;
          bars.draggingBar = me;
          mask.style.display = 'block';
          me.dragStartX = e.clientX;
          me.dragStartY = e.clientY;
          e.stopPropagation();
          e.preventDefault();
        };

        const handleMouseUp = (e) => {
          bars.isDragging = false;
          bars.draggingBar = null;
          mask.style.display = 'none';
          if (!me.mouseEnter) {
            scrollbar.style.display = 'none';
          }
          e.stopPropagation();
          e.preventDefault();
        };

        const handleMouseMove = (e) => {
          if (!bars.isDragging) {
            return;
          }
          me.move(e);
          e.stopPropagation();
          e.preventDefault();
        };

        scrollbar.addEventListener('mousedown', (e) => handleMouseDown(e));
        scrollbar.addEventListener('mousemove', (e) => handleMouseMove(e));
        scrollbar.addEventListener('mouseup', (e) => handleMouseUp(e));

        container.addEventListener('mouseenter', (e) => handleMouseEnter(e));
        container.addEventListener('mouseleave', (e) => handleMouseLeave(e));

        mask.addEventListener('mousedown', (e) => handleMouseUp(e));
        mask.addEventListener('mousemove', (e) => handleMouseMove(e));
        mask.addEventListener('mouseup', (e) => handleMouseUp(e));
      };

      /**
       * 扩展API，用于设置bar容器的样式
       *
       * @param container scrollbar的父容器
       */
      me.containerStyle = (container) => {
      };
      /**
       * 扩展API，用于设置scrollbar的样式
       *
       * @param scrollbar 自身
       */
      me.barStyle = (scrollbar) => {
      };
      /**
       * 扩展API，用于更新bar
       *
       * @param begin 页面内容的开始位置
       * @param end 页面内容的结束位置
       */
      me.update = (begin, end) => {
      };
      /**
       * 扩展API，用于移动bar
       *
       * @param e
       */
      me.move = (e) => {
      };
      /**
       * 控制bar是否展示
       *
       * @param isShow
       */
      me.show = isShow => {
        container.style.display = isShow ? 'block' : 'none';
      };
      return me;
    };

    const hBar = (expand) => {
      const me = bar('horizontal');
      me.containerStyle = (container) => {
        container.style.width = `${div.clientWidth}px`;
        container.style.height = barSize;
        container.style.bottom = 0;
      };
      me.barStyle = (scrollbar) => {
        scrollbar.style.width = `${(div.clientWidth / 3)}px`;
        scrollbar.style.height = barSize;
      };
      me.update = (x1, x2) => {
        let max = -x1 + expand / page.scaleX;
        let min = -x2;
        let percent = 1 - (page.x - min) * 1.0 / (max - min);
        let left = (me.container.clientWidth - me.scrollbar.clientWidth) * percent;
        me.scrollbar.style.left = `${left}px`;
      };
      me.move = (e) => {
        let deltaX = e.clientX - me.dragStartX;
        let scrollLeft = parseFloat(me.scrollbar.style.left);
        if (!scrollLeft || isNaN(scrollLeft)) {
          scrollLeft = 0;
        }
        scrollLeft = Math.max(0, scrollLeft + deltaX);
        let percent = scrollLeft / (me.container.clientWidth - me.scrollbar.clientWidth);

        let frame = page.getShapeFrame();
        let x1 = frame.x1;
        let x2 = frame.x2;
        let max = -x1 + expand / page.scaleX;
        let min = -x2;
        let newX = (1 - percent) * (max - min) + min;
        page.moveTo(newX, page.y);
        me.update(x1, x2);
        me.dragStartX = e.clientX;
      };
      me.init();
      return me;
    };

    let vBar = (expand) => {
      const me = bar('vertical');
      me.containerStyle = (container) => {
        container.style.width = barSize;
        container.style.height = `${div.clientHeight}px`;
        container.style.right = 0;
      };
      me.barStyle = (scrollbar) => {
        scrollbar.style.width = barSize;
        scrollbar.style.height = `${(div.clientHeight / 3)}px`;
      };
      me.update = (y1, y2) => {
        let max = -y1 + expand / page.scaleY;
        let min = -y2;
        let percent = 1 - (page.y - min) * 1.0 / (max - min);
        let top = (me.container.clientHeight - me.scrollbar.clientHeight) * percent;
        me.scrollbar.style.top = `${top}px`;
      };
      me.move = (e) => {
        let deltaY = e.clientY - me.dragStartY;
        let scrollTop = parseFloat(me.scrollbar.style.top);
        if (!scrollTop || isNaN(scrollTop)) {
          scrollTop = 0;
        }
        scrollTop = Math.max(0, scrollTop + deltaY);
        let percent = scrollTop / (me.container.clientHeight - me.scrollbar.clientHeight);

        let frame = page.getShapeFrame();
        let y1 = frame.y1;
        let y2 = frame.y2;
        let max = -y1 + expand / page.scaleY;
        let min = -y2;
        let newY = (1 - percent) * (max - min) + min;
        page.moveTo(page.x, newY);
        me.update(y1, y2, expand);
        me.dragStartY = e.clientY;
      };
      me.init();
      return me;
    };

    bars.hBar = hBar(page.div.clientWidth);
    bars.vBar = vBar(page.div.clientHeight);

    /**
     * 更新滚动条
     */
    bars.update = () => {
      // 根据内容和视口大小调整滚动条
      const frame = page.getShapeFrame();
      bars.hBar.update(frame.x1, frame.x2);
      bars.vBar.update(frame.y1, frame.y2);
    };

    /**
     * 控制滚动条是否展示
     * @param isShow
     */
    bars.show = isShow => {
      bars.hBar.show(isShow);
      bars.hBar.show(isShow);
    };
    return bars;
  })();

  const cursorId = (p) => {
    return `cursor:${p.id}`;
  };

  self.cursor = (() => {
    const id = cursorId(page);

    // 如果不是父子关系，那么可能是display. 此时需要创建新的dom.
    return graph.createDom(div, 'canvas', id, page.id);
  })();

  self.pageIdChange = () => {
    graph.setElementId(self.sensor, sensorId(page));
    graph.setElementId(self.cursor, cursorId(page));
    graph.setElementId(self.selection, selectionId(page));
  };

  self.reset = () => {
    self.sensor.style.width = '100%';
    self.sensor.style.height = '100%';

    // 当图形被拖出画布时，可以出现滚动条.
    self.sensor.style.overflow = 'hidden';
    self.sensor.style.position = 'absolute';
    self.selection.style.position = 'absolute';
    let canMove = page.moveAble && page.canvasMoveAble;
    self.positonBar.show(canMove);
    self.scrollbar.show(canMove);
    const size = CURSOR_DEFAULT_SIZE;
    if (self.cursor.width !== size || self.cursor.height !== size) {
      self.cursor.width = self.cursor.height = size;
    }
    self.cursor.style.position = 'absolute';
    const context = self.cursor.getContext('2d');
    const scale = page.scaleX > 1 ? page.scaleX : 1;
    self.pixelRate = pixelRateAdapter(context, scale, scale);
    drawCursor(size / 2, context);
  };

  const drawCursor = (r, context) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.beginPath();
    context.fillStyle = 'lightgray';
    context.rect(r - 2, r - 2, 4, 4);
    context.fill();
    context.beginPath();
    context.fillStyle = 'steelBlue';
    let shape = null;
    if (page.isMouseDown) {
      shape = page.isMouseDown() ? page.mousedownShape : page.mouseInShape;
    }
    self.sensor.style.cursor = cursorDrawer.draw(context, r, r, page.cursor, page, shape);
  };

  self.drawDynamic = (x, y) => {
    const r = CURSOR_DEFAULT_SIZE / 2;
    if (!page.showCursor()) {
      self.cursor.style.visibility = 'hidden';
      return;
    } else {
      self.cursor.style.visibility = 'visible';
    }
    self.cursor.style.left = `${(x - r)}px`;
    self.cursor.style.top = `${(y - r)}px`;
    if (self.cursor.current !== page.cursor) {
      self.cursor.current = page.cursor;
      drawCursor(r, self.cursor.getContext('2d'));
    }
  };

  self.drawSelection = (x, y) => {
    if (ifHideSelection()) {
      self.selection.style.visibility = 'hidden';
      self.selection.style.width = self.selection.style.height = '1px';
      return;
    }
    let ox = (page.mousedownx + page.x) * page.scaleX;
    let oy = (page.mousedowny + page.y) * page.scaleY;

    if ((x - ox) !== 0 && (y - oy) !== 0) {
      self.selection.style.left = `${(x > ox ? ox : x)}px`;
      self.selection.style.top = `${(y > oy ? oy : y)}px`;
      self.selection.style.width = `${Math.abs(x - ox)}px`;
      self.selection.style.height = `${Math.abs(y - oy)}px`;
      self.selection.style.zIndex = page.maxIndex();
      self.selection.style.visibility = 'visible';
    }
  };

  const ifHideSelection = () => {
    return !page.isMouseDown() || page.ifHideSelection() || (page.mousedownShape !== page) || page.handAction();
  };

  self.draw = (position) => {
    let positionVal = position;
    if (positionVal === undefined || positionVal === null) {
      positionVal = {x: page.mousex, y: page.mousey};
    }
    let x = (positionVal.x + page.x) * page.scaleX;
    let y = (positionVal.y + page.y) * page.scaleY;
    self.cursor.style.zIndex = page.maxIndex() + 11;
    self.positonBar.update();
    if (page.operationMode === PAGE_OPERATION_MODE.SELECTION) {
      self.drawSelection(x, y);
    } else {
      self.scrollbar.update();
    }
    self.drawDynamic(x, y);
  };

  self.getInteract = () => self.sensor;
  self.reset();
  return self;
};

export {interactDrawer};