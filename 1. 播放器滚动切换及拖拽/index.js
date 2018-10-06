const anchor = document.getElementById('anchor')
const video = document.getElementById('video')


const scroll$ = Rx.Observable.fromEvent(document, 'scroll')
const mouseDown$ = Rx.Observable.fromEvent(video, 'mousedown')
const mouseMove$ = Rx.Observable.fromEvent(document, 'mousemove')
const mouseUp$ = Rx.Observable.fromEvent(document, 'mouseup')

// 判断取值范围
const validValue = (value, max, min) => {
  return Math.min(Math.max(value, min), max)
}

scroll$
  .map(e => anchor.getBoundingClientRect().bottom < 0)
  .subscribe(bool => {
    bool ? video.classList.add('video-fixed') : video.classList.remove('video-fixed')
  })

mouseDown$
// 如果处于fixed状态才执行后续
  .filter(e => video.classList.contains('video-fixed'))
  //
  .map(e => mouseMove$.takeUntil(mouseUp$))
  .concatAll()
  // 与mousedown组合执行
  .withLatestFrom(mouseDown$, (move, down) => {
    return {
      x: validValue(move.clientX - down.offsetX, window.innerWidth - 320, 0),
      y: validValue( move.clientY - down.offsetY, window.innerHeight - 160, 0)
    }
  })
  .subscribe(pos => {
    video.style.top = pos.y + 'px'
    video.style.left = pos.x + 'px'
  })