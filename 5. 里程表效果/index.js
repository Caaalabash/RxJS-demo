const input = document.getElementById('range')
const updateButton = document.getElementById('update')
const displayEl = 'display'

// 加一还是减一呢?
const positiveOrNegative = (endRange, currentNumber) => {
  return endRange > currentNumber ? 1 : -1
}

// 啥时候停止呢?
const takeUntilFunc = (endRange, currentNumber) => {
  return endRange > currentNumber
    ? val => val <= endRange
    : val => val >= endRange
}

// 更新节点内容
const updateHTML = id => val => document.getElementById(id).innerHTML = val

// 具体的更新逻辑
const update$ = curr => end => {
  return Rx.Observable.timer(0, 20)
    .mapTo(positiveOrNegative(end, curr))
    .startWith(curr)
    .scan((acc, cur) => acc + cur)
    .takeWhile(takeUntilFunc(end, curr))
}

// 冲冲冲
const subscription = (function(curr) {
  return Rx.Observable
    .fromEvent(updateButton, 'click')
    // 此处不能替换为mapTo
    .map(_ => parseInt(input.value))
    // 实现随时切换的效果
    .switchMap(end => update$(curr)(end))
    // 更新当前curr值
    .do(v => curr = v)
    .startWith(curr)
    .subscribe(updateHTML(displayEl));
}(0))
