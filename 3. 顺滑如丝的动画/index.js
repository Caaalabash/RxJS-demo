const docElm = document.documentElement
const cardElm = document.querySelector('#card')
const titleElm = document.querySelector('#title')

/**
 * @name version1
 * @desc 鼠标移动时获取到位置坐标
 */
// const mouseMove$ = Rx.Observable.fromEvent(docElm, 'mousemove')
//
// mouseMove$.subscribe(event => {
//   titleElm.innerHTML = `${event.clientX}, ${event.clientY}`
// })

/**
 * @name version2
 * @desc 鼠标移动式让图片跟随旋转
 * @desc 通过merge合并操作符, 让touchmove & movemove 结合起来~
 */
// const { clientWidth, clientHeight } = docElm
// const mouseMove$ = Rx.Observable
//   .fromEvent(docElm, 'mousemove')
//   .map(e => ({
//     x: e.clientX,
//     y: e.clientY
//   }))
// const touchMove$ = Rx.Observable
//   .fromEvent(docElm, 'touchmove')
//   .map(event => ({
//     x: event.touches[0].clientX,
//     y: event.touches[0].clientY
//   }));
// const move$ = Rx.Observable.merge(mouseMove$, touchMove$)
//
// move$.subscribe(pos => {
//   const rotX = (pos.y / clientHeight * -50) + 25
//   const rotY = (pos.x / clientWidth * 50) -25
//
//   cardElm.style.cssText = `transform: rotateX(${rotX}deg) rotateY(${rotY}deg);`
// })


/**
 * @name version3
 * @desc 顺滑一点～
 */
function lerp(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  // 每次触发只移动10%
  return {
    x: start.x + dx * 0.1,
    y: start.y + dy * 0.1,
  };
}
const { clientWidth, clientHeight } = docElm
const mouseMove$ = Rx.Observable
  .fromEvent(docElm, 'mousemove')
  .map(e => ({
    x: e.clientX,
    y: e.clientY
  }))
const touchMove$ = Rx.Observable
  .fromEvent(docElm, 'touchmove')
  .map(event => ({
    x: event.touches[0].clientX,
    y: event.touches[0].clientY
  }));
const move$ = Rx.Observable.merge(mouseMove$, touchMove$)
const animationFrame$ = Rx.Observable.interval(0, Rx.Scheduler.animationFrame)
const smoothMove$ = animationFrame$
  .withLatestFrom(move$, (frame, move) => move)
  .scan((current, next) => lerp(current, next))

smoothMove$.subscribe(pos => {
  const rotX = (pos.y / clientHeight * -50) + 25;
  const rotY = (pos.x / clientWidth * 50) - 25;

  cardElm.style.cssText = `
    transform: rotateX(${rotX}deg) rotateY(${rotY}deg);
  `;
})
