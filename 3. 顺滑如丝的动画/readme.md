## ？

### 结合 .merge

如果想要在触摸设备上响应`mousemove`或者是`touchmove`，只需要将他们单纯的结合起来

````
// 称为a$, b$显得它们地位时等价的，而不是source$, target$
a$.merge(b$)
````

### 添加平滑运动

不做平滑运动: 只要鼠标（或手指）停止，旋转就会立即停止，为了解决这个问题，可以使用**线性插值 linear interpolation**

单纯的说，就是从A点到B点不是一下就完成，而是每次完成一小段～

````
function lerp(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  return {
    x: start.x + dx * 0.1,
    y: start.y + dy * 0.1,
  };
}
````

### 如何在RxJS中表示动画帧

使用`Rx.Observable.interval()`，可以创建一个在一定时间间隔内发出值的`Observable`

如果创建一个微小的间隔, 并将其设置为 【仅在每个动画帧上发生值】,那么就可以实现预期

````
const animationFrame$ = Rx.Observable.interval(0, Rx.Scheduler.animationFrame);
````

### withLatestFrom

这里假设你看了代码，知道了`move$`是啥

随着鼠标（手指）移动, `move$`会不断产生坐标值，但是只有在`animationFrame$`发出值后，当前最新的`move$`值才是我们需要的

这时，使用`withlatestFrom`

````
// 显然，前者是占主导的
const smoothMove$ = master$.withLatestFrom(slave$, (x, y) => {})
````

### scan 

`scan`类似于`reduce`, 在这里添加线性插值就对了

````
smoothMove$.scan(lerp)
````

这个操作符可能是RxJS中对【构建交互式应用程序最重要的一个操作符】

通常的应用中，不可避免需要维护一个状态，最简单的方法就是用一个全局变量来维护，之所以说他类似与`reduce`，就是因为他提供了一个看不见的累计值变量

不使用reduce的一个例子

````
const list = [1, 2, 3, 4, 5, 6, 7, 8, 9]

let total = 0
for (let n of list) {
  total += n
}
````

使用reduce, 就避免了一个变量

````
const list = [1, 2, 3, 4, 5, 6, 7, 8, 9]

list.reduce((acc, item) => (acc += item), 0)
````
