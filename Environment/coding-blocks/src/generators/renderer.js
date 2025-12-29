import * as Blockly from "blockly/core";

class CustomConstantProvider extends Blockly.blockRendering.ConstantProvider {
  constructor() {
    // Set up all of the constants from the base provider.
    super();
    this.width = 8;
    this.height = this.width * 1.5;
  }
  makeRectangularPreviousConn() {
    const width = 20;
    const height = 10;

    /**
     * Since previous and next connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the horizontal direction of the path (-1 or 1)
     * @returns SVGPath line for use with previous and next connections.
     */
    function makeMainPath(dir) {
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(0, height),
        Blockly.utils.svgPaths.point(dir * width, 0),
        Blockly.utils.svgPaths.point(0, -height),
      ]);
    }
    const pathLeft = makeMainPath(1);
    const pathRight = makeMainPath(-1);

    return {
      width: width,
      height: height,
      pathLeft: pathLeft,
      pathRight: pathRight,
    };
  }
  makeRectangularInputConn() {
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;

    /**
     * Since input and output connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the vertical direction of the path (-1 or 1)
     * @returns SVGPath line for use with input and output connections.
     */
    function makeMainPath(dir) {
      return (
        Blockly.utils.svgPaths.line([
          Blockly.utils.svgPaths.point(-width, 0),
          Blockly.utils.svgPaths.point(0, (-dir * height) / 3),
        ]) +
        Blockly.utils.svgPaths.arc(
          "a",
          `0 0 ${dir == 1 ? 1 : 0}`,
          height / 6, //0 = counterclockwise
          Blockly.utils.svgPaths.point(0, (-dir * height) / 3)
        ) +
        Blockly.utils.svgPaths.line([
          Blockly.utils.svgPaths.point(0, (-dir * height) / 3),
          Blockly.utils.svgPaths.point(width, 0),
        ])
      );
    }
    const pathUp = makeMainPath(1);
    const pathDown = makeMainPath(-1);

    return {
      width: width,
      height: height,
      pathUp: pathUp,
      pathDown: pathDown,
    };
  }
  makeSimpleRoundedRectangle() {
    const width = this.width;
    const height = this.height;
    /**
     * Since input and output connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the vertical direction of the path (-1 or 1)
     * @returns SVGPath line for use with input and output connections.
     */
    function makeMainPath(dir) {
      // dir is typically +1 or -1, indicating downward or upward.
      // width and height are assumed to be available in this scope.
      // radius is the corner rounding radius.
      const radius = height / 3;

      // Each call returns a small piece of SVG path syntax.
      // Join them with spaces to form one continuous path.
      return (
        Blockly.utils.svgPaths.line([
          Blockly.utils.svgPaths.point(-width + radius, 0),
        ]) +
        Blockly.utils.svgPaths.arc(
          "a",
          `0 0 ${dir == 1 ? 1 : 0}`,
          radius, //0 = counterclockwise
          Blockly.utils.svgPaths.point(-radius, -dir * radius)
        ) +
        Blockly.utils.svgPaths.line([
          Blockly.utils.svgPaths.point(0, -dir * (height - 2 * radius)),
        ]) +
        Blockly.utils.svgPaths.arc(
          "a",
          `0 0 ${dir == 1 ? 1 : 0}`,
          radius, //0 = counterclockwise
          Blockly.utils.svgPaths.point(radius, -dir * radius)
        ) +
        Blockly.utils.svgPaths.line([
          Blockly.utils.svgPaths.point(width - radius, 0),
        ])
      );
    }
    const pathUp = makeMainPath(1); //Path from up to down
    const pathDown = makeMainPath(-1); //Path from down to up

    return {
      width: width,
      height: height,
      pathUp: pathUp,
      pathDown: pathDown,
    };
  }
  makeZigZag() {
    //2 pairs of zig-zags
    const width = this.width;
    const height = this.height;
    /**
     * Since input and output connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the vertical direction of the path (-1 or 1)
     * @returns SVGPath line for use with input and output connections.
     */
    function makeMainPath(dir) {
      // dir is typically +1 or -1, indicating downward or upward.
      // width and height are assumed to be available in this scope.
      // radius is the corner rounding radius.

      // Each call returns a small piece of SVG path syntax.
      // Join them with spaces to form one continuous path.
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(0, (-height * dir) / 4),
        Blockly.utils.svgPaths.point(width / 2, (-height * dir) / 4),
        Blockly.utils.svgPaths.point(-width / 2, (-height * dir) / 4),
        Blockly.utils.svgPaths.point(0, (-height * dir) / 4),
        Blockly.utils.svgPaths.point(width, 0),
      ]);
    }
    const pathUp = makeMainPath(1); //Path from up to down
    const pathDown = makeMainPath(-1); //Path from down to up

    return {
      width: width,
      height: height,
      pathUp: pathUp,
      pathDown: pathDown,
    };
  }
  makeCard() {
    //2 pairs of zig-zags
    const width = this.width;
    const height = this.height;
    /**
     * Since input and output connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the vertical direction of the path (-1 or 1)
     * @returns SVGPath line for use with input and output connections.
     */
    function makeMainPath(dir) {
      // dir is typically +1 or -1, indicating downward or upward.
      // width and height are assumed to be available in this scope.
      // radius is the corner rounding radius.

      // Each call returns a small piece of SVG path syntax.
      // Join them with spaces to form one continuous path.
      return (
        Blockly.utils.svgPaths.line([
          Blockly.utils.svgPaths.point(-width, 0),
          Blockly.utils.svgPaths.point(0, (-dir * height) / 3),
          Blockly.utils.svgPaths.point(width / 6, 0),
        ]) +
        Blockly.utils.svgPaths.arc(
          "a",
          `0 0 ${dir == 1 ? 1 : 0}`,
          height / 4, //0 = counterclockwise
          Blockly.utils.svgPaths.point(height / 4, (dir * height) / 4)
        ) +
        Blockly.utils.svgPaths.line([
          Blockly.utils.svgPaths.point(
            0,
            (-2 * dir * height) / 4 - (dir * height) / 3
          ),
        ]) +
        Blockly.utils.svgPaths.arc(
          "a",
          `0 0 ${dir == 1 ? 1 : 0}`,
          height / 4, //0 = counterclockwise
          Blockly.utils.svgPaths.point(-height / 4, (dir * height) / 4)
        ) +
        Blockly.utils.svgPaths.line([
          Blockly.utils.svgPaths.point(-width / 6, 0),
          Blockly.utils.svgPaths.point(0, (-dir * height) / 3),
          Blockly.utils.svgPaths.point(width, 0),
        ])
      );
    }
    const pathUp = makeMainPath(1); //Path from up to down
    const pathDown = makeMainPath(-1); //Path from down to up

    return {
      width: width,
      height: height,
      pathUp: pathUp,
      pathDown: pathDown,
    };
  }
  makeTarantula() {
    const width = this.width;
    const height = this.height;
    /**
     * Since input and output connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the vertical direction of the path (-1 or 1)
     * @returns SVGPath line for use with input and output connections.
     */
    function makeMainPath(dir) {
      // dir is typically +1 or -1, indicating downward or upward.
      // width and height are assumed to be available in this scope.
      // radius is the corner rounding radius.

      // Each call returns a small piece of SVG path syntax.
      // Join them with spaces to form one continuous path.
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-width / 3, 0),
        Blockly.utils.svgPaths.point(-width / 3, (-dir * height) / 4),
        Blockly.utils.svgPaths.point(-width / 3, (dir * height) / 4),
        Blockly.utils.svgPaths.point(0, -dir * height),
        Blockly.utils.svgPaths.point(width / 3, (dir * height) / 4),
        Blockly.utils.svgPaths.point(width / 3, (-dir * height) / 4),
        Blockly.utils.svgPaths.point(width / 3, 0),
      ]);
    }
    const pathUp = makeMainPath(1); //Path from up to down
    const pathDown = makeMainPath(-1); //Path from down to up

    return {
      width: width,
      height: height,
      pathUp: pathUp,
      pathDown: pathDown,
    };
  }
  makeWildcard() {
    const width = this.width;
    const height = this.height;
    /**
     * Since input and output connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the vertical direction of the path (-1 or 1)
     * @returns SVGPath line for use with input and output connections.
     */
    function makeMainPath(dir) {
      // dir is typically +1 or -1, indicating downward or upward.
      // width and height are assumed to be available in this scope.
      // radius is the corner rounding radius.

      // Each call returns a small piece of SVG path syntax.
      // Join them with spaces to form one continuous path.
      return Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(-width, 0),
        Blockly.utils.svgPaths.point(0, -dir * height),
        Blockly.utils.svgPaths.point(width, 0),
      ]);
    }
    const pathUp = makeMainPath(1); //Path from up to down
    const pathDown = makeMainPath(-1); //Path from down to up

    return {
      width: width,
      height: height,
      pathUp: pathUp,
      pathDown: pathDown,
    };
  }
  shapeFor(connection) {
    var checks = connection.getCheck();
    switch (connection.type) {
      case Blockly.INPUT_VALUE:
      case Blockly.OUTPUT_VALUE:
        // Extract base type from checks
        if (checks) {
          const baseChecks = checks.map((type) => type.split("::")[0]);

          if (baseChecks.includes("ADDRESS")) {
            return this.ROUNDED_RECTANGLE;
          }
          if (baseChecks.includes("STRING")) {
            return this.ZIGZAG;
          }
          if (baseChecks.includes("NUMBER")) {
            return this.CARD;
          }
          if (baseChecks.includes("BOOL")) {
            return this.TARANTULA;
          }
        }
        if (!checks || checks.map((type) => type.split("::")[0].includes("ANY"))) {
          return this.WILDCARD;
        }
        return this.PUZZLE_TAB;

      case Blockly.PREVIOUS_STATEMENT:
      case Blockly.NEXT_STATEMENT:
        return this.NOTCH;

      default:
        throw Error("Unknown connection type");
    }
  }
  init() {
    // First, call init() in the base provider to store the default objects.
    super.init();

    // Add calls to create shape objects for the new connection shapes.
    this.RECT_PREV_NEXT = this.makeRectangularPreviousConn();
    this.RECT_INPUT_OUTPUT = this.makeRectangularInputConn();
    this.ROUNDED_RECTANGLE = this.makeSimpleRoundedRectangle();
    this.ZIGZAG = this.makeZigZag();
    this.WILDCARD = this.makeWildcard();
    this.CARD = this.makeCard();
    this.TARANTULA = this.makeTarantula();
  }
}
class CustomRenderer extends Blockly.thrasos.Renderer {
  constructor() {
    super();
  }
  makeConstants_() {
    return new CustomConstantProvider();
  }
}

Blockly.blockRendering.register("SmartBlocks", CustomRenderer);
