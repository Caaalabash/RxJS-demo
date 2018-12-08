const data = [
  {
    color: '#E91E63',
  },
  {
    color: '#448AFF',
  },
  {
    color: '#AFB42B',
  },
  {
    color: '#4CAF50',
  },
  {
    color: '#7B1FA2',
  },
  {
    color: '#FF5722',
  },
  {
    color: '#009688',
  }
];
const START_INDEX = 3;
const TRANSITION_TIME = 300;
const LEFT_ARROW_KEYCODE = 37
const RIGHT_ARROW_KEYCODE = 39

class Slider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sliderIndex: START_INDEX,
    }
  }

  componentDidMount() {
    // 点击按钮的Observable对象, 无论上游产生什么数据，传给下游的都是同样的数据
    const prevBtnClick$ = Rx.Observable.fromEvent(this.refs['prev-slider'], 'click').mapTo(-1);
    const nextBtnClick$ = Rx.Observable.fromEvent(this.refs['next-slider'], 'click').mapTo(1);
    // 类似处理键盘的 <- & -> 按键
    const keyDown$ = Rx.Observable.fromEvent(window, 'keydown')
      .map(event => event.which)
      .filter(code => code === RIGHT_ARROW_KEYCODE || code === LEFT_ARROW_KEYCODE)
      .map(code => code === LEFT_ARROW_KEYCODE ? -1 : 1)
    // 处理鼠标的滚轮事件
    const mouseWheelChange$ = Rx.Observable.fromEvent(window, 'mousewheel')
       // 通常每次滚动event.wheelDelta的值都是 120/-120
      .map( event => event.wheelDelta / 120 > 0 ? -1 : 1)

    // 合体
    const trigger$ = Rx.Observable.merge(mouseWheelChange$, prevBtnClick$, nextBtnClick$, keyDown$)
      // 节流 基于时间控制流量
      .throttleTime(TRANSITION_TIME)
      // 设置初始值
      .startWith(START_INDEX)
      // 同reduce, 获得修改的值
      .scan( (prev, current) => {
        let next = prev + current;
        if ( next >= 0 && next < data.length ) {
          return next;
        } else {
          return prev;
        }
      }, 0)
      // 只有当前值与最后一个值不同时才将其发出
      .distinctUntilChanged()

    trigger$.subscribe(
      sliderIndex => this.setState({sliderIndex})
    );
  }

  render() {

    const transition = this.state.sliderIndex * -100;
    const style = {
      width: ( data.length * 100 ) + 'vw',
      transitionDuration: TRANSITION_TIME + 'ms',
      transform: `translateX(${transition}vw)`,
    }

    const slides = data.map((item, index) => (
      <div className="slider__item" style={{background: item.color}}>{index}</div>));

    return (
      <div className="slider">
        <div className="slider__wrapper" style={style}>
          {slides}
        </div>
        <button className="slider__btn slider__btn--prev" ref="prev-slider"> prev </button>
        <button className="slider__btn slider__btn--next" ref="next-slider"> next </button>
      </div>
  );
  }
}

const slider = <Slider />

window.onload = () => {
  ReactDOM.render(slider, document.getElementById('app'));
};
