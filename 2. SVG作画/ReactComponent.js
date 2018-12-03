class Component extends React.Component {
  constructor() {
    super();

    this.state = {
      points: [/* "M 0 0", "L 20 20", "L 50 100" */]
    };
  }
  render() {
    return (
      <div id='container'>
        <div id='content'>
          <svg ref={(canvas) => {this.canvas = canvas }}
               width="500"
               height="500"
               viewBox="0 0 500 500"
               xmlns="http://www.w3.org/2000/svg"
               version="1.1"
          >
            <path d={this.state.points}/>
          </svg>
          <div id='label'>
            [Click to draw, double click to reset]
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    // 转化是数据流的映射逻辑
    const mouseEventToCoordinate = event => event.offsetX+" "+event.offsetY;
    // 创建数据流
    // fromEvent(事件源, 事件名称) Rxjs 与 DOM 之间的桥梁
    let mouseDown$ = Rx.Observable.fromEvent(this.canvas, "mousedown").map(mouseEventToCoordinate);
    let mouseMove$ = Rx.Observable.fromEvent(this.canvas, "mousemove");
    let mouseUp$ = Rx.Observable.fromEvent(this.canvas, "mouseup");
    let mouseLeave$ = Rx.Observable.fromEvent(this.canvas, "mouseleave");
    let mouseDbClick$ = Rx.Observable.fromEvent(this.canvas, "dblclick");
    // 转化数据流
    // source$.concatMap(project) 最适合处理拖拽操作
    // 拖拽操作: 由mouseDown$触发 -----不断触发mouseMove$-----> mouseUp$/mouseLeave$事件触发停止
    let mouseDrag$ = mouseDown$
      .concatMap(
        // 合并数据流: Merge
        // fromEvent可以从网页中获取事件, 只可惜, fromEvent一次只能从一个Dom元素中获取一个类型的事件,
        // 如果我们同时关心一个元素的click事件和touchend事件,就可以使用merge了
        () => mouseMove$.takeUntil(mouseUp$.merge(mouseLeave$)).map(mouseEventToCoordinate)
      );

    mouseDown$.forEach(drag => {
      this.setState({points: [...this.state.points, "M " + drag]});
    });
    mouseDrag$.forEach(drag => {
      this.setState({points: [...this.state.points, "L " + drag]});
    });
    // 重置
    mouseDbClick$.forEach(() => {
      this.setState({points: []});
    });
  }
}

ReactDOM.render(
  <Component />,
  document.getElementById('app')
);