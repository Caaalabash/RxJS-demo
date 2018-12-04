## 拖拽最佳实践

+ 核心事件: `mousedown`, `mouseup`, `mouseout`, `mousemove`

+ 操作符: `concatMap`, `merge`, `takeUntil`

+ ? :
  
  + 一次拖拽过程: mousedown --> mousemove ---> mouseout/mouseup
  
  + `concatMap`适合处理【需要顺序连接不同Observable对象中数据的操作】
  
  + 以RxJS的思维方式，不要只看到一个个独立的事件，而是要把所有相关的事件作为一个Observable对象来看待

````
const box = document.querySelector('#box');
const mouseDown$ = Rx.Observable.fromEvent(box, 'mousedown');
const mouseUp$ = Rx.Observable.fromEvent(box, 'mouseup');
const mouseOut$ = Rx.Observable.fromEvent(box, 'mouseout');
const mouseMove$ = Rx.Observable.fromEvent(box, 'mousemove');

// 将所有相关的事件作为一个Observable对象来看待
const drag$ = mouseDown$.concatMap((startEvent)=> {
  const initialLeft = box.offsetLeft;
  const initialTop = box.offsetTop;
  // mouseUp$ 与 mouseOut$ 从 drag$ 的角度看 实际是等价的
  const stop$ = mouseUp$.merge(mouseOut$);
  return mouseMove$.takeUntil(stop$).map(moveEvent => {
    return {
      x: moveEvent.x - startEvent.x + initialLeft,
      y: moveEvent.y - startEvent.y + initialTop,
    };
  });
});

// 订阅 drag$ 数据流，更改元素位置
drag$.subscribe(event => {
  box.style.left = event.x + 'px';
  box.style.top = event.y + 'px';
});
````
