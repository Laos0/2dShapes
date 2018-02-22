// Import the Shape and Point objects
import Shape from './Shape'
import Point from './Point'

// Import the transformPoint function from matrix_math
import { transformPoint } from '../matrix_math'

// Import NanoGL library
// @ts-ignore
import NanoGL from 'nanogl'

/** @class A drawable 2D triangle */
class Triangle extends Shape {
  /**
   * Create a new Triangle shape object
   * @param {WebGLRenderingContext} gl The canvas element rendering context
   * @param {Point} newP1 Location of the first triangle vertex
   * @param {Point} newP2 Location of the second triangle vertex
   * @param {Point} newP3 Location of the third triangle vertex
   // @ts-ignore
   * @param {Color} color The color of this shape (default Color.WHITE)
   * @param {boolean} filled Is the shape filled or not (default true)
   */
  constructor (gl, newP1, newP2, newP3, color, filled) {
    // Call parent constructor first
    super(color, filled)

    // Increase the global triangle count
    Shape.shapeCount[Shape.SHAPE_TYPE.TRIANGLE]++

    // Update properties inherited from Shape to be specific to triangles
    this._type = Shape.SHAPE_TYPE.TRIANGLE
    this._id = Shape.shapeCount[Shape.SHAPE_TYPE.TRIANGLE]

    // New properties for this type of shape (public)
    this.P1 = newP1
    this.P2 = newP2
    this.P3 = newP3

    // Call updateBuffers() once to initialize them
    this.updateBuffers(gl)
  }

  /**
   * Compute the center of this shape
   * Averages the vertices together
   * @return {Point} The average of the three vertices
   */
  computeCentroid () {
    return new Point(
      (this.P1.x + this.P2.x + this.P3.x) / 3,
      (this.P1.y + this.P2.y + this.P3.y) / 3,
      (this.P1.z + this.P2.z + this.P3.z) / 3
    )
  }

  /**
   * Update the internal WebGL vertex buffers for this triangle
   * Stores the transformed vertices in an ArrayBuffer so they may be used
   * to draw this shape using WebGL.
   * @param {WebGLRenderingContext} gl The canvas element rendering context
   */
  updateBuffers (gl) {
    // Transform the three vertices
    let P1 = transformPoint(this.P1, this.M)
    let P2 = transformPoint(this.P2, this.M)
    let P3 = transformPoint(this.P3, this.M)

    // Pack the vertex information into a single, typed array
    // Note: Z is included even though it should always be 0
    //       This is because WebGL/OpenGL expects it
    this._positions = new Float32Array([
      P1.x, P1.y, P1.z,
      P2.x, P2.y, P2.z,
      P3.x, P3.y, P3.z
    ])

    // Make the WebGL ArayBuffer for this shape (using nanoGL)
    this.buffer = new NanoGL.ArrayBuffer(gl, this._positions)
    this.buffer.attrib('aPosition', 3, gl.FLOAT)
  }
}

// Expose the Triangle class to other modules for importing
export default Triangle
