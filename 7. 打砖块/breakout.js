const stage = document.getElementById('stage')
const ctx = stage.getContext('2d')
ctx.fillStyle = 'green';
const PADDLE_WIDTH  = 100
const PADDLE_HEIGHT = 20
const PADDLE_SPEED = 240
const BALL_RADIUS = 10
const BALL_SPEED = 60
const BRICK_ROWS = 5
const BRICK_COLUMNS = 7
const BRICK_HEIGHT = 20
const BRICK_GAP = 3
const TICKER_INTERVAL = Math.ceil(1000 / 60)
const PADDLE_CONTROLS = {
  'ArrowLeft': -1,
  'ArrowRight': 1,
}

// 渲染游戏画面
function updateView([ticker, paddle, state]) {
  ctx.clearRect(0, 0, stage.width, stage.height);

  drawPaddle(paddle);
  drawBall(state.ball);
  drawBricks(state.bricks);
  drawScore(state.score);

  if (state.ball.position.y > stage.height - BALL_RADIUS) {
    drawGameOver('GAME OVER');
    restart.error('game over');
  }

  if (state.bricks.length === 0) {
    drawGameOver('Congratulations!');
    restart.error('cong');
  }
}

// 创建砖块的初始状态
function createBricks() {
  let width = (stage.width - (BRICK_GAP + 1) * BRICK_COLUMNS) / BRICK_COLUMNS
  let bricks = []
  for (let i = 0; i < BRICK_ROWS; i++) {
    for (let j = 0; j < BRICK_COLUMNS; j++) {
      bricks.push({
        x: j * (width + BRICK_GAP) + width / 2 + BRICK_GAP,
        y: i * (BRICK_HEIGHT + BRICK_GAP) + BRICK_HEIGHT /2 + BRICK_GAP + 20,
        width: width,
        height: BRICK_HEIGHT
      })
    }
  }
  return bricks
}

// 判断碰撞
function isHit(paddle, ball) {
  return ball.position.x > paddle - PADDLE_WIDTH / 2
    && ball.position.x < paddle + PADDLE_WIDTH / 2
    && ball.position.y > stage.height - PADDLE_HEIGHT - BALL_RADIUS / 2
}

function isCollision(brick, ball) {
  return ball.position.x + ball.direction.x > brick.x - brick.width / 2
    && ball.position.x + ball.direction.x < brick.x + brick.width / 2
    && ball.position.y + ball.direction.y > brick.y - brick.height / 2
    && ball.position.y + ball.direction.y < brick.y + brick.height / 2
}

// 绘制游戏开始提示
function drawIntro() {
  ctx.clearRect(0, 0, stage.width, stage.height)
  ctx.textAlign = 'center'
  ctx.font = '24px Courier New'
  ctx.fillText('Press [<] and [>]', stage.width / 2, stage.height / 2)
}

// 绘制游戏结束提示: 死亡/通关
function drawGameOver(text) {
  ctx.clearRect(stage.width / 4, stage.height / 3, stage.width / 2, stage.height / 3)
  ctx.textAlign = 'center'
  ctx.font = '24px Courier New'
  ctx.fillText(text, stage.width / 2, stage.height / 2)
}

// 绘制分数
function drawScore(score) {
  ctx.textAlign = 'left'
  ctx.font = '16px Courier New'
  ctx.fillText(score, BRICK_GAP, 16)
}

// 绘制球拍
function drawPaddle(position) {
  ctx.beginPath()
  ctx.rect(
    position - PADDLE_WIDTH / 2,
    ctx.canvas.height - PADDLE_HEIGHT,
    PADDLE_WIDTH,
    PADDLE_HEIGHT
  )
  ctx.fill()
  ctx.closePath()
}

// 绘制球
function drawBall(ball) {
  ctx.beginPath()
  ctx.arc(ball.position.x, ball.position.y, BALL_RADIUS, 0, Math.PI * 2)
  ctx.fill()
  ctx.closePath()
}

// 绘制砖块
function drawBrick(brick) {
  ctx.beginPath()
  ctx.rect(
    brick.x - brick.width / 2,
    brick.y - brick.height / 2,
    brick.width,
    brick.height,
  )
  ctx.fill()
  ctx.closePath()
}
function drawBricks(bricks) {
  bricks.forEach(drawBrick)
}


// 驱动游戏进度的一个因素: 时间
// 用户不做任何操作,游戏中的物体也会移动
const ticker$ = Rx.Observable
  // interval 的默认scheduler是async,并不是最佳的协调动画渲染的scheduler
  .interval(TICKER_INTERVAL, Rx.Scheduler.requestAnimationFrame)
  // deltaTime 为两帧之间的时间差
  .map(() => ({
    time: Date.now(),
    deltaTime: null
  }))
  .scan(
    (previous, current) => ({
      time: current.time,
      deltaTime: (current.time - previous.time) / 1000
    })
  )

// 键盘输入流
const key$ = Rx.Observable
  .merge(
    Rx.Observable.fromEvent(document, 'keydown').map(e => (PADDLE_CONTROLS[e.key] || 0)),
    Rx.Observable.fromEvent(document, 'keyup').mapTo(0)
  )
  // 理想情况下, keydown事件keyup事件交替出现,此处为了保险
  .distinctUntilChanged()

// 球拍位置的数据流
// 并不直接定义一个Observable对象,而是创建一个返回Observable对象的函数
// 这是考虑到游戏可以重复开始, 每次重新开始, 都应该产生一个新的球拍对象, 这样游戏不受之前状态的影响
// 而key$ ticker$则不必如此, 无论游戏重复多少次, 这两个对象都是可以重用的
const createPaddle$ = ticker$ => ticker$
  // 对于此游戏,ticker$是主导的, key$只需要贡献数据
  .withLatestFrom(key$)
  .scan((position, [ticker, direction]) => {
    console.log(ticker)
    const nextPosition = position + direction * ticker.deltaTime * PADDLE_SPEED
    // 球拍位置限制
    return Math.max(
      Math.min(nextPosition, stage.width - PADDLE_WIDTH / 2),
      PADDLE_WIDTH / 2
    )
  }, stage.width / 2)
  .distinctUntilChanged()

// 游戏的界面应该只是数据的一种呈现
const initState = () => ({
  ball: {
    position: {
      x: stage.width / 2,
      y: stage.height / 2,
    },
    direction: {
      x: 2,
      y: 2
    }
  },
  bricks: createBricks(),
  score: 0,
})

// 创建游戏状态数据流
// 在游戏过程中, 这个状态会被ticker$驱动从而不停改变
const createState$ = (ticker$, paddle$) => {
  return ticker$
    .withLatestFrom(paddle$)
    .scan(({ball, bricks, score}, [ticker, paddle]) => {
      let remainingBricks = []
      const collisions = {
        paddle: false,
        floor: false,
        wall: false,
        ceiling: false,
        brick: false,
      }
      // 根据deltaTime来计算球的位置
      ball.position.x = ball.position.x + ball.direction.x * ticker.deltaTime * BALL_SPEED
      ball.position.y = ball.position.y + ball.direction.y * ticker.deltaTime * BALL_SPEED
      // 对于每一个砖块, 判断是否被球击中
      bricks.forEach(brick => {
        if (!isCollision(brick, ball)) {
          remainingBricks.push(brick)
        } else {
          collisions.brick = true
          score = score + 10
        }
      })
      // 判断球拍是否接触
      collisions.paddle = isHit(paddle, ball)
      // 判断球和墙体是否接触
      if (ball.position.x < BALL_RADIUS || ball.position.x > stage.width - BALL_RADIUS) {
        ball.direction.x = -ball.direction.x
        collisions.wall = true
      }
      collisions.ceiling = ball.position.y < BALL_RADIUS;
      // 当弹珠和任意一个物体接触都会改变y方向
      if (collisions.brick || collisions.paddle || collisions.ceiling ) {
        ball.direction.y = -ball.direction.y;
      }
      // 返回游戏结果
      return {
        ball: ball,
        bricks: remainingBricks,
        collisions: collisions,
        score: score
      }
    }, initState())
}

let restart

const game$ = Rx.Observable.create(observer => {
  drawIntro()

  restart = new Rx.Subject()

  const paddle$ = createPaddle$(ticker$)
  const state$ = createState$(ticker$, paddle$)

  ticker$.withLatestFrom(paddle$, state$)
    .merge(restart)
    .subscribe(observer)
})

game$.retryWhen(err$ => {
  return err$.delay(1000)
}).subscribe(updateView)
