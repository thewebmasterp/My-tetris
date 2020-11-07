/*
 * Author: Zdravko Dimov (thewebmasterp / webmaster_project)
 * Country: Bulgaria
 * Descrption: This is a hard-coded file containing the shapes, their positions when flipped and color.
 * Do not think that you can add you own colors! Those are specific for the project and they have corresponsive
 * files for each of them so YOU MUST only swap them in-between, not add other colors.
 * 
 */

export default {
  line: {
    pos: {
      pos1: [
        [0, 0, 1, 0],
        [0, 0, 2, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
      pos2: [
        [0, 0, 0, 0],
        [1, 1, 2, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    },
    color: 'seablue',
  },
  L_left: {
    pos: {
      pos1: [
        [0, 1, 0],
        [0, 2, 0],
        [1, 1, 0],
      ],
      pos2: [
        [1, 0, 0],
        [1, 2, 1],
        [0, 0, 0],
      ],
      pos3: [
        [0, 1, 1],
        [0, 2, 0],
        [0, 1, 0],
      ],
      pos4: [
        [0, 0, 0],
        [1, 2, 1],
        [0, 0, 1],
      ],
    },
    color: 'blue',
  },
  L_right: {
    pos: {
      pos1: [
        [1, 1, 0],
        [0, 2, 0],
        [0, 1, 0],
      ],
      pos2: [
        [0, 0, 1],
        [1, 2, 1],
        [0, 0, 0],
      ],
      pos3: [
        [0, 1, 0],
        [0, 2, 0],
        [0, 1, 1],
      ],
      pos4: [
        [0, 0, 0],
        [1, 2, 1],
        [1, 0, 0],
      ],
    },
    color: 'orange',
  },
  z4_left: {
    pos: {
      pos1: [
        [1, 0, 0],
        [1, 2, 0],
        [0, 1, 0],
      ],
      pos2: [
        [0, 0, 0],
        [0, 2, 1],
        [1, 1, 0],
      ],
    },
    color: 'green',
  },
  z4_right: {
    pos: {
      pos1: [
        [0, 0, 1],
        [0, 2, 1],
        [0, 1, 0],
      ],
      pos2: [
        [0, 0, 0],
        [1, 2, 0],
        [0, 1, 1],
      ],
    },
    color: 'red',
  },
  t: {
    pos: {
      pos1: [
        [0, 0, 0],
        [1, 2, 1],
        [0, 1, 0],
      ],
      pos2: [
        [0, 1, 0],
        [1, 2, 0],
        [0, 1, 0],
      ],
      pos3: [
        [0, 0, 0],
        [0, 2, 0],
        [1, 1, 1],
      ],
      pos4: [
        [0, 1, 0],
        [0, 2, 1],
        [0, 1, 0],
      ],
    },
    color: 'purple',
  },
  cube: {
    pos: {
      pos1: [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ],
    },
    color: 'yellow',
  },
}
