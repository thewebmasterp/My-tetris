/*
 * Author: Zdravko Dimov (thewebmasterp / webmaster_project)
 * Country: Bulgaria
 * Descrption: In this file you will find 3 classes which all combined, form what I call
 * the engine of the game. It is responsible for all hardcore logic, calculations and rendering
 * to the svg elements provided by the user of the classes (controller.js)
 * Dependency: d3.js (imported in the html)
 * 
 */


class Pixel {
  constructor(svg, x = 0, y = 0, width = 10, height = 10, possibleColors, statut = 'regular') {
    this.svg = svg
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = 'none'
    this.initializePixel()
    this.statut = statut
    this.possibleColors = possibleColors;
  }
  initializePixel() {
    let parentId = this.svg.node().parentElement.id
    let id = `el${parentId}x${this.x}y${this.y}`.replaceAll('.', 'dot')


    if ( !d3.select(`#${id}`).empty() ) {
      d3.select(`#${id}`)
        .attr('fill', this.color==='none' ? 'none' : `url(#${this.color}bg)`)
    } else {
      this.el = this.svg.append('rect')
        .attr('x', this.x)
        .attr('y', this.y)
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('fill', this.color==='none' ? 'none' : `url(#${this.color}bg)`)
        .attr('stroke', 'black')
        .attr('stroke-width', '2')
        .attr('id', id)
    }
  }
  get fill() {
    return this.color ? this.color : 'none'
  }
  set fill(color) {
    if(!this.possibleColors.includes(color) && color !== 'none' && color !== 'white') throw 'Wrong color'
    this.color = color;
    this.initializePixel()
  }
  get cast() {
    return this.statut 
  }
  set cast(statut) {
    if (statut === 'regular' || statut === 'handle') {
      this.statut = statut
      return this
    } else {
      throw `Invalid cast! Got: ${statut} Expected: regular/handle`
    }
  } 

  set pseudoFill(color) {
    this.el.attr('fill', color)
    return this
  }
}

class Group {
  constructor(pixels, matrix, container, shape='pixel', positions) {
    //TODO: put labels on each property what is it's purpose. Not only on this class.
    this.matrix = matrix
    this.group = pixels 
    this.container = container
    this.shape = shape

    this.positions = positions
    this.activePosition = 'pos1'
    this.color = this.group[0].fill
    this.flippedCount = 0
  }

  getPixelAround(pixel, orientation) {
    let i, j, matrix = this.matrix
    for (i = 0; i < matrix.length; i++) {
      for (j = 0; j < matrix[j].length; j++) {
        if (pixel === matrix[i][j]) {
          switch(orientation) {
            case 'left':
              return matrix?.[i]?.[j-1]
            case 'right':
              return matrix?.[i]?.[j+1]
            case 'down':
              return matrix?.[i+1]?.[j]
            case 'up':
              return matrix?.[i-1]?.[j]
            default:
              throw `Wrong 'orientation' argument! Got: ${orientation} Expected: left/right/down/up`
          }
        }
      }
    }
  }

  getThan = (center, than) => {
    const centerRow = this.matrix.find(row => row.includes(center))
    const thanRow = this.matrix.find(row => row.includes(than))
    const centerCol = centerRow.indexOf(center)
    const thanCol = thanRow.indexOf(than)

    let obj = {left: false, right: false, up: false, down: false}

    if (this.matrix.indexOf(centerRow) > this.matrix.indexOf(thanRow)) {
      obj.up = true
    } else if (this.matrix.indexOf(centerRow) < this.matrix.indexOf(thanRow)) {
      obj.down = true
    }

    if (centerCol > thanCol) {
      obj.left = true
    } else if (centerCol < thanCol) {
      obj.right = true
    }

    return obj
  }

  select(p1, p2) {
    let x1, y1, x2, y2;
    this.matrix.forEach((row, i) => {
      if (row.includes(p1)) {
        x1 = i
        y2 = row.indexOf(p1)
      }
      if (row.includes(p2)) {
        x2 = i
        y1 = row.indexOf(p2)
      }
    })
    let seleciton = []
    for (x1; x1 <= x2; x1++) {
      let arr = []
      this.matrix[x1].forEach((el, i) => {
        if (i >= y2 && i <= y1) arr.push(el) 
      })
      seleciton.push(arr)
    }
    return seleciton
  }

  flip() {
    if(this.shape === 'cube') return this

    const getpx = (px, wh, times = 1) => {
      let curr = px
      let i
      for (i = 0; i < times; i++) {
        let node = this.getPixelAround(curr, wh)
        if (node === undefined) return [curr, true]
        // if (node.fill !== 'none' && !this.group.includes(node)) return [curr, true]
        curr = node
      }
      return [curr, false]
    }

    const choosePos = (currentPos, chooseFromObj) => {
      let keys = Object.keys(chooseFromObj)
      //make sure keys are sorted
      keys = keys.sort((key, prevKey) => key[key.length-1] - prevKey[prevKey.length-1])
      //access array in a circular manner by using formula arr[(i % n + n) % n]
      let i = keys.indexOf(currentPos)+1
      let n = keys.length
      return keys[(i % n + n) % n]
    }

    //figure out active position
    let pos = choosePos(this.activePosition, this.positions)
    const replaceWith = this.positions[pos]

    const iterate = (func, selection) => {
      let i, j;
      for (i = 0; i < selection.length; i++) {
        for (j = 0; j < selection[i].length; j++) {
          let curr = selection[i][j]
          let tobe = replaceWith[i][j] //not pure!
          if (func(curr, tobe) === 1) return
        }
      }
    }

    const opposites = {
      left: 'right',
      up: 'down',
      right: 'left',
      down: 'up'
    }

    let handle = this.group.find(pixel => pixel.cast === 'handle')
    let a, b

    switch(this.shape) {
      case 'line': 

        a = getpx(getpx(handle, 'left', 2)[0], 'up')
        // a[0].pseudoFill = 'gray'
        b = getpx(getpx(a[0], 'down', 3)[0], 'right', 3)
        // b[0].pseudoFill = 'yellow'
        if (b[1]) { 
          // a[0].pseudoFill = 'none'
          a = getpx(a[0], 'left')
          // a[0].pseudoFill = 'gray'
        }
        handle = getpx(getpx(a[0], 'right', 2)[0], 'down')[0] 

        break
      case 'L_left':
      case 'L_right':
      case 'z4_left':
      case 'z4_right':
      case 't':

        const directions = Object.keys(opposites)
        for (let i=0; i < directions.length; i++) {
          if (getpx(handle, directions[i])[1]) {
            this.move(opposites[directions[i]])
            if (this.flippedCount < 10) {
              this.flippedCount++
              return this.flip()
            }
          }
        }

        // this.flippedCount = 0

        a = getpx(getpx(handle, 'left')[0], 'up')
        // a[0].pseudoFill = 'yellow'
        b = getpx(getpx(handle, 'right')[0], 'down')
        // b[0].pseudoFill = 'yellow'

        break 
    }

    const selection = this.select(a[0], b[0])
    let futureGroup = [], canBeFlipped = true //TODO: get rid of this canBeFlipped

    iterate((curr, tobe) => {
      if (selection.length !== replaceWith.length) { 
        canBeFlipped = false
        return 1
      }
      if (tobe && curr.fill !== 'none' && !this.group.includes(curr)) {
        canBeFlipped = false

        //NOTE: potential weak point if view obj has more trues than one
        let view = this.getThan(handle, curr)
        view = Object.entries(view).find(prop => prop[1])[0]

        if (this.flippedCount < 10) {
          this.move(opposites[view])
          this.flippedCount++
          this.flip()
        }
        return 1
      }
    }, selection)
    this.flippedCount = 0

    if (canBeFlipped) { 
      //flip it
      iterate((curr, tobe) => {
        if (this.group.includes(curr) ) curr.fill = 'none'
        if (tobe) {
          curr.fill = this.color
          curr.cast = 'regular' 
          if (tobe === 2) {
            curr.cast = 'handle' 
          }
          futureGroup.push(curr)
        }
      }, selection)
      this.activePosition = pos
      this.group = futureGroup
    }
    return this
  }

  move(where) {
    const getpx = (px, wh) => this.getPixelAround(px, wh)

    //make sure that the element position won't exceed the container offset 
    const cont = this.container.node().getBoundingClientRect()
    const left = this.group.every(item => +item.el.attr('x') > 2) || where !== 'left'
    const right = this.group.every(item => +item.el.attr('x') < cont.width - item.el.node().getBoundingClientRect().width-2) || where !== 'right'
    const up = this.group.every(item => +item.el.attr('y') > 2) || where !== 'up'
    const down = this.group.every(item => +item.el.attr('y') < cont.height - item.el.node().getBoundingClientRect().height-2) || where !== 'down'

    //make sure that the element position won't get into the position of another element
    let finalCheck = false
    if (left && right && up && down) {
      const checker = (kk) => {
        const otherPixel = this.group.filter(px => {
          const otherPixel = getpx(px, kk)
          if (!otherPixel) return false
          return !this.group.includes(otherPixel)
        })
        return otherPixel.every(px => getpx(px, kk).fill === 'none') || where !== kk
      }
      finalCheck = [checker('left'), checker('right'), checker('down'), checker('up')].every(val => val)
    }

    //move if moving is legal
    if (finalCheck) {
      const newGroup = []
      const castes = []

      // let fill = 'none' //TODO: get rid of this nasty shit and use this.color and fix castes too.
      for (let i = 0; i < this.group.length; i++) {
        castes.push( this.group[i].cast )
        // fill = this.group[i].fill
        let toBePushed = getpx(this.group[i], where)
        newGroup.push(toBePushed)
        this.group[i].fill = 'none'
        this.group[i].cast = 'regular'
      }
      this.group = newGroup
      for (let i = 0; i < this.group.length; i++) {
        this.group[i].cast = castes[i]
        // this.group[i].fill = fill
        this.group[i].fill = this.color
      }
    } else { 
      if (where === 'down') {
        return 'bottom hit'
      }
    }
    return this
  }
}

/* export */ class Playground {
  constructor(container, screen, ratios, screenRatios, shapes, gameOver, score) {
    this.container = container
    this.screen = screen
    this.ratios = ratios
    this.screenRatios = screenRatios
    this.grid = []
    this.screenGrid = []
    this.possibleColors = Object.entries(shapes).map(shape => shape[1].color)
    this.initializeGameplay()
    this.shapes = shapes
    this.spawnZoneCoordinates = [[0, 3], [3, 6]]//[this.grid[0][3], this.grid[3][6]]
    this.state = {
      screenNotEmpty: false,
    }
    this.shapesArr = []
    this.gameOver = gameOver
    this.score = score
  }

  initializeGameplay() {
    this.container.innerHTML = ''
    this.screen.innerHTML = ''

    const gameplayWidth = this.container.node().getBoundingClientRect().width
    const gameplayHeight = this.container.node().getBoundingClientRect().height
    const pixelWidth = gameplayWidth / this.ratios[0]
    const pixelHeight = gameplayHeight / this.ratios[1]


    //create one img for each color
    for (let color of this.possibleColors) {
      this.container.append('defs')
      .append('pattern')
        .attr('width', pixelWidth)
        .attr('height', pixelHeight)
        .attr('id', `${color}bg`)
      .append('image')
        .attr('height', pixelHeight)
        .attr('width', pixelWidth)
        .attr('href', `https://cdn.jsdelivr.net/npm/play-tetris-game@latest/pixels/${color}.png`)
    }

    let i, j
    for(i = 0; i < this.ratios[1]; i++) {
      const row = []
      for (j = 0; j < this.ratios[0]; j++) {
        let x = pixelWidth * j
        let y = pixelHeight * i
        row.push( new Pixel(this.container, x, y, pixelWidth, pixelHeight, this.possibleColors) )
      }
      this.grid.push(row)
    }

    let borderWidth = parseFloat(this.screen.style('border-width'))
    this.screen.attr('width', this.screenRatios[1] * pixelWidth + borderWidth * 2)
    this.screen.attr('height', this.screenRatios[0] * pixelHeight + borderWidth * 2)

    for(i = 0; i < this.screenRatios[1]; i++) {
      const row = []
      for (j = 0; j < this.screenRatios[0]; j++) {
        let x = pixelWidth * j
        let y = pixelHeight * i
        row.push( new Pixel(this.screen, x, y, pixelWidth, pixelHeight, this.possibleColors) )
      }
      this.screenGrid.push(row)
    }
  }

  clearFullRows() {
    let rows = this.grid
    rows = rows.map(row => row.every(px => px.fill !== 'none')) 
    
    //clear full rows
    let i, j;
    for (i = 0; i < this.grid.length; i++) { 
      if (rows[i]) {

        for (j = 0; j < this.grid[i].length; j++) {
          this.grid[i][j].fill = 'none'
          this.grid[i][j].cast = 'regular'
        }
        //trigger an external function which handles score increase
        this.score()
      }
    }

    while(rows.some(bool => bool)) {
      let startIndex = rows.lastIndexOf(true)
      for (let i = startIndex; i > 1; i--) {
        for (let j = 0; j < this.grid[i].length; j++) {
          this.grid[i][j].fill = this.grid[i-1][j].fill
        }
      }
      rows[startIndex] = false
    }

    return this
  }

  shift(shape = 'line') {
    this.clearFullRows()
    this.shapesArr.push(shape)
    let addedToGameplayPx = []
    const func = () => {
      //spawn shape from the datastructure to screen
      let i, j
      for (i = 0; i < this.screenGrid.length; i++) {
        for (j = 0; j < this.screenGrid[i].length; j++) {
          this.screenGrid[i][j].fill = 'none'
          if (this.shapes[shape].pos['pos1'][i]) { //added for 3x3 shape support
            if (this.shapes[shape].pos['pos1'][i][j] === 1) {
              this.screenGrid[i][j].fill = this.shapes[shape].color
              this.screenGrid[i][j].cast = 'regular'
            } else if (this.shapes[shape].pos['pos1'][i][j] === 2) {
              this.screenGrid[i][j].fill = this.shapes[shape].color
              this.screenGrid[i][j].cast = 'handle'
            }
          }
        }
      }
    }
    if (this.state.screenNotEmpty) {
      //get the shape from screen and render to display
      let pos = this.spawnZoneCoordinates
      let i, j
      for (i=0; i < this.grid.length; i++) {
        if (i >= pos[0][0] && i <= pos[0][1]) {
          for (j=0; j < this.grid[i].length; j++) {
            if (j >= pos[1][0] && j <= pos[1][1]) {
              let x = i - pos[0][0]
              let y = j - pos[1][0]
              if (this.grid[i][j].fill !== 'none') this.gameOver(this)
              this.grid[i][j].fill = this.screenGrid[x][y].fill
              this.grid[i][j].cast = this.screenGrid[x][y].cast
              if (this.screenGrid[x][y].fill !== 'none') {
                addedToGameplayPx.push(this.grid[i][j])
              }
            } else continue 
          }
        } else continue
      }
      func()
      let shape = this.shapesArr[this.shapesArr.length-2]
      return new Group(addedToGameplayPx, this.grid, this.container, shape, this.shapes[shape].pos)
    } else {
      //screen is empty.
      //just spawn the shape to the screen
      func()
      this.state.screenNotEmpty = true
      return 'initial'
    }
  }

}

//USING THE CLASSES (EXAMPLES - might not be accurate, a lot of playing and just logging stuff. Take it as a draft < )

//import shapes from './shapes.js'

// const svg1 = d3.select('#playground svg')
// const svg2 = d3.select('#screen svg')
// const gameplayDimension = [10*1.5, 14*1.5]
// const screenDimension = [4, 4]
// const tetris = new Playground(
//   svg1, 
//   svg2, 
//   gameplayDimension, 
//   screenDimension,
//   shapes
//   )

//   // tetris.shift('line', 'green')
//   // tetris.shift('cube', 'purple')
//   // // .moveDown()
//   // // .moveDown()
//   // tetris.shift('L_left', 'skyblue')
//   // .move('left')
//   // .move('left')

//   const get_random = (list) => {
//     return list[Math.floor((Math.random()*list.length))];
//   } 
  


//   //keyboard handlers
//   let lastShape
//   document.addEventListener('keydown', e => {
//     if (e.code === 'ShiftLeft'|| e.code === 'ShiftRight') {
//       const shape = get_random(['line', 'cube', 'L_left', 'L_right', 'z4_left', 'z4_right', 't'])
//       const color = get_random(['green', 'blue', 'purple'])
//       lastShape = tetris.shift(get_random(['line', 'line', 'cube']), color)
//     } else if (e.code === 'ArrowLeft'|| e.code === 'KeyA') {
//       lastShape.move('left')
//     } else if (e.code === 'ArrowRight'|| e.code === 'KeyD') {
//       lastShape.move('right')
//     } else if (e.code === 'ArrowDown'|| e.code === 'KeyS') { 
//       lastShape.move('down')
//     } else if (e.code === 'ArrowUp'|| e.code === 'KeyW') {
//       lastShape.move('up')
//     } else if (e.code === 'Space') {
//       lastShape.flip()
//     } else if (e.code === 'Enter') {
//       tetris.clearFullRows()
//     } else {
//       console.log(e.code)
//     }
//   })
  

