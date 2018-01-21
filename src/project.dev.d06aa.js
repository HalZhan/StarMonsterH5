require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = "function" == typeof require && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw f.code = "MODULE_NOT_FOUND", f;
      }
      var l = n[o] = {
        exports: {}
      };
      t[o][0].call(l.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, l, l.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof require && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  Game: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0486fOqHrJN+6c5PQg5FHh9", "Game");
    "use strict";
    var Player = require("Player");
    var ScoreFX = require("ScoreFX");
    var Star = require("Star");
    var Game = cc.Class({
      extends: cc.Component,
      properties: {
        starPrefab: {
          default: null,
          type: cc.Prefab
        },
        scoreFXPrefab: {
          default: null,
          type: cc.Prefab
        },
        maxStarDuration: 0,
        minStarDuration: 0,
        ground: {
          default: null,
          type: cc.Node
        },
        player: {
          default: null,
          type: Player
        },
        scoreDisplay: {
          default: null,
          type: cc.Label
        },
        scoreAudio: {
          default: null,
          url: cc.AudioClip
        },
        btnNode: {
          default: null,
          type: cc.Node
        },
        gameOverNode: {
          default: null,
          type: cc.Node
        },
        controlHintLabel: {
          default: null,
          type: cc.Label
        },
        keyboardHint: {
          default: "",
          multiline: true
        },
        touchHint: {
          default: "",
          multiline: true
        }
      },
      onLoad: function onLoad() {
        this.groundY = this.ground.y + this.ground.height / 2;
        this.currentStar = null;
        this.currentStarX = 0;
        this.timer = 0;
        this.starDuration = 0;
        this.isRunning = false;
        var hintText = cc.sys.isMobile ? this.touchHint : this.keyboardHint;
        this.controlHintLabel.string = hintText;
        this.starPool = new cc.NodePool("Star");
        this.scorePool = new cc.NodePool("ScoreFX");
      },
      onStartGame: function onStartGame() {
        this.resetScore();
        this.isRunning = true;
        this.btnNode.setPositionX(3e3);
        this.gameOverNode.active = false;
        this.player.startMoveAt(cc.p(0, this.groundY));
        this.spawnNewStar();
      },
      spawnNewStar: function spawnNewStar() {
        var newStar = null;
        newStar = this.starPool.size() > 0 ? this.starPool.get(this) : cc.instantiate(this.starPrefab);
        this.node.addChild(newStar);
        newStar.setPosition(this.getNewStarPosition());
        newStar.getComponent("Star").init(this);
        this.startTimer();
        this.currentStar = newStar;
      },
      despawnStar: function despawnStar(star) {
        this.starPool.put(star);
        this.spawnNewStar();
      },
      startTimer: function startTimer() {
        this.starDuration = this.minStarDuration + cc.random0To1() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
      },
      getNewStarPosition: function getNewStarPosition() {
        this.currentStar || (this.currentStarX = cc.randomMinus1To1() * this.node.width / 2);
        var randX = 0;
        var randY = this.groundY + cc.random0To1() * this.player.jumpHeight + 50;
        var maxX = this.node.width / 2;
        randX = this.currentStarX >= 0 ? -cc.random0To1() * maxX : cc.random0To1() * maxX;
        this.currentStarX = randX;
        return cc.p(randX, randY);
      },
      gainScore: function gainScore(pos) {
        this.score += 1;
        this.scoreDisplay.string = "Score: " + this.score.toString();
        var fx = this.spawnScoreFX();
        this.node.addChild(fx.node);
        fx.node.setPosition(pos);
        fx.play();
        cc.audioEngine.playEffect(this.scoreAudio, false);
      },
      resetScore: function resetScore() {
        this.score = 0;
        this.scoreDisplay.string = "Score: " + this.score.toString();
      },
      spawnScoreFX: function spawnScoreFX() {
        var fx;
        if (this.scorePool.size() > 0) {
          fx = this.scorePool.get();
          return fx.getComponent("ScoreFX");
        }
        fx = cc.instantiate(this.scoreFXPrefab).getComponent("ScoreFX");
        fx.init(this);
        return fx;
      },
      despawnScoreFX: function despawnScoreFX(scoreFX) {
        this.scorePool.put(scoreFX);
      },
      update: function update(dt) {
        if (!this.isRunning) return;
        if (this.timer > this.starDuration) {
          this.gameOver();
          return;
        }
        this.timer += dt;
      },
      gameOver: function gameOver() {
        this.gameOverNode.active = true;
        this.player.enabled = false;
        this.player.stopMove();
        this.currentStar.destroy();
        this.isRunning = false;
        this.btnNode.setPositionX(0);
      }
    });
    cc._RF.pop();
  }, {
    Player: "Player",
    ScoreFX: "ScoreFX",
    Star: "Star"
  } ],
  Player: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c10bbPdGYhDWaLoKLV38bHf", "Player");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        jumpHeight: 0,
        jumpDuration: 0,
        squashDuration: 0,
        maxMoveSpeed: 0,
        accel: 0,
        jumpAudio: {
          default: null,
          url: cc.AudioClip
        }
      },
      onLoad: function onLoad() {
        this.enabled = false;
        this.accLeft = false;
        this.accRight = false;
        this.xSpeed = 0;
        this.minPosX = -this.node.parent.width / 2;
        this.maxPosX = this.node.parent.width / 2;
        this.jumpAction = this.setJumpAction();
        this.setInputControl();
      },
      setInputControl: function setInputControl() {
        var self = this;
        cc.eventManager.addListener({
          event: cc.EventListener.KEYBOARD,
          onKeyPressed: function onKeyPressed(keyCode, event) {
            switch (keyCode) {
             case cc.KEY.a:
             case cc.KEY.left:
              self.accLeft = true;
              self.accRight = false;
              break;

             case cc.KEY.d:
             case cc.KEY.right:
              self.accLeft = false;
              self.accRight = true;
            }
          },
          onKeyReleased: function onKeyReleased(keyCode, event) {
            switch (keyCode) {
             case cc.KEY.a:
             case cc.KEY.left:
              self.accLeft = false;
              break;

             case cc.KEY.d:
             case cc.KEY.right:
              self.accRight = false;
            }
          }
        }, self.node);
        cc.eventManager.addListener({
          event: cc.EventListener.TOUCH_ONE_BY_ONE,
          onTouchBegan: function onTouchBegan(touch, event) {
            var touchLoc = touch.getLocation();
            if (touchLoc.x >= cc.winSize.width / 2) {
              self.accLeft = false;
              self.accRight = true;
            } else {
              self.accLeft = true;
              self.accRight = false;
            }
            return true;
          },
          onTouchEnded: function onTouchEnded(touch, event) {
            self.accLeft = false;
            self.accRight = false;
          }
        }, self.node);
      },
      setJumpAction: function setJumpAction() {
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        var squash = cc.scaleTo(this.squashDuration, 1, .6);
        var stretch = cc.scaleTo(this.squashDuration, 1, 1.2);
        var scaleBack = cc.scaleTo(this.squashDuration, 1, 1);
        var callback = cc.callFunc(this.playJumpSound, this);
        return cc.repeatForever(cc.sequence(squash, stretch, jumpUp, scaleBack, jumpDown, callback));
      },
      playJumpSound: function playJumpSound() {
        cc.audioEngine.playEffect(this.jumpAudio, false);
      },
      getCenterPos: function getCenterPos() {
        var centerPos = cc.p(this.node.x, this.node.y + this.node.height / 2);
        return centerPos;
      },
      startMoveAt: function startMoveAt(pos) {
        this.enabled = true;
        this.xSpeed = 0;
        this.node.setPosition(pos);
        this.node.runAction(this.setJumpAction());
      },
      stopMove: function stopMove() {
        this.node.stopAllActions();
      },
      update: function update(dt) {
        this.accLeft ? this.xSpeed -= this.accel * dt : this.accRight && (this.xSpeed += this.accel * dt);
        Math.abs(this.xSpeed) > this.maxMoveSpeed && (this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed));
        this.node.x += this.xSpeed * dt;
        if (this.node.x > this.node.parent.width / 2) {
          this.node.x = this.node.parent.width / 2;
          this.xSpeed = 0;
        } else if (this.node.x < -this.node.parent.width / 2) {
          this.node.x = -this.node.parent.width / 2;
          this.xSpeed = 0;
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  ScoreAnim: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b1f9e88YHdGr7qD17shtr2w", "ScoreAnim");
    "use strict";
    cc.Class({
      extends: cc.Component,
      init: function init(scoreFX) {
        this.scoreFX = scoreFX;
      },
      hideFX: function hideFX() {
        this.scoreFX.despawn();
      }
    });
    cc._RF.pop();
  }, {} ],
  ScoreFX: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "dd18c67pr9OM5wJb/yY6Onf", "ScoreFX");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        anim: {
          default: null,
          type: cc.Animation
        }
      },
      init: function init(game) {
        this.game = game;
        this.anim.getComponent("ScoreAnim").init(this);
      },
      despawn: function despawn() {
        this.game.despawnScoreFX(this.node);
      },
      play: function play() {
        this.anim.play("score_pop");
      }
    });
    cc._RF.pop();
  }, {} ],
  Star: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "21890Xr4RBJlqTJhmXJ/f5s", "Star");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        pickRadius: 0,
        game: {
          default: null,
          serializable: false
        }
      },
      onLoad: function onLoad() {
        this.enabled = false;
      },
      init: function init(game) {
        this.game = game;
        this.enabled = true;
        this.node.opacity = 255;
      },
      reuse: function reuse(game) {
        this.init(game);
      },
      getPlayerDistance: function getPlayerDistance() {
        var playerPos = this.game.player.getCenterPos();
        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
      },
      onPicked: function onPicked() {
        var pos = this.node.getPosition();
        this.game.gainScore(pos);
        this.game.despawnStar(this.node);
      },
      update: function update(dt) {
        if (this.getPlayerDistance() < this.pickRadius) {
          this.onPicked();
          return;
        }
        var opacityRatio = 1 - this.game.timer / this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
      }
    });
    cc._RF.pop();
  }, {} ]
}, {}, [ "Game", "Player", "ScoreAnim", "ScoreFX", "Star" ]);