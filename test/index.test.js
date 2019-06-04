const { checkError, checkFit, checkFitApprox } = require('@seognil-lab/chai-helper');
const { merge } = require('lodash/fp');
const { modeChoice: md, markerChoice: mk, move, resize, rotate } = require('../dist/index.cjs');

describe('readme demo', () => {
    it('log and wont crash', () => {
        const opt1 = {
            startPos: { center: [100, 200] },
            opts: {
                startPoint: [120, 150],
                movePoint: [130, 190],
            },
        };
        move(opt1); // => { center: [110, 240] }

        const opt2 = {
            startPos: { center: [100, 200], rotate: 30 },
            opts: {
                startPoint: [100, 250],
                movePoint: [150, 200],
            },
        };
        rotate(opt2); // => { rotate: -60 }

        const opt3 = {
            startPos: { center: [0, 0], rotate: -45, size: [200, 100] },
            opts: {
                startPoint: [0, 0],
                movePoint: [50, 50],
                mode: md.ratio,
                marker: mk.top,
            },
        };
        resize(opt3); // => { size: [ 58.57864376269052, 29.28932188134526 ], center: [ 25, 25 ] }
    });
});
describe('drag-resize-rotate', () => {
    it('move', () => {
        checkFit(
            move({
                startPos: { center: [0, 0] },
                opts: {
                    startPoint: [0, 0],
                    movePoint: [130, 190],
                },
            }),
            { center: [130, 190] },
        );

        checkFit(
            move({
                startPos: { center: [100, 200] },
                opts: {
                    startPoint: [120, 150],
                    movePoint: [130, 190],
                },
            }),
            { center: [110, 240] },
        );
    });

    it('rotate simple', () => {
        checkFitApprox(
            rotate({
                startPos: { center: [0, 0], rotate: 30 },
                opts: {
                    startPoint: [100, 200],
                    movePoint: [-200, 100],
                },
            }),
            { rotate: 120 },
        );

        checkFitApprox(
            rotate({
                startPos: { center: [100, 200], rotate: 30 },
                opts: {
                    startPoint: [150, 200],
                    movePoint: [100, 250],
                },
            }),
            { rotate: 120 },
        );

        checkFitApprox(
            rotate({
                startPos: { center: [100, 200], rotate: 30 },
                opts: {
                    startPoint: [100, 250],
                    movePoint: [150, 200],
                },
            }),
            { rotate: -60 },
        );
        checkFitApprox(
            rotate({
                startPos: { center: [100, 200], rotate: 30 },
                opts: {
                    startPoint: [100, 200],
                    movePoint: [150, 250],
                },
            }),
            { rotate: 30 },
        );
        checkFitApprox(
            rotate({
                startPos: { center: [100, 200], rotate: 30 },
                opts: {
                    startPoint: [100, 250],
                    movePoint: [150, 250],
                },
            }),
            { rotate: -15 },
        );
    });
});

describe('resize wrong param', () => {
    it('resize wrong param', () => {
        checkError(() => resize({ startPos: {}, opts: {} }));
        checkError(() => resize({ startPos: {}, opts: { marker: 'asd' } }));
        checkError(() => resize({ startPos: {}, opts: { mode: 'asd' } }));
        checkError(() => resize({ startPos: {}, opts: { mode: 'asd', markder: 'asd' } }));
    });
});

// * ================================================================================ 0度

describe('resize 0 degree', () => {
    it('normal mode', () => {
        const baseOpts = {
            startPos: { center: [0, 0], rotate: 0, size: [200, 100] },
            opts: {
                startPoint: [0, 0],
                movePoint: [50, 50],
                // mode: md.normal,
            },
        };

        const makeOpts = marker => merge(baseOpts, { opts: { marker } });

        // * input by a delta Vector, so size should add the delta, center should always add have delta
        // * the real size is add or minus the abs(delta)
        // * 手势移动一个Vector 使*尺寸的结构*加一个Vector 则中心点总是加半个Vector（结构的变化的一半）
        // * 尺寸的真实值 根据触发位置 加或减一个Vector

        checkFit(resize(makeOpts(mk.left)), { size: [150, 100], center: [25, 0] });
        checkFit(resize(makeOpts(mk.right)), { size: [250, 100], center: [25, 0] });
        checkFit(resize(makeOpts(mk.top)), { size: [200, 50], center: [0, 25] });
        checkFit(resize(makeOpts(mk.bottom)), { size: [200, 150], center: [0, 25] });
        checkFit(resize(makeOpts(mk.leftTop)), { size: [150, 50], center: [25, 25] });
        checkFit(resize(makeOpts(mk.leftBottom)), { size: [150, 150], center: [25, 25] });
        checkFit(resize(makeOpts(mk.rightTop)), { size: [250, 50], center: [25, 25] });
        checkFit(resize(makeOpts(mk.rightBottom)), { size: [250, 150], center: [25, 25] });
    });

    it('mirror mode', () => {
        const baseOpts = {
            startPos: { center: [0, 0], rotate: 0, size: [200, 100] },
            opts: {
                startPoint: [0, 0],
                movePoint: [50, 50],
                mode: md.mirror,
            },
        };

        const makeOpts = marker => merge(baseOpts, { opts: { marker } });

        checkFit(resize(makeOpts(mk.left)), { size: [100, 100] });
        checkFit(resize(makeOpts(mk.right)), { size: [300, 100] });
        checkFit(resize(makeOpts(mk.top)), { size: [200, 0] });
        checkFit(resize(makeOpts(mk.bottom)), { size: [200, 200] });
        checkFit(resize(makeOpts(mk.leftTop)), { size: [100, 0] });
        checkFit(resize(makeOpts(mk.leftBottom)), { size: [100, 200] });
        checkFit(resize(makeOpts(mk.rightTop)), { size: [300, 0] });
        checkFit(resize(makeOpts(mk.rightBottom)), { size: [300, 200] });
    });

    it('ratio mode', () => {
        // * delta ratio is locked as origin size
        // * it can be done by project the input to diagonal
        // * 原理同上 但是缩放时锁定缩放率 “尺寸的结构”变化值是锁定的
        // * 将输入投影到对角线上

        const baseOpts = {
            startPos: { center: [0, 0], rotate: 0, size: [200, 100] },
            opts: {
                startPoint: [0, 0],
                movePoint: [50, 50],
                mode: md.ratio,
            },
        };

        const makeOpts = marker => merge(baseOpts, { opts: { marker } });

        checkFit(resize(makeOpts(mk.left)), { size: [150, 75], center: [25, 0] });
        checkFit(resize(makeOpts(mk.right)), { size: [250, 125], center: [25, 0] });
        checkFit(resize(makeOpts(mk.top)), { size: [100, 50], center: [0, 25] });
        checkFit(resize(makeOpts(mk.bottom)), { size: [300, 150], center: [0, 25] });

        // * 300 400 500 is much easier for manual check
        const makeOpts2 = marker =>
            merge(baseOpts, {
                startPos: { size: [400, 300] },
                opts: { marker, movePoint: [200, 0] },
            });

        checkFit(resize(makeOpts2(mk.leftTop)), { size: [272, 204], center: [64, 48] });
        checkFit(resize(makeOpts2(mk.leftBottom)), { size: [272, 204], center: [64, -48] });
        checkFit(resize(makeOpts2(mk.rightTop)), { size: [528, 396], center: [64, -48] });
        checkFit(resize(makeOpts2(mk.rightBottom)), { size: [528, 396], center: [64, 48] });
    });

    it('mirrorRatio mode', () => {
        // * lock the ratio
        // * take advantage of diagonal
        // * 原理同上 但是缩放时锁定缩放率 “尺寸的结构”变化值是锁定的
        // * 将输入投影到对角线上

        const baseOpts = {
            startPos: { center: [0, 0], rotate: 0, size: [200, 100] },
            opts: {
                startPoint: [0, 0],
                movePoint: [50, 50],
                mode: md.mirrorRatio,
            },
        };

        const makeOpts = marker => merge(baseOpts, { opts: { marker } });

        checkFit(resize(makeOpts(mk.left)), { size: [100, 50] });
        checkFit(resize(makeOpts(mk.right)), { size: [300, 150] });
        checkFit(resize(makeOpts(mk.top)), { size: [0, 0] });
        checkFit(resize(makeOpts(mk.bottom)), { size: [400, 200] });

        // * 300 400 500 is much easier for manual check
        const makeOpts2 = marker =>
            merge(baseOpts, {
                startPos: { size: [400, 300] },
                opts: { marker, movePoint: [200, 0] },
            });

        checkFit(resize(makeOpts2(mk.leftTop)), { size: [144, 108] });
        checkFit(resize(makeOpts2(mk.leftBottom)), { size: [144, 108] });
        checkFit(resize(makeOpts2(mk.rightTop)), { size: [656, 492] });
        checkFit(resize(makeOpts2(mk.rightBottom)), { size: [656, 492] });
    });
});

// * ================================================================================ 正负45 degree normal mirror

describe('rotate 45 degree', () => {
    it('normal mode 45 degree', () => {
        const baseOpts = {
            startPos: { center: [0, 0], rotate: 45, size: [200, 100] },
            opts: {
                startPoint: [0, 0],
                movePoint: [50, 50],
                // mode: md.normal,
            },
        };

        const makeOpts = marker => merge(baseOpts, { opts: { marker } });

        const dLen = 50 / Math.SQRT1_2;

        checkFitApprox(resize(makeOpts(mk.left)), { size: [200 - dLen, 100], center: [25, 25] });
        checkFitApprox(resize(makeOpts(mk.right)), { size: [200 + dLen, 100], center: [25, 25] });
        checkFitApprox(resize(makeOpts(mk.top)), { size: [200, 100], center: [0, 0] });
        checkFitApprox(resize(makeOpts(mk.bottom)), { size: [200, 100], center: [0, 0] });
        checkFitApprox(resize(makeOpts(mk.leftTop)), { size: [200 - dLen, 100], center: [25, 25] });
        checkFitApprox(resize(makeOpts(mk.leftBottom)), {
            size: [200 - dLen, 100],
            center: [25, 25],
        });
        checkFitApprox(resize(makeOpts(mk.rightTop)), {
            size: [200 + dLen, 100],
            center: [25, 25],
        });
        checkFitApprox(resize(makeOpts(mk.rightBottom)), {
            size: [200 + dLen, 100],
            center: [25, 25],
        });
    });

    it('normal mode -45 degree', () => {
        const baseOpts = {
            startPos: { center: [0, 0], rotate: -45, size: [200, 100] },
            opts: {
                startPoint: [0, 0],
                movePoint: [50, 50],
                // mode: md.normal,
            },
        };

        const makeOpts = marker => merge(baseOpts, { opts: { marker } });

        const dLen = 50 / Math.SQRT1_2;

        checkFitApprox(resize(makeOpts(mk.left)), { size: [200, 100], center: [0, 0] });
        checkFitApprox(resize(makeOpts(mk.right)), { size: [200, 100], center: [0, 0] });
        checkFitApprox(resize(makeOpts(mk.top)), { size: [200, 100 - dLen], center: [25, 25] });
        checkFitApprox(resize(makeOpts(mk.bottom)), { size: [200, 100 + dLen], center: [25, 25] });
        checkFitApprox(resize(makeOpts(mk.leftTop)), { size: [200, 100 - dLen], center: [25, 25] });
        checkFitApprox(resize(makeOpts(mk.leftBottom)), {
            size: [200, 100 + dLen],
            center: [25, 25],
        });
        checkFitApprox(resize(makeOpts(mk.rightTop)), {
            size: [200, 100 - dLen],
            center: [25, 25],
        });
        checkFitApprox(resize(makeOpts(mk.rightBottom)), {
            size: [200, 100 + dLen],
            center: [25, 25],
        });
    });

    it('mirror mode 45 degree', () => {
        const baseOpts = {
            startPos: { center: [0, 0], rotate: 45, size: [200, 100] },
            opts: {
                startPoint: [0, 0],
                movePoint: [50, 50],
                mode: md.mirror,
            },
        };

        const makeOpts = marker => merge(baseOpts, { opts: { marker } });

        const dLen = (50 / Math.SQRT1_2) * 2;

        checkFitApprox(resize(makeOpts(mk.left)), { size: [200 - dLen, 100].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.right)), { size: [200 + dLen, 100].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.top)), { size: [200, 100].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.bottom)), { size: [200, 100].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.leftTop)), { size: [200 - dLen, 100].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.leftBottom)), { size: [200 - dLen, 100].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.rightTop)), { size: [200 + dLen, 100].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.rightBottom)), { size: [200 + dLen, 100].map(Math.abs) });
    });

    it('mirror mode -45 degree', () => {
        const baseOpts = {
            startPos: { center: [0, 0], rotate: -45, size: [200, 100] },
            opts: {
                startPoint: [0, 0],
                movePoint: [50, 50],
                mode: md.mirror,
            },
        };

        const makeOpts = marker => merge(baseOpts, { opts: { marker } });

        const dLen = (50 / Math.SQRT1_2) * 2;

        checkFitApprox(resize(makeOpts(mk.left)), { size: [200, 100].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.right)), { size: [200, 100].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.top)), { size: [200, 100 - dLen].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.bottom)), { size: [200, 100 + dLen].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.leftTop)), { size: [200, 100 - dLen].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.leftBottom)), { size: [200, 100 + dLen].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.rightTop)), { size: [200, 100 - dLen].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.rightBottom)), { size: [200, 100 + dLen].map(Math.abs) });
    });
});

// * ================================================================================ ratio mirrorRatio

describe('ratio mirrorRatio', () => {
    it('ratio mode 45 degree', () => {
        const baseOpts = {
            startPos: { center: [0, 0], rotate: 45, size: [200, 100] },
            opts: {
                startPoint: [0, 0],
                movePoint: [50, 50],
                mode: md.ratio,
            },
        };

        const makeOpts = marker => merge(baseOpts, { opts: { marker } });

        const dLen = 50 / Math.SQRT1_2; // 70.71067811865474 // 35.35533905932737

        const dLen2 = 40 * Math.SQRT2; // 56.568542494923804 // 28.284271247461902

        checkFitApprox(resize(makeOpts(mk.left)), {
            size: [200 - dLen, 100 - dLen / 2],
            center: [25, 25],
        });
        checkFitApprox(resize(makeOpts(mk.right)), {
            size: [200 + dLen, 100 + dLen / 2],
            center: [25, 25],
        });
        checkFitApprox(resize(makeOpts(mk.top)), { size: [200, 100], center: [0, 0] });
        checkFitApprox(resize(makeOpts(mk.bottom)), { size: [200, 100], center: [0, 0] });

        checkFitApprox(resize(makeOpts(mk.leftTop)), {
            size: [200 - dLen2, 100 - dLen2 / 2],
            center: [10, 30],
        });
        checkFitApprox(resize(makeOpts(mk.leftBottom)), {
            size: [200 - dLen2, 100 - dLen2 / 2],
            center: [30, 10],
        });
        checkFitApprox(resize(makeOpts(mk.rightTop)), {
            size: [200 + dLen2, 100 + dLen2 / 2],
            center: [30, 10],
        });
        checkFitApprox(resize(makeOpts(mk.rightBottom)), {
            size: [200 + dLen2, 100 + dLen2 / 2],
            center: [10, 30],
        });
    });

    it('ratio mode -45 degree', () => {
        const baseOpts = {
            startPos: { center: [0, 0], rotate: -45, size: [200, 100] },
            opts: {
                startPoint: [0, 0],
                movePoint: [50, 50],
                mode: md.ratio,
            },
        };

        const makeOpts = marker => merge(baseOpts, { opts: { marker } });

        const dLen = 50 / Math.SQRT1_2;

        const dLen2 = ((50 * Math.SQRT2) / 10) * 2;

        checkFitApprox(resize(makeOpts(mk.left)), { size: [200, 100], center: [0, 0] });
        checkFitApprox(resize(makeOpts(mk.right)), { size: [200, 100], center: [0, 0] });
        checkFitApprox(resize(makeOpts(mk.top)), {
            size: [200 - dLen * 2, 100 - dLen],
            center: [25, 25],
        });
        checkFitApprox(resize(makeOpts(mk.bottom)), {
            size: [200 + dLen * 2, 100 + dLen],
            center: [25, 25],
        });

        checkFitApprox(resize(makeOpts(mk.leftTop)), {
            size: [200 - dLen2 * 2, 100 - dLen2],
            center: [15, -5],
        });
        checkFitApprox(resize(makeOpts(mk.leftBottom)), {
            size: [200 + dLen2 * 2, 100 + dLen2],
            center: [-5, 15],
        });
        checkFitApprox(resize(makeOpts(mk.rightTop)), {
            size: [200 - dLen2 * 2, 100 - dLen2],
            center: [-5, 15],
        });
        checkFitApprox(resize(makeOpts(mk.rightBottom)), {
            size: [200 + dLen2 * 2, 100 + dLen2],
            center: [15, -5],
        });
    });

    it('mirrorRatio mode 45 degree', () => {
        const baseOpts = {
            startPos: { center: [0, 0], rotate: 45, size: [200, 100] },
            opts: {
                startPoint: [0, 0],
                movePoint: [50, 50],
                mode: md.mirrorRatio,
            },
        };

        const makeOpts = marker => merge(baseOpts, { opts: { marker } });

        // const checkFitApprox = console.warn;

        const dLen = (50 / Math.SQRT1_2) * 2; // 70.71067811865474 // 35.35533905932737

        const dLen2 = 40 * Math.SQRT2 * 2; // 56.568542494923804 // 28.284271247461902

        checkFitApprox(resize(makeOpts(mk.left)), {
            size: [200 - dLen, 100 - dLen / 2].map(Math.abs),
        });
        checkFitApprox(resize(makeOpts(mk.right)), {
            size: [200 + dLen, 100 + dLen / 2].map(Math.abs),
        });
        checkFitApprox(resize(makeOpts(mk.top)), { size: [200, 100].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.bottom)), { size: [200, 100].map(Math.abs) });

        checkFitApprox(resize(makeOpts(mk.leftTop)), {
            size: [200 - dLen2, 100 - dLen2 / 2].map(Math.abs),
        });
        checkFitApprox(resize(makeOpts(mk.leftBottom)), {
            size: [200 - dLen2, 100 - dLen2 / 2].map(Math.abs),
        });
        checkFitApprox(resize(makeOpts(mk.rightTop)), {
            size: [200 + dLen2, 100 + dLen2 / 2].map(Math.abs),
        });
        checkFitApprox(resize(makeOpts(mk.rightBottom)), {
            size: [200 + dLen2, 100 + dLen2 / 2].map(Math.abs),
        });
    });

    it('mirrorRatio mode -45 degree', () => {
        const baseOpts = {
            startPos: { center: [0, 0], rotate: -45, size: [200, 100] },
            opts: {
                startPoint: [0, 0],
                movePoint: [50, 50],
                mode: md.mirrorRatio,
            },
        };

        const makeOpts = marker => merge(baseOpts, { opts: { marker } });

        // const checkFitApprox = console.warn;

        const dLen = (50 / Math.SQRT1_2) * 2;

        const dLen2 = ((50 * Math.SQRT2) / 10) * 2 * 2; // 14.142135623730951 28.284271247461902 56.568542494923804

        checkFitApprox(resize(makeOpts(mk.left)), { size: [200, 100].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.right)), { size: [200, 100].map(Math.abs) });
        checkFitApprox(resize(makeOpts(mk.top)), {
            size: [200 - dLen * 2, 100 - dLen].map(Math.abs),
        });
        checkFitApprox(resize(makeOpts(mk.bottom)), {
            size: [200 + dLen * 2, 100 + dLen].map(Math.abs),
        });

        checkFitApprox(resize(makeOpts(mk.leftTop)), {
            size: [200 - dLen2 * 2, 100 - dLen2].map(Math.abs),
        });
        checkFitApprox(resize(makeOpts(mk.leftBottom)), {
            size: [200 + dLen2 * 2, 100 + dLen2].map(Math.abs),
        });
        checkFitApprox(resize(makeOpts(mk.rightTop)), {
            size: [200 - dLen2 * 2, 100 - dLen2].map(Math.abs),
        });
        checkFitApprox(resize(makeOpts(mk.rightBottom)), {
            size: [200 + dLen2 * 2, 100 + dLen2].map(Math.abs),
        });
    });
});

describe('rotate batch test', () => {
    it('rotate batch test', () => {
        // TODO  // seognil LC 2019/06/04
    });
});
