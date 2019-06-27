'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vectorMathFp = require('vector-math-fp');
var approxFix = require('approx-fix');

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var _isRatioModeMap, _isMirrorModeMap, _inputAxisFilter, _ratioCornerOperator, _ratioEdgeOperator;
// * ---------------- supported resize mode 支持的计算类型

var modeChoice = {
  normal: 'normal',
  ratio: 'ratio',
  mirror: 'mirror',
  mirrorRatio: 'mirrorRatio'
};
var md = modeChoice; // * ---------------- supported trigger marker 支持的交互触发位置

var markerChoice = {
  left: 'left',
  right: 'right',
  top: 'top',
  bottom: 'bottom',
  leftTop: 'leftTop',
  leftBottom: 'leftBottom',
  rightTop: 'rightTop',
  rightBottom: 'rightBottom'
};
var mk = markerChoice; // * ---------------- error message

var mapKeyStr = function mapKeyStr(obj) {
  return Object.keys(obj).map(function (e) {
    return "'".concat(e, "'");
  }).join(' | ');
};

var modeChoiceErrMsg = "Invalid 'mode' param, it can only be: ".concat(mapKeyStr(modeChoice));
var markerChoiceErrMsg = "Invalid 'marker' param, it can only be: ".concat(mapKeyStr(markerChoice)); // * ---------------- nature of mode 计算模式的性质

var isRatioModeMap = (_isRatioModeMap = {}, _defineProperty(_isRatioModeMap, md.normal, false), _defineProperty(_isRatioModeMap, md.ratio, true), _defineProperty(_isRatioModeMap, md.mirror, false), _defineProperty(_isRatioModeMap, md.mirrorRatio, true), _isRatioModeMap);
var isMirrorModeMap = (_isMirrorModeMap = {}, _defineProperty(_isMirrorModeMap, md.normal, false), _defineProperty(_isMirrorModeMap, md.ratio, false), _defineProperty(_isMirrorModeMap, md.mirror, true), _defineProperty(_isMirrorModeMap, md.mirrorRatio, true), _isMirrorModeMap); // * ---------------- trigger from edge, filter input by one axis
// * 边缘触发时 input的轴向过滤器

var axisX = [1, 0];
var axisY = [0, 1];
var inputAxisFilter = (_inputAxisFilter = {}, _defineProperty(_inputAxisFilter, mk.left, axisX), _defineProperty(_inputAxisFilter, mk.right, axisX), _defineProperty(_inputAxisFilter, mk.top, axisY), _defineProperty(_inputAxisFilter, mk.bottom, axisY), _inputAxisFilter); // * ---------------- inputToSizeFilter 输入到尺寸的映射

var inputToSizeFilter = function () {
  var _ref;

  var l = -1;
  var r = 1;
  var t = -1;
  var b = 1;
  return _ref = {}, _defineProperty(_ref, mk.left, [l, 0]), _defineProperty(_ref, mk.right, [r, 0]), _defineProperty(_ref, mk.top, [0, t]), _defineProperty(_ref, mk.bottom, [0, b]), _defineProperty(_ref, mk.leftTop, [l, t]), _defineProperty(_ref, mk.leftBottom, [l, b]), _defineProperty(_ref, mk.rightTop, [r, t]), _defineProperty(_ref, mk.rightBottom, [r, b]), _ref;
}(); // * ---------------- diagonal of size which would be used for corner trigger
// * 角触发计算所需的对角线向量


var k1 = function k1(r) {
  return [r, 1];
};

var k2 = function k2(r) {
  return [r, -1];
};

var ratioCornerOperator = (_ratioCornerOperator = {}, _defineProperty(_ratioCornerOperator, mk.leftTop, k1), _defineProperty(_ratioCornerOperator, mk.leftBottom, k2), _defineProperty(_ratioCornerOperator, mk.rightTop, k2), _defineProperty(_ratioCornerOperator, mk.rightBottom, k1), _ratioCornerOperator); // * ---------------- lock ratio operator for edge trigger
// * 边缘触发时候 尺寸锁定比例的算子

var rx = function rx(r, _ref2) {
  var _ref3 = _slicedToArray(_ref2, 2),
      x = _ref3[0],
      y = _ref3[1];

  return [x, x / r];
};

var ry = function ry(r, _ref4) {
  var _ref5 = _slicedToArray(_ref4, 2),
      x = _ref5[0],
      y = _ref5[1];

  return [y * r, y];
};

var ratioEdgeOperator = (_ratioEdgeOperator = {}, _defineProperty(_ratioEdgeOperator, mk.left, rx), _defineProperty(_ratioEdgeOperator, mk.right, rx), _defineProperty(_ratioEdgeOperator, mk.top, ry), _defineProperty(_ratioEdgeOperator, mk.bottom, ry), _ratioEdgeOperator); // * ---------------------------------------------------------------- resize API

var resize = function resize(_ref6) {
  var startPos = _ref6.startPos,
      _ref6$opts = _ref6.opts,
      opts = _ref6$opts === void 0 ? {} : _ref6$opts;
  // * ---------------- preparing
  var center = startPos.center,
      size = startPos.size,
      rotate = startPos.rotate;
  var _opts$startPoint = opts.startPoint,
      startPoint = _opts$startPoint === void 0 ? [0, 0] : _opts$startPoint,
      _opts$movePoint = opts.movePoint,
      movePoint = _opts$movePoint === void 0 ? [0, 0] : _opts$movePoint,
      _opts$mode = opts.mode,
      mode = _opts$mode === void 0 ? 'normal' : _opts$mode,
      _opts$marker = opts.marker,
      marker = _opts$marker === void 0 ? null : _opts$marker;
  var result = {};

  if (!modeChoice[mode]) {
    throw modeChoiceErrMsg;
  }

  if (!markerChoice[marker]) {
    throw markerChoiceErrMsg;
  } // * ---------------- pre calculation 静态变量预计算
  // * edge trigger, filter the input, 边缘触发 过滤向量


  var toAxisVector = inputAxisFilter[marker];
  var isEdgeMarker = toAxisVector !== undefined; // * input would map to size, 输入映射到尺寸 过滤向量

  var toSizeVector = inputToSizeFilter[marker]; // * diagonal for corner trigger, 锁定和角触发时所需的 对角线向量

  var diagonalOperator = ratioCornerOperator[marker]; // * ratiolocker, 尺寸锁定宽高比的算子

  var ratioLocker = ratioEdgeOperator[marker]; // * nature of mode, 模式性质

  var isRatio = isRatioModeMap[mode];
  var isMirror = isMirrorModeMap[mode]; // * ---------------- varibles declaration 过程变量声明
  // * ratio, 宽高比

  var r = vectorMathFp.ratioOf(size); // * inputDelta, would be processed later, 手势输入值（后续会再次处理）

  var inputDelta = vectorMathFp.minus(startPoint, movePoint);
  var delta = vectorMathFp.rotate(-rotate, inputDelta);
  var dSize;

  if (!isRatio) {
    if (isEdgeMarker) {
      delta = vectorMathFp.times(toAxisVector, delta);
    }

    dSize = vectorMathFp.times(toSizeVector, delta);
  } else if (isEdgeMarker) {
    delta = vectorMathFp.times(toAxisVector, delta);
    dSize = vectorMathFp.times(toSizeVector, delta);
    dSize = ratioLocker(r, dSize);
  } else {
    // * project input to diagonal vector, 将输入映射到对角线投影
    var diagonalVector = diagonalOperator(r);
    delta = diagonalVector.map(function (e) {
      return e * vectorMathFp.dot(diagonalVector, delta) / Math.pow(vectorMathFp.lenOf(diagonalVector), 2);
    });
    dSize = vectorMathFp.times(toSizeVector, delta);
  } // * ---------------- calc size
  // * if isMirror, delta size show be twice
  // * 不中心对称模式 size已经计算好
  // * 中心对称模式 dSize应该是两倍


  if (isMirror) {
    dSize = dSize.map(function (e) {
      return e * 2;
    });
  } // * number should always be positive
  // * (while drag overhead it will be negative)
  // * 总是为正数（缩放过头会变成负数）


  result.size = vectorMathFp.add(size, dSize).map(Math.abs).map(approxFix.approxFix); // * ---------------- calc center
  // * if isMirror, center will never change
  // * 非中心对称模式 center会变
  // * 中心对称模式 center不会变

  if (!isMirror) {
    result.center = vectorMathFp.add(center, vectorMathFp.rotate(rotate, vectorMathFp.times([0.5, 0.5], delta))).map(approxFix.approxFix);
  }

  return result;
};

var move = function move(_ref) {
  var startPos = _ref.startPos,
      _ref$opts = _ref.opts,
      opts = _ref$opts === void 0 ? {} : _ref$opts;
  var _opts$startPoint = opts.startPoint,
      startPoint = _opts$startPoint === void 0 ? [0, 0] : _opts$startPoint,
      _opts$movePoint = opts.movePoint,
      movePoint = _opts$movePoint === void 0 ? [0, 0] : _opts$movePoint;
  var center = startPos.center;
  var result = {};
  result.center = vectorMathFp.add(center)(vectorMathFp.minus(startPoint, movePoint));
  return result;
};

// 需要记录多次计算中的movePoint
// 计算的范围是 (-179, 180] 拖动时保证（ 179 -> 181、-179 -> -181）

var rotate = function rotate(_ref) {
  var startPos = _ref.startPos,
      _ref$opts = _ref.opts,
      opts = _ref$opts === void 0 ? {} : _ref$opts;
  var _opts$startPoint = opts.startPoint,
      startPoint = _opts$startPoint === void 0 ? [0, 0] : _opts$startPoint,
      _opts$movePoint = opts.movePoint,
      movePoint = _opts$movePoint === void 0 ? [0, 0] : _opts$movePoint; // eslint-disable-next-line no-shadow

  var center = startPos.center,
      rotate = startPos.rotate;
  var result = {};
  result.rotate = rotate + vectorMathFp.angleBetween(vectorMathFp.minus(center, startPoint), vectorMathFp.minus(center, movePoint));
  return result;
};

exports.markerChoice = markerChoice;
exports.modeChoice = modeChoice;
exports.move = move;
exports.resize = resize;
exports.rotate = rotate;
//# sourceMappingURL=index.js.map
