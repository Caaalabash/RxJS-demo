## ¿

这其实是一个动态更新数字效果的简化版本, 具体效果可以参见[Odometer](http://github.hubspot.com/odometer/)

### 流程分析

1. 在输入框中输入预期的数字

2. 点击更新按钮

3. 下方的文本以 不断加一/减一 的方式抵达预期

### Util方法

当前更新到底是加一还是加一呢?

````
const positiveOrNegative = (end, curr) => {
  return end > curr ? 1 : -1
}
````

什么时候停止呢?

````
const takeUntilFunc = (end, curr) => {
  return end > curr
    ? val => val <= end
    : val => val >= end
}
````

更新节点内容

````
const updateHTML = id => val => document.getElementById(id).innerHTML = val
````

更新方式: 每隔20毫秒更新一次

````
const update = curr => end => {
  return Rx.Observable.timer(0, 20)
    .mapTo(positiveOrNegative(end, curr))
    .startWith(curr)
    .scan((acc, cur) => acc + cur)
    .takeWhile(takeUntilFunc(end, curr))
    .subscribe(v => console.log(v))
}

update(1)(10)
// 每隔20ms输出1-10
1
2
...
10
````

### switchMap

类似语义, 它起到一个切换的效果

它依然在上游产生数据的时候去调用函数参数project, 但不一样的是: 后产生的内部Observable对象优先级总是更高, 一旦产生, 就会退订之前的Observable对象

因此, 使用`switchMap`就可以实现随时切换的功能

+ 先输入数字 1000

+ 此时数字正在不断 +1

+ 再次输入数字 -1000

+ 之前的Observable被退订, 可以发现数字在不断 -1

### do

透明地执行操作或副作用, 比如打印日志
