const dragStart$ = Rx.Observable.fromEvent(document, 'dragstart')
const drop$ = Rx.Observable.fromEvent(document, 'drop')

const dragOver$ = Rx.Observable.fromEvent(document, 'dragover')
const dragEnter$ = Rx.Observable.fromEvent(document, 'dragenter')
const dragLeave$ = Rx.Observable.fromEvent(document, 'dragleave')


// 能否释放: 是容器 & 容器为空
function canDrop(e) {
  return e.target.classList.contains('cell') && !e.target.children.length
}
//

// dragEnter dragLeave 时切换容器的背景色
dragEnter$
  .merge(dragLeave$)
  // 检查是否是容器
  .filter(canDrop)
  // 切换背景色
  .do(e => e.target.classList.toggle('dragover'))
  .subscribe()

// 可释放的
dragOver$
  .filter(canDrop)
  .do(e => e.preventDefault())
  .subscribe()

dragStart$
  .do(ev => ev.dropEffect = "move")
  .pluck('target')
  .switchMap(origin => {
    return drop$
      .take(1)
      .pluck('target')
      .do(target => {
        origin.parentNode.classList.remove('dragover')
        origin.parentNode.removeChild(origin)
        target.appendChild(origin)
    })
}).subscribe()

