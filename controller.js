/*
 * Author: Zdravko Dimov (thewebmasterp / webmaster_project)
 * Country: Bulgaria
 * Descrption: This file is the user of engine.js (the engine). It utilizes all the
 * class defined there and feeds them with the canvas upon which the engine will render
 * all the complex position of cubes (svg + d3.js), making it all dynamic and responsive.
 * 
 * This is also the file I encourage tweaking and playing with, even if you can't code!
 * Try chaing the values of the constants at the beginning of the file and the ones I am sure
 * you'll have most fun with are: [DESCEND_WITH, INITIAL_SPEED, GRID_CELL_SIZE]
 * 
 */


// import shapes from './internals/shapes.js'
// import {Playground} from './internals/engine.js'

//CONSTANTS:

  //fundamental
  const PLAYGROUND = d3.select('#playground svg')
  const SCREEN_NEXT_BLOCK = d3.select('#screen svg')
  const GRID_CELL_SIZE = 1.5 //How many cells do you wanna have on the grid. Tweak it and see the difference!
  const GAME_OVER_DELAY = 1300
  const BLINK_DELAY = 100 
  const INITIAL_SPEED = 500 //Initial speed of the falling cubes
  const DESCEND_WITH = 10 //Greater values make the cubes fall faster.

  //keys
  const MOVE_LEFT = ['ArrowLeft', 'KeyA']
  const MOVE_RIGHT = ['ArrowRight', 'KeyD']
  const MOVE_DOWN = ['ArrowDown', 'KeyS']
  const FLIP = ['Enter', 'Space']

  //dom nodes
  const MOVE_LEFT_BTN = document.querySelector("#left")
  const MOVE_RIGHT_BTN = document.querySelector("#right")
  const MOVE_DOWN_BTN = document.querySelector("#down")
  const FLIP_BTN = document.querySelector("#flip")
  const OVERLAY = document.getElementById('overlay')
  const GAME_OVER = document.getElementById('gameOver')
  const SCORE_NOW = [...document.getElementsByClassName('scoreNow')]

  //other
  const SHAPE_TO_COLOR_OBJ = {}
  for (let shape in shapes) SHAPE_TO_COLOR_OBJ[shape] = shapes[shape].color

//PROGRAM STATE:
  let gameGoing = true 
  let restartAllowed = false
  let currScore = 0
  let currSpeed = INITIAL_SPEED

//PURE FUNCTIONS:
  const get_random = (list) => {
    return list[Math.floor((Math.random()*list.length))]
  }

//HANDLER FUNCTIONS (and supporting the handlers):

  const fall = () => {
    if (gameGoing) moveDownHandler(true)
  }

  let finished = true
  const blinkEl = el => {
    if (finished) {
      finished = false
      const prevBg = window.getComputedStyle(el).backgroundColor
      el.style.backgroundColor = 'gray'
      setTimeout(() => {
        el.style.backgroundColor = prevBg
        finished = true
      }, BLINK_DELAY)
    }
  }

  const moveDownHandler = (fromInterval) => {
    let a = lastShape.move('down')
    if (a === 'bottom hit') {
      const nextShape = get_random(Object.keys(SHAPE_TO_COLOR_OBJ))
      lastShape = tetris.shift(nextShape)
    }
    if (!fromInterval) blinkEl(MOVE_DOWN_BTN)
  }

  const moveLeftHandler = () => {
    lastShape.move('left')
    blinkEl(MOVE_LEFT_BTN)
  }

  const moveRightHandler = () => {
    lastShape.move('right')
    blinkEl(MOVE_RIGHT_BTN)
  }

  const flipHandler = () => {
    lastShape.flip()
    blinkEl(FLIP_BTN)
  }

  /* ATTENTION! */
  //The scores are still not sure whether they work or not, since they
  //require me to look at them a couple of days and see if the trackers
  //work properly

  //Of course I could find a way to test it on the moment but I am
  //too lazy to do this and write long classes, so I will just take a look
  //ever day in the next 2-3 days to see if there're potential bugs I could
  //fix. Thanks for the understanding! Good game)
  const manageScore = (scoreNow) => {
    // const formatDate = (day = new Date()) => {
    //   return `${day.getDate()}/${day.getMonth()}/${day.getYear()}`
    // }
    // let scores = localStorage.getItem('scoresTetrisGame')
    // if (scores) {
    //   scores = JSON.parse(scores)
    // } else {
    //   let obj = {'now': [scoreNow], 'today': [scoreNow, new Date()], 'ever': [scoreNow]}
    //   localStorage.setItem('scoresTetrisGame', JSON.stringify(obj))
    // }
    // if (scoreNow > parseFloat(scores.today)) {
    //   let now = formatDate()
    //   if (now !== scores.today[1]) {
    //     // scores.today = [scoreNow, now]
    //   }
    // }
    // if (scoreNow > parseFloat(scores.ever)) {
      // scores.ever = scoreNow
    // }
    // localStorage.setItem('scoresTetrisGame', JSON.stringify(scores))

    // document.getElementById('today').innerHTML = scores.today[0]
    // document.getElementById('ever').innerHTML = scores.ever
  }

  const raiseFromTheDust = (self) => {
    OVERLAY.className = 'invisible'
    scoreIncreaseHandler(0)
    self.grid.forEach(row =>
      row.forEach(el => {
        el.fill = 'none'
        el.cast = 'regular'
      })
    )
    initial_shape2 = get_random(Object.keys(SHAPE_TO_COLOR_OBJ))
    lastShape = tetris.shift(initial_shape2, SHAPE_TO_COLOR_OBJ[initial_shape2])
    restartAllowed = false
    gameGoing = true
  }

  const gameOverHandler = (self) => {
    OVERLAY.className = 'visible'
    gameGoing = false
    setTimeout(() => {
      OVERLAY.addEventListener('click', () => {
        raiseFromTheDust(self)
      })
      setTimeout(() => restartAllowed = true, 200) 
      GAME_OVER.style.display = 'block'
    }, GAME_OVER_DELAY)
    currSpeed = INITIAL_SPEED
  }

  const scoreIncreaseHandler = (val) => {
    currScore++
    if (typeof val === 'number') {
      currScore = val
      if (val === 0) currSpeed = INITIAL_SPEED
    }
    SCORE_NOW.forEach(el => el.innerHTML = currScore)
    if (val === undefined) {
      clearInterval(gravity)
      currSpeed -= DESCEND_WITH
      console.log(`speed updated: ${currSpeed}`)
      gravity = setInterval(fall, currSpeed)
    }
    manageScore(currScore)
  }

//FIRE:

  const tetris = new Playground(
    PLAYGROUND, 
    SCREEN_NEXT_BLOCK, 
    [10*GRID_CELL_SIZE, 14*GRID_CELL_SIZE], 
    [4, 4],
    shapes,
    gameOverHandler,
    scoreIncreaseHandler,
    )

  manageScore(currScore) //initialize score

  let initial_shape = 'line'//get_random(Object.keys(SHAPE_TO_COLOR_OBJ))
  tetris.shift(initial_shape, SHAPE_TO_COLOR_OBJ[initial_shape])

  let initial_shape2 = 'line'//get_random(Object.keys(SHAPE_TO_COLOR_OBJ))
  let lastShape = tetris.shift(initial_shape2, SHAPE_TO_COLOR_OBJ[initial_shape2])

  document.addEventListener('keydown', e => {
    e.preventDefault()
    const btn = e.code
    if (gameGoing) {
      if (MOVE_LEFT.includes(btn)) moveLeftHandler()
      else if (MOVE_RIGHT.includes(btn)) moveRightHandler()
      else if (MOVE_DOWN.includes(btn)) moveDownHandler()
      else if (FLIP.includes(btn)) flipHandler()
      else console.log(btn)
    } else if (!gameGoing) {
      if (restartAllowed) {
        let allDefinedKeys = MOVE_LEFT.concat(MOVE_RIGHT).concat(MOVE_DOWN).concat(FLIP)
        if (!allDefinedKeys.includes(btn)) raiseFromTheDust(tetris)
      }
    }
  })

  MOVE_LEFT_BTN.addEventListener('click', (e) => {
    e.preventDefault()
    if (gameGoing) moveLeftHandler()
  })
  MOVE_RIGHT_BTN.addEventListener('click', (e) => {
    e.preventDefault()
    if (gameGoing) moveRightHandler()
  })
  MOVE_DOWN_BTN.addEventListener('click', (e) => {
    e.preventDefault()
    if (gameGoing) moveDownHandler()
  })
  FLIP_BTN.addEventListener('click', (e) => {
    e.preventDefault()
    if (gameGoing) flipHandler()
  })

  let gravity = setInterval(fall, currSpeed)

  window.addEventListener('resize', () => { 
    window.location.reload()
  })



  //Fun fact: the whole file is written without a single semi-colon.

