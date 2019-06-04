import { angleBetween, minus } from 'vector-math-fp';

// TODO feature 旋转的连续性（角度不要突变） // seognil LC 2019/05/08
// 需要记录多次计算中的movePoint
// 计算的范围是 (-179, 180] 拖动时保证（ 179 -> 181、-179 -> -181）

const rotate = ({ startPos, opts = {} }) => {
    const { startPoint = [0, 0], movePoint = [0, 0] } = opts;
    const { center, rotate } = startPos;
    const result = {};

    result.rotate = rotate + angleBetween(minus(center, startPoint), minus(center, movePoint));

    return result;
};

export default rotate;
