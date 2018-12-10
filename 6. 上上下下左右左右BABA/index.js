// 作弊码: 上上下下左右左右BABA
const konami$ = Rx.Observable.from([38, 38, 40, 40, 37, 39, 37, 39, 66, 65, 66, 65])

const keyup$ = Rx.Observable.fromEvent(document, 'keyup')
  .map(ev => ev.which)
  // 缓存方式, 产生高阶Observable对象
  .windowCount(12, 1)
  // 将高阶Observable对象拍平
  .mergeMap(x => x.sequenceEqual(konami$))
  .filter(x => x)
  .map(() => Date.now())

const keydown$ = Rx.Observable.fromEvent(document, 'keydown')
  .map(() => Date.now())
  .buffer(keyup$)
  .map(x => x.slice(-12, -11)[0])

// shit
let end = ''

keyup$.subscribe(endTime => end = endTime)

keydown$.subscribe(startTime => {
  alert(`用时${(end - startTime)/1000}s`)
})