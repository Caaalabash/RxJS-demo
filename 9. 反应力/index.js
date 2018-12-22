const startEl = document.getElementById('start')
const endEl = document.getElementById('end')

const clickStart$ = Rx.Observable.fromEvent(startEl, 'click')
const clickDone$ = Rx.Observable.fromEvent(endEl, 'click')

// 根据当前时间设置背景颜色
function getColor(timestamp) {
  const date = new Date(timestamp)
  return '#' + [
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  ].map(time => time < 10 ? `0${time}` : time).join('')
}

// 开始按钮点击事件流
const start$ = clickStart$
// 取最新的一次点击，抛弃之前的点击
  .switchMap(() => Rx.Observable.timer(Math.random() * 7777))
  .map(() => Date.now())
  // 设置背景颜色 & 禁止点击开始按钮
  .do(time => {
    document.body.style.background = getColor(time)
    startEl.classList.add('no-click')
  })

const end$ = clickDone$
  .map(() => Date.now())
  // 重置背景颜色
  .do(() => {
    document.body.style.background = `#fff`
    startEl.classList.remove('no-click')
  })

start$
  .concatMap(startTime => {
    return end$.map(endTime => (endTime - startTime) / 1000).take(1)
  })
  .subscribe(gap => {
    alert(`你的反应时间为${gap}秒`)
  })
// todo: 如何检测作弊行为
