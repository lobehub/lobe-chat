import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { stackBlurCanvasRGB } from "./stackBlur";
var GaussianBackground = /*#__PURE__*/function () {
  function GaussianBackground(node, options) {
    _classCallCheck(this, GaussianBackground);
    _defineProperty(this, "fpsAverage", void 0);
    _defineProperty(this, "canvas", void 0);
    _defineProperty(this, "context", void 0);
    _defineProperty(this, "animationFrame", null);
    _defineProperty(this, "timestep", 0);
    _defineProperty(this, "firstCallTime", 0);
    _defineProperty(this, "lastCallTime", 0);
    _defineProperty(this, "timeElapsed", 0);
    _defineProperty(this, "fpsTotal", 0);
    _defineProperty(this, "layers", []);
    _defineProperty(this, "options", {
      blurRadius: 16,
      fpsCap: 30,
      height: 32,
      scale: 20,
      width: 64
    });
    this.canvas = node;
    this.context = this.canvas.getContext('2d');
    if (!this.context) {
      throw new Error('ERROR: Could not load canvas');
    }
    if (options) {
      this.updateOptions(options);
    }
  }
  _createClass(GaussianBackground, [{
    key: "run",
    value: function run(layers) {
      this.updateLayers(layers);
      this.firstCallTime = Date.now();
      this.lastCallTime = this.firstCallTime;
      if (this.animationFrame) window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = window.requestAnimationFrame(this.displayLoop.bind(this));
      this.play();
    }
  }, {
    key: "generateLayer",
    value: function generateLayer(_ref, index) {
      var _ref$orbs = _ref.orbs,
        orbs = _ref$orbs === void 0 ? 0 : _ref$orbs,
        _ref$radius = _ref.radius,
        radius = _ref$radius === void 0 ? 0 : _ref$radius,
        _ref$maxVelocity = _ref.maxVelocity,
        maxVelocity = _ref$maxVelocity === void 0 ? 0 : _ref$maxVelocity,
        color = _ref.color,
        splitX = _ref.splitX,
        splitY = _ref.splitY;
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      if (!context) {
        throw new Error("Failed to get 2D context for layer ".concat(index));
      }
      var layerOrbs = [];
      for (var i = 0; i < orbs; i++) {
        var orb = this.createOrb(radius, maxVelocity, splitX, splitY);
        layerOrbs.push(orb);
      }
      return {
        color: color,
        context: context,
        orbs: layerOrbs
      };
    }
  }, {
    key: "createOrb",
    value: function createOrb(radius, maxVelocity, splitX, splitY) {
      var optionsWidth = this.options.width;
      var optionsHeight = this.options.height;
      var posX = splitX ? Math.random() * (optionsWidth / splitX) : Math.random() * optionsWidth;
      var posY = splitY ? Math.random() * (optionsHeight / splitY) : Math.random() * optionsHeight;
      return {
        maxX: optionsWidth,
        maxY: optionsHeight,
        minX: 0,
        minY: 0,
        posX: posX,
        posY: posY,
        radius: radius,
        velX: (Math.random() - 0.5) * 2 * maxVelocity,
        velY: (Math.random() - 0.5) * 2 * maxVelocity
      };
    }
  }, {
    key: "displayLoop",
    value: function displayLoop() {
      // Keep going if the user wants animation
      this.animationFrame = window.requestAnimationFrame(this.displayLoop.bind(this));
      var currentTime = Date.now();
      var delta = currentTime - this.lastCallTime;

      // Ignore timesteping code if there is no animation
      if (delta > this.timestep) {
        this.lastCallTime = currentTime - delta % this.timestep;
        this.timeElapsed = this.lastCallTime - this.firstCallTime;
        this.fpsTotal++;
        this.fpsAverage = this.fpsTotal / (this.timeElapsed / 1000);
        this.drawBackground();
        this.drawBlur();
      }
    }
  }, {
    key: "drawBackground",
    value: function drawBackground() {
      for (var i = Object.keys(this.layers).length - 1; i >= 0; i--) {
        var layerContext = this.layers[i].context;
        var layerOrbs = this.layers[i].orbs;

        // Draw background
        layerContext.fillStyle = this.layers[i].color;
        layerContext.fillRect(0, 0, this.options.width, this.options.height);

        // Draw animated layer elements
        for (var x = Object.keys(layerOrbs).length - 1; x >= 0; x--) {
          // Animate the movement
          layerOrbs[x].posX += layerOrbs[x].velX;
          layerOrbs[x].posY += layerOrbs[x].velY;

          // Check if the orb has custom boundaries
          var minX = void 0;
          var maxX = void 0;
          var minY = void 0;
          var maxY = void 0;
          if (layerOrbs[x].maxX && layerOrbs[x].maxY) {
            minX = layerOrbs[x].minX;
            maxX = layerOrbs[x].maxX;
            minY = layerOrbs[x].minY;
            maxY = layerOrbs[x].maxY;
          } else {
            minX = 0;
            maxX = this.options.width;
            minY = 0;
            maxY = this.options.height;
          }

          // Collision detection and correction
          if (layerOrbs[x].posX >= maxX) {
            layerOrbs[x].posX = maxX;
            layerOrbs[x].velX = -layerOrbs[x].velX;
          } else if (layerOrbs[x].posX <= minX) {
            layerOrbs[x].posX = minX;
            layerOrbs[x].velX = -layerOrbs[x].velX;
          }
          if (layerOrbs[x].posY >= maxY) {
            layerOrbs[x].posY = maxY;
            layerOrbs[x].velY = -layerOrbs[x].velY;
          } else if (layerOrbs[x].posY <= minY) {
            layerOrbs[x].posY = minY;
            layerOrbs[x].velY = -layerOrbs[x].velY;
          }
          layerContext.save();
          layerContext.globalCompositeOperation = 'destination-out';
          layerContext.beginPath();
          layerContext.arc(layerOrbs[x].posX, layerOrbs[x].posY, layerOrbs[x].radius, 0, 2 * Math.PI, false);
          layerContext.fill();
          layerContext.restore();
        }

        // Draw the virtual canvas layer onto the main canvas
        this.context.drawImage(layerContext.canvas, 0, 0);
      }
    }
  }, {
    key: "drawBlur",
    value: function drawBlur() {
      stackBlurCanvasRGB(this.canvas, 0, 0, this.options.width, this.options.height, this.options.blurRadius);
    }
  }, {
    key: "updateLayers",
    value: function updateLayers(layers) {
      var _this = this;
      this.layers = layers.map(function (layer, index) {
        return _this.generateLayer(layer, index);
      });
    }
  }, {
    key: "updateOptions",
    value: function updateOptions(_ref2) {
      var _ref2$blurRadius = _ref2.blurRadius,
        blurRadius = _ref2$blurRadius === void 0 ? 16 : _ref2$blurRadius,
        _ref2$fpsCap = _ref2.fpsCap,
        fpsCap = _ref2$fpsCap === void 0 ? 30 : _ref2$fpsCap,
        _ref2$scale = _ref2.scale,
        scale = _ref2$scale === void 0 ? 20 : _ref2$scale;
      this.options = _objectSpread(_objectSpread({}, this.options), {}, {
        blurRadius: blurRadius,
        fpsCap: fpsCap,
        scale: scale
      });
      this.options.height = Math.round(this.canvas.clientHeight / this.options.scale);
      this.options.width = Math.round(this.canvas.clientWidth / this.options.scale);
      this.timestep = 1000 / this.options.fpsCap;
      this.context.canvas.width = this.options.width;
      this.context.canvas.height = this.options.height;
    }
  }, {
    key: "prototype",
    value: function prototype() {
      window.cancelAnimationFrame(this.animationFrame);
    }
  }, {
    key: "play",
    value: function play() {
      var _this2 = this;
      window.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = window.requestAnimationFrame(function () {
        return _this2.displayLoop();
      });
    }
  }]);
  return GaussianBackground;
}();
export default GaussianBackground;