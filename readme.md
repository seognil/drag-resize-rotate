## ⭐️ What

drag-resize-rotate calculation core functions for UI frameworks.

## 📦 Getting Started

**Installation**

```shell
npm install drag-resize-rotate
# or
yarn add drag-resize-rotate
```

**Usage**

```javascript
const { modeChoice: md, markerChoice: mk, move, resize, rotate } = require('drag-resize-rotate');

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
```

---

## 💡 Why

Calculation should be pure mathematics,  
It should be done and can be run with only js data, and without UI framework.  
No matter work with `jQuery` `React` `Vue` or even futher frameworks.  
It's much robust.

## 📖 Description

**API**

-   **API**
    -   move `(Options) => PosDelta`
    -   rotate `(Options) => PosDelta`
    -   resize `(Options) => PosDelta`
-   **option helper**
    -   modeChoice `{map}`
    -   markerChoice `{map}`

result returned as delta Pos

**Options**

```javascript
{
    startPos: { // * Position of element
        center: [0, 0],
        rotate: -45,
        size: [200, 100]
    },
    opts:{
        startPoint: [0, 0], // * mouse canvas point
        movePoint: [50, 50],  // * mouse canvas point
        mode: md.ratio, // * resize only
        marker: mk.top, // * resize only
    }
}
```

**startPos**  
as element position structure

**startPoint**  
**movePoint**  
Mouse canvas point means point in same Coordinate System of element position  
(Because it's used for rotating, necessery for calc the angle staff.)

**mode**  
resize mode

-   'normal'
-   'ratio'
-   'mirror'
-   'mirrorRatio'

**marker**  
resize marker, trigger from where

-   'left'
-   'right'
-   'top'
-   'bottom'
-   'leftTop'
-   'leftBottom'
-   'rightTop'
-   'rightBottom'

**Position**

Means element position of your canvas system  
(e.g. a transformed dom wrapper)

```javascript
{
    center: [0, 0],
    rotate: -45,
    size: [200, 100]
}
```

---

## ⌨️ Contribution

```shell
# git clone and cd into it
git clone https://github.com/seognil-lab/drag-resize-rotate

# npm command
npm i
npm run test:watch
```

---

## 📜 References

https://github.com/seognil-lab/vector-math-fp

---

## 🕗 TODO
