/* globals __DEV__ */

// Import bootstrap's contents for webpack (not used below)
// These lines simply ensure that bootstrap is placed in the bundle files
// that are generated by webpack so we don't have to link them separately
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

// Import jQuery as the usual '$' variable
import $ from 'jquery'

// Import the NanoGL & JavaScript stats libraries
// @ts-ignore
import NanoGL from 'nanogl'
import Stats from 'stats.js'

// Import our own Shape and Interface objects
import Shape from './objects/Shape'
import Interface from './interface'

// Import functions from matrix_math and utils
import { orthoMatrix } from './matrix_math'
import { getWebGLContext, resizeCanvasToDisplaySize } from './utils'

// Global variables shared by many of the functions below
// NOTE: These are only accessible in this one file!!
let gl = null // WebGL rendering context
let shader = null // Compiled shader program
let scene = null // Array of shapes in the scene
let projM = null // The projection matrix (2d, orthographic)
let stats = null // Stats.js object for fps display

/**
 * Function to run when page is fully loaded
 */
$(document).ready(() => {
  // Handle a lost webgl context
  let canvas = document.getElementById('c')
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault()
  }, false)

  // Respond when our webgl context gets restored
  canvas.addEventListener('webglcontextrestored', initializeWebGL, false)

  // Optionally setup stats.js
  if (__DEV__) {
    stats = new Stats()
    stats.showPanel(0)
    document.body.appendChild(stats.dom)
  }

  // Setup initial webgl context
  initializeWebGL()

  // Setup the GUI event system (must be called once when the document is ready)
  // Note: Imported from interface.js
  Interface.initialize()
})

/**
 * Initialize WebGL for use later in the code. This runs when the document
 * is ready or whenever the WebGL context is restored after being lost.
 */
function initializeWebGL () {
  // Get a WebGL rendering context for the Canvas element
  gl = getWebGLContext($('#c')[0], {
    preserveDrawingBuffer: true,
    antialias: true,
    depth: false
  })

  // Set the clear color to black and opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  // Create a new shader program and compile and bind our shaders
  shader = new NanoGL.Program(gl, $('#vs').text(), $('#fs').text())
  shader.bind()

  // Allocate/Clear the scene array object
  scene = []

  // Pass references to the rendering context and scene into
  // the Interface object (it will need them later)
  Interface.gl = gl
  Interface.scene = scene

  // Start / Restart the rendering loop
  requestAnimationFrame(checkRender)
}

/**
 * Check if the window/display size has changed and
 * resize the canvas accordingly.
 */
function resizeCanvas () {
  // Check window size and resize canvas if needed
  if (resizeCanvasToDisplaySize(gl.canvas)) {
    // Canvas was resized so update the viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    if (__DEV__) {
      // Print the two resolutions to the console to help debugging
      console.info('Canvas: ' + gl.canvas.width + ' x ' + gl.canvas.height)
      console.info('Buffer: ' + gl.drawingBufferWidth + ' x ' + gl.drawingBufferHeight)
    }

    // Update the projeciton matrix to account for the new canvas dimensions
    projM = orthoMatrix(0, gl.canvas.height - 1, 0, gl.canvas.width - 1)

    // Indicate that the viewport & canvas were resized
    return true
  }

  // Indicate that the viewport & canvas were NOT resized
  return false
}

/**
 * Check if the canvas needs a resize or the interface has requested a scene update
 * and render the scene if needed. This function is called continuously as part of
 * the rendering loop.
 */
function checkRender (time) {
  if (stats) { stats.begin() }

  // Does canvas need a resize? or is an updated needed?
  if (resizeCanvas() || Interface.updateRequested) {
    // If so reset the update request and render the scene
    Interface.updateRequested = false
    renderScene(time)
  }

  if (stats) { stats.end() }

  // Repeat infinitely at a reasonable framerate
  requestAnimationFrame(checkRender)
}

/**
 * Draw all the shapes in the scene array
 */
function renderScene (time) {
  // Clear the screen to black (colors only)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // Use the pre-compiled shader
  shader.use()

  // Call renderShape for each shape
  scene.forEach(renderShape)
}

/**
 * Draw a single shape using WebGL
 */
function renderShape (shape, index) {
  // Pass this shape's properties into the shader
  shape.color.passToShader(shader)
  shader.uProjection(projM)

  // Bind the position attribute to this shape's vertex buffer
  shape.buffer.attribPointer(shader)

  // Draw the shape (or rather, its vertex buffer)
  if (!shape.filled && shape.type !== Shape.SHAPE_TYPE.LINE) {
    // Shape outlines (except lines) are always drawn as a 'line loop'
    shape.buffer.drawLineLoop()
  } else {
    // Draw filled shapes
    switch (shape.type) {
      // Filled circles are drawn as 'triangle fans'
      case Shape.SHAPE_TYPE.CIRCLE:
        shape.buffer.drawTriangleFan()
        break

      // Lines are alwasy drawn as 'lines' (duh)
      case Shape.SHAPE_TYPE.LINE:
        shape.buffer.drawLines()
        break

      // Filled triangles are drawn as 'triangles' (also duh)
      case Shape.SHAPE_TYPE.TRIANGLE:
        shape.buffer.drawTriangles()
        break
    }
  }
}
