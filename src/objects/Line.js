// Import the Shape and Point objects
import Shape from './Shape'
import Point from './Point'


// TODO: Import the transformPoint function from matrix_math
// .. go out one folder
import matrix_math from '../matrix_math'
//       This is needed inside the updateBuffers() function

// Import NanoGL library
// @ts-ignore
import NanoGL from 'nanogl'

/** @class A drawable 2D line */
class Line extends Shape {
  /**
   * Create a new Line shape object
   * @param {WebGLRenderingContext} gl The canvas element rendering context
   * @param {Point} newP1 Location of the first endpoint of the line
   * @param {Point} newP2 Location of the second endpoint of the line
   // @ts-ignore
   * @param {Color} color The color of this shape (default Color.WHITE)
   * @param {boolean} filled Is the shape filled or not (default true)
   */
  constructor (gl, newP1, newP2, color, filled) {
    // Call parent constructor first
    super(color, filled)

    // Increase the global line count
    Shape.shapeCount[Shape.SHAPE_TYPE.LINE]++

    // Update properties inherited from Shape to be specific to lines
    this._type = Shape.SHAPE_TYPE.LINE
    this._id = Shape.shapeCount[Shape.SHAPE_TYPE.LINE]

    // New properties for this type of shape (public)
    this.P1 = newP1
    this.P2 = newP2

    // Call updateBuffers() once to initialize them
    this.updateBuffers(gl)
  }

  /**
   * Compute the center of this shape
   * Computes and returns a reasonable value for the center of the line
   * @return {Point} The center of the line
   */
  computeCentroid () {
// DONE -------------------------------------------------------------------------------------------
    // TODO: Complete this function so it computes a reasonable value
    //       for the center of the line, then return tha value.

    // formula for center of 2d line, x and y
    let x = (this.P1.x + this.P2.x)/2;
    let y = (this.P1.y + this.P2.y)/2;
    let centerPoint = new Point(x,y);
    
    // NOTE: This line is temporary, remove it once you are done.
    return centerPoint;
  }

  /**
   * Update the internal WebGL vertex buffers for this line
   * Stores the transformed endpoints in an ArrayBuffer so they may be used
   * to draw this shape using WebGL.
   * @param {WebGLRenderingContext} gl The canvas element rendering context
   */
  updateBuffers (gl) {
  // DONE ------------------------- IF this.P1 and this.M is correct or not -----------------------------------------
    // TODO: Transform the endpoints of the line by the matrix this.M
    //       and store the result to new variables.  The endpoints are
    //       stored as this.P1 and this.P2.
    let endPoint1 = matrix_math.transformPoint(this.P1,this.M);
    let endPoint2 = matrix_math.transformPoint(this.P2,this.M);

    // TODO: Pack the transformed endpoints into a Float32Array and store
    //       it in this._positions.
    //
    // Here are some tips:
    //   - Float32Array is a special array object built into JavaScript
    //   - You create a new one by saying 'new Float32Array()'
    //   - Pass a normal JavaScript array with your values to the constructor
    //   - The array should contain the raw components of the endpoints
    //     in order as a single, one-dimensional array
    //   - Be sure to also include a value for the Z-axis even though
    //     we are in 2D, just to make WebGL happy.
    this._positions = new Float32Array([endPoint1,endPoint2,1]);

    // Make the WebGL ArayBuffer for this shape (using nanoGL)
    this.buffer = new NanoGL.ArrayBuffer(gl, this._positions)
    this.buffer.attrib('aPosition', 3, gl.FLOAT)
  }
}

// Expose the Line class to other modules for importing
export default Line
