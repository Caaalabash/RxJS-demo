## ?

做一个比拼手速的小玩具, 按下: 上上下下左右左右BABA, 比赛用时

## 作弊码

就是将一个`keyCode`数组转成`Observable`对象, 其实也可以单纯的使用数组, 但是为了后续"多用一个操作符", 这里就使用`from`啦

````
const konami$ = Rx.Observable.from([38, 38, 40, 40, 37, 39, 37, 39, 66, 65, 66, 65])
````

## 何时开始计时?

目前的想法是: **触发`keydown`事件的时候开始计时**

这里会遇见的问题是:

+ 用户输入可能是: adhkSDAaidoashdknkl【上上下下左右左右BABA】

也就是说: **需要一直缓存按键时间, 直到作弊码被正确输出**

````
const keydown$ = Rx.Observable.fromEvent(document, 'keydown')
  // 映射成按键时间
  .map(() => Date.now())
  // 缓存直到notifier$有输出
  .buffer(keyup$)
  // 通过一个丑陋的方式拿到按下第一个【上】的时间
  .map(x => x.slice(-12, -11)[0])
````

### buffer

只支持一个`Observable`类型的参数, 称为`notifier$`, 当`notifier$`有输出了, 便会释放这期间的缓存值

````
source$.buffer(notifier$)
````

## 比对作弊码: `notifier$`

基础代码

````
const keyup$ = Rx.Observable.fromEvent(document, 'keyup')
  .map(ev => ev.which)
  // 略
````

这里的问题是: 如何从一堆乱序输入中寻找到作弊码?

输入作弊码可能是这样的: adhkSDAaidoashdknkl【上上下下左右左右BABA】

### windowCount: 根据个数来界定区间的转化操作符

````
source$.windowCount(缓存个数, 间隔距离)
````

这样的话, 缓存方式就可以确定了!

````
// 作弊码长度为12, 每隔1个新开一个区间
.windowCount(12, 1)
````

### sequenceEqual: 判断两个`Observable`

判定两个 `Observable` 是否发射相同的数据序列，传递两个 `Observable` 给 `sequenceEqual` 操作符时，它会比较两个 `Observable` 的发射物，
如果两个序列相同(相同的数据，相同的顺序，相同的终止状态)，则发射 `true`，否则发射 `false`。

## shit

这段代码中做的最差的一点可能就是申明了一个全局变量`end`, 目前学艺不精, 不知道怎么做了

