const Rx = require('rxjs')
const socket = require('socket.io-client/dist/socket.io.js')()

const ROW_COUNT = 10
const COLUMN_COUNT = 4
const EMIT_DATA = 'edit'
const table = document.getElementById('main_table')
const selectionEL = document.getElementById('selection')
const inputEL = document.getElementById('cell_input')
const board = document.getElementById('board')
// 绘制单元格
function renderTable([rowCount, columnCount]) {
  const frag = document.createDocumentFragment()

  for (let i = 0; i < rowCount; i++) {
    const rowIndex = i + 1
    const tr = document.createElement('tr')
    tr.id = `row-${rowIndex}`
    for (let j = 0; j < columnCount; j++) {
      const columnIndex = j + 1
      const td = document.createElement('td')
      td.id = `cell-${rowIndex}-${columnIndex}`
      td.setAttribute('data-row', rowIndex)
      td.setAttribute('data-column', columnIndex)
      td.setAttribute('tabindex', '0')
      td.appendChild(document.createElement('span'))
      tr.appendChild(td)
    }
    frag.appendChild(tr)
  }

  table.innerHTML = ''
  table.appendChild(frag)
}
// 是否在单元格上触发事件
function isItself(e) {
  return e.target.nodeName === 'TD'
}
// 获取选中元素的横纵坐标
function getPosition(el) {
  return {
    row: parseInt(el.getAttribute('data-row')),
    column: parseInt(el.getAttribute('data-column'))
  }
}
// 比较两个元素的横纵坐标是否相等
function isPositionEqual(posA, posB) {
  return posA.row === posB.row && posA.column === posB.column
}
// 绘制选中区域
function renderSelection(range) {
  // 我觉得这个有点秀
  const { startRow, startColumn, endRow, endColumn } = range
  const { top, left } = document.getElementById(`cell-${startRow}-${startColumn}`).getBoundingClientRect()
  const { bottom, right } = document.getElementById(`cell-${endRow}-${endColumn}`).getBoundingClientRect()
  selectionEL.style.cssText = `
    top: ${top - 2}px;
    left: ${left - 2}px;
    height: ${bottom - top + 3}px;
    width: ${right - left + 3}px;
  `
}
// 绘制输入框
function renderInput(e) {
  const text = e.target.querySelector('span').textContent
  e.target.querySelector('span').textContent = ''
  e.target.appendChild(inputEL)
  inputEL.style.removeProperty('display')
  inputEL.value = text
  inputEL.focus()
}
// 通过socket向server传递输出
function emit(data) {
  socket.emit(EMIT_DATA, data)
  inputEL.style.display = 'none'
  updateCellContent(data)
}
// 设置内容
function updateCellContent(data) {
  document.getElementById(`cell-${data.row}-${data.column}`).querySelector('span').innerText = data.value
}


const mousedown$ = Rx.Observable.fromEvent(table, 'mousedown').filter(isItself)
const mousemove$ = Rx.Observable.fromEvent(table, 'mousemove').filter(isItself)
const mouseup$ = Rx.Observable.fromEvent(table, 'mouseup')
const click$ = Rx.Observable.fromEvent(table, 'click').filter(isItself)
const keydown$ = Rx.Observable.fromEvent(table, 'keydown').filter(isItself)
const change$ = Rx.Observable.fromEvent(inputEL, 'blur')
const dataSync$ = Rx.Observable.fromEvent(socket, 'sync');
const uidChange$ = Rx.Observable.fromEvent(socket, 'uid');

// 绘制单元格
const table$ = Rx.Observable.of([ROW_COUNT, COLUMN_COUNT]).subscribe(renderTable)

// 选中区域
const select$ = mousedown$
  .concatMap(startEvent => {
    return mousemove$
      // 首先发出最开始的点击事件
      .startWith(startEvent)
      .takeUntil(mouseup$)
      // 获取每个值的坐标
      .map(endEvent => getPosition(endEvent.target))
      // 过滤坐标相同的值
      .distinctUntilChanged((last, cur) => isPositionEqual(last, cur))
      // 比对前后两个值，得到范围
      .scan((acc, pos) => {
        // 如果是第一个值
        if (!acc) {
          return {
            startRow: pos.row,
            endRow: pos.row,
            startColumn: pos.column,
            endColumn: pos.column
          }
        } else {
          return {
            ...acc,
            ...{ endRow: pos.row, endColumn: pos.column }
          }
        }
      }, null)
  })
  // 确保start < end
  .map(range => {
    return {
      startRow: Math.min(range.startRow, range.endRow),
      startColumn: Math.min(range.startColumn, range.endColumn),
      endRow: Math.max(range.startRow, range.endRow),
      endColumn: Math.max(range.startColumn, range.endColumn),
    }
  })
  .subscribe(renderSelection)

// 单元格编辑
const edit$ = click$
  .bufferCount(2, 1)
  .filter(([e1, e2]) => e1.target.id === e2.target.id)
  .map(([e]) => e)
  .merge(keydown$)
  .subscribe(renderInput)

// 输入框失去焦点传递数据
const cellChange$ = change$
  .filter(e => e.target.parentNode !== document.body)
  // 取得失去焦点元素的父单元格坐标以及当前值
  .map(e => {
    return {
      ...getPosition(e.target.parentNode),
      value: e.target.value
    }
  })
  .subscribe(emit)

// 监听uid事件
uidChange$.subscribe(uid => {
  board.textContent = `当前${uid}名用户正在编辑`
})

// 监听sync事件
dataSync$.subscribe(cell => {
  updateCellContent(cell)
})
