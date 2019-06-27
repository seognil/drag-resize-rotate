/* eslint no-unused-vars: "warn" */

import {
    add as Vadd,
    dot as Vdot,
    lenOf as VlenOf,
    minus as Vminus,
    ratioOf as VratioOf,
    rotate as Vrotate,
    times as Vtimes,
} from 'vector-math-fp';

import { approxFix } from 'approx-fix';

// * ---------------------------------------------------------------- auxiliary data 辅助数据

// * ---------------- supported resize mode 支持的计算类型

const modeChoice = {
    normal: 'normal',
    ratio: 'ratio',
    mirror: 'mirror',
    mirrorRatio: 'mirrorRatio',
};

const md = modeChoice;

// * ---------------- supported trigger marker 支持的交互触发位置

const markerChoice = {
    left: 'left',
    right: 'right',
    top: 'top',
    bottom: 'bottom',
    leftTop: 'leftTop',
    leftBottom: 'leftBottom',
    rightTop: 'rightTop',
    rightBottom: 'rightBottom',
};

const mk = markerChoice;

// * ---------------- error message

const mapKeyStr = obj =>
    Object.keys(obj)
        .map(e => `'${e}'`)
        .join(' | ');

const modeChoiceErrMsg = `Invalid 'mode' param, it can only be: ${mapKeyStr(modeChoice)}`;
const markerChoiceErrMsg = `Invalid 'marker' param, it can only be: ${mapKeyStr(markerChoice)}`;

// * ---------------- nature of mode 计算模式的性质

const isRatioModeMap = {
    [md.normal]: false,
    [md.ratio]: true,
    [md.mirror]: false,
    [md.mirrorRatio]: true,
};

const isMirrorModeMap = {
    [md.normal]: false,
    [md.ratio]: false,
    [md.mirror]: true,
    [md.mirrorRatio]: true,
};

// * ---------------- trigger from edge, filter input by one axis
// * 边缘触发时 input的轴向过滤器

const axisX = [1, 0];
const axisY = [0, 1];
const inputAxisFilter = {
    [mk.left]: axisX,
    [mk.right]: axisX,
    [mk.top]: axisY,
    [mk.bottom]: axisY,
};

// * ---------------- inputToSizeFilter 输入到尺寸的映射

const inputToSizeFilter = (() => {
    const l = -1;
    const r = 1;
    const t = -1;
    const b = 1;

    return {
        [mk.left]: [l, 0],
        [mk.right]: [r, 0],
        [mk.top]: [0, t],
        [mk.bottom]: [0, b],
        [mk.leftTop]: [l, t],
        [mk.leftBottom]: [l, b],
        [mk.rightTop]: [r, t],
        [mk.rightBottom]: [r, b],
    };
})();

// * ---------------- diagonal of size which would be used for corner trigger
// * 角触发计算所需的对角线向量

const k1 = r => [r, 1];
const k2 = r => [r, -1];

const ratioCornerOperator = {
    [mk.leftTop]: k1,
    [mk.leftBottom]: k2,
    [mk.rightTop]: k2,
    [mk.rightBottom]: k1,
};

// * ---------------- lock ratio operator for edge trigger
// * 边缘触发时候 尺寸锁定比例的算子

const rx = (r, [x, y]) => [x, x / r];
const ry = (r, [x, y]) => [y * r, y];
const ratioEdgeOperator = {
    [mk.left]: rx,
    [mk.right]: rx,
    [mk.top]: ry,
    [mk.bottom]: ry,
};

// * ---------------------------------------------------------------- resize API

const resize = ({ startPos, opts = {} }) => {
    // * ---------------- preparing

    const { center, size, rotate } = startPos;
    const { startPoint = [0, 0], movePoint = [0, 0], mode = 'normal', marker = null } = opts;
    const result = {};

    if (!modeChoice[mode]) {
        throw modeChoiceErrMsg;
    }
    if (!markerChoice[marker]) {
        throw markerChoiceErrMsg;
    }

    // * ---------------- pre calculation 静态变量预计算

    // * edge trigger, filter the input, 边缘触发 过滤向量
    const toAxisVector = inputAxisFilter[marker];
    const isEdgeMarker = toAxisVector !== undefined;

    // * input would map to size, 输入映射到尺寸 过滤向量
    const toSizeVector = inputToSizeFilter[marker];

    // * diagonal for corner trigger, 锁定和角触发时所需的 对角线向量
    const diagonalOperator = ratioCornerOperator[marker];

    // * ratiolocker, 尺寸锁定宽高比的算子
    const ratioLocker = ratioEdgeOperator[marker];

    // * nature of mode, 模式性质
    const isRatio = isRatioModeMap[mode];
    const isMirror = isMirrorModeMap[mode];

    // * ---------------- varibles declaration 过程变量声明

    // * ratio, 宽高比
    const r = VratioOf(size);

    // * inputDelta, would be processed later, 手势输入值（后续会再次处理）
    const inputDelta = Vminus(startPoint, movePoint);
    let delta = Vrotate(-rotate, inputDelta);

    let dSize;
    let dCenter;

    // * -------------------------------- start calculation 开始计算

    if (!isRatio) {
        if (isEdgeMarker) {
            delta = Vtimes(toAxisVector, delta);
        }
        dSize = Vtimes(toSizeVector, delta);
    } else if (isEdgeMarker) {
        delta = Vtimes(toAxisVector, delta);

        dSize = Vtimes(toSizeVector, delta);
        dSize = ratioLocker(r, dSize);
    } else {
        // * project input to diagonal vector, 将输入映射到对角线投影
        const diagonalVector = diagonalOperator(r);
        delta = diagonalVector.map(
            e => (e * Vdot(diagonalVector, delta)) / VlenOf(diagonalVector) ** 2,
        );

        dSize = Vtimes(toSizeVector, delta);
    }

    // * ---------------- calc size

    // * if isMirror, delta size show be twice
    // * 不中心对称模式 size已经计算好
    // * 中心对称模式 dSize应该是两倍
    if (isMirror) {
        dSize = dSize.map(e => e * 2);
    }

    // * number should always be positive
    // * (while drag overhead it will be negative)
    // * 总是为正数（缩放过头会变成负数）
    result.size = Vadd(size, dSize)
        .map(Math.abs)
        .map(approxFix);

    // * ---------------- calc center

    // * if isMirror, center will never change
    // * 非中心对称模式 center会变
    // * 中心对称模式 center不会变
    if (!isMirror) {
        result.center = Vadd(center, Vrotate(rotate, Vtimes([0.5, 0.5], delta))).map(approxFix);
    }

    return result;
};

export default resize;

export { resize, markerChoice, modeChoice };
