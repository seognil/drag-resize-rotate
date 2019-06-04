import { add, minus } from 'vector-math-fp';

const move = ({ startPos, opts = {} }) => {
    const { startPoint = [0, 0], movePoint = [0, 0] } = opts;
    const { center } = startPos;
    const result = {};

    result.center = add(center)(minus(startPoint, movePoint));

    return result;
};

export default move;
