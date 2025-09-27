import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const STYLE_TAG_ID = 'phaser-rts-react-styles';

const styles = `
.phaser-rts-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at 20% 20%, rgba(35, 86, 122, 0.35), transparent 55%),
              radial-gradient(circle at 80% 0%, rgba(53, 120, 192, 0.25), transparent 60%),
              linear-gradient(135deg, #07121f 0%, #122c44 100%);
  font-family: 'Arial', sans-serif;
  overflow: hidden;
}

.phaser-rts-wrapper canvas {
  display: block;
  background: rgba(8, 20, 30, 0.95);
  border: 2px solid rgba(109, 203, 255, 0.25);
  border-radius: 10px;
  box-shadow: 0 25px 60px rgba(0, 12, 24, 0.45), 0 0 30px rgba(89, 181, 255, 0.12);
}

.phaser-rts-wrapper .ui-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(10, 18, 30, 0.85);
  color: white;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(109, 203, 255, 0.35);
  backdrop-filter: blur(10px);
  min-width: 200px;
  box-shadow: 0 18px 35px rgba(0, 10, 22, 0.55), inset 0 0 20px rgba(74, 144, 226, 0.05);
}

.phaser-rts-wrapper .ui-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #6bc1ff;
  text-align: center;
  letter-spacing: 0.5px;
}

.phaser-rts-wrapper .ui-info {
  font-size: 12px;
  margin: 5px 0;
  color: #b8c6d9;
  letter-spacing: 0.25px;
}

.phaser-rts-wrapper .ui-controls {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(74, 144, 226, 0.35);
}

.phaser-rts-wrapper .ui-controls h4 {
  margin: 0 0 8px 0;
  color: #4a90e2;
  font-size: 14px;
}

.phaser-rts-wrapper .ui-controls p {
  margin: 3px 0;
  font-size: 11px;
  color: rgba(211, 225, 240, 0.7);
  letter-spacing: 0.2px;
}

.phaser-rts-wrapper .selection-counter {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(10, 18, 30, 0.85);
  color: #6bc1ff;
  padding: 10px 15px;
  border-radius: 20px;
  border: 1px solid rgba(109, 203, 255, 0.35);
  font-weight: bold;
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 35px rgba(0, 10, 22, 0.45), inset 0 0 20px rgba(74, 144, 226, 0.08);
}
`;

const usePhaserStyles = () => {
  useEffect(() => {
    if (!document.getElementById(STYLE_TAG_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_TAG_ID;
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(STYLE_TAG_ID);
      if (style && !document.querySelectorAll(`#${STYLE_TAG_ID}`).length) {
        style.remove();
      }
    };
  }, []);
};

const PhaserRTSGame = () => {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  usePhaserStyles();

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    class Unit extends Phaser.GameObjects.Sprite {
      constructor(scene, x, y) {
        super(scene, x, y, 'player_run', 'run_S_000.png');
        scene.add.existing(this);
        this.setInteractive();
        this.setScale(0.8);

        scene.physics.world.enable(this);

        this.radius = 12;
        this.body.setCircle(this.radius);
        const offsetX = (this.width / 2) - this.radius;
        const offsetY = (this.height / 2) - this.radius;
        this.body.setOffset(offsetX, offsetY);
        this.body.setImmovable(true);

        this.selectionCircle = scene.add.circle(0, 0, this.radius * 1.05, 0x00ff88, 0.32);
        this.selectionCircle.setVisible(false);
        this.selectionCircle.setFillStyle(0x00ff88, 0.22);
        this.selectionCircle.setStrokeStyle(2, 0x0ff0fc, 0.8);
        this.selectionCircle.setBlendMode(Phaser.BlendModes.ADD);
        this.selectionCircle.setDepth(-1);

        this.shadow = scene.add.ellipse(this.x, this.y + 10, this.radius * 2.4, this.radius * 1.12, 0x000000, 0.35);
        this.shadow.setAngle(4);
        this.shadow.setBlendMode(Phaser.BlendModes.MULTIPLY);

        this.idleGlow = scene.add.graphics({ depth: this.depth - 2 });
        this.idleGlow.setAlpha(0);

        this.moveSpeed = 80;
        this.separationForce = 0.5;
        this.targetPos = null;
        this.path = null;
        this.velX = 0;
        this.velY = 0;

        this.on('destroy', () => {
          this.selectionCircle.destroy();
          this.shadow.destroy();
          this.idleGlow.destroy();
        });
      }

      applySeparation(allUnits) {
        let separationX = 0;
        let separationY = 0;

        allUnits.forEach(otherUnit => {
          if (otherUnit === this) return;

          const distance = Phaser.Math.Distance.Between(this.x, this.y, otherUnit.x, otherUnit.y);
          const triggerDistance = this.radius + otherUnit.radius;

          if (distance < triggerDistance) {
            const overlap = triggerDistance - distance;
            let pushX = this.x - otherUnit.x;
            let pushY = this.y - otherUnit.y;
            const magnitude = Math.sqrt(pushX * pushX + pushY * pushY);
            if (magnitude > 0) {
              pushX /= magnitude;
              pushY /= magnitude;
            }
            separationX += pushX * overlap * this.separationForce;
            separationY += pushY * overlap * this.separationForce;
          }
        });

        this.velX += separationX;
        this.velY += separationY;
      }

      setPath(path) {
        if (path && path.length > 0) {
          this.path = path;
          this.targetPos = this.path.shift();
        } else {
          this.path = null;
          this.targetPos = null;
        }
      }

      showSelectionCircle() {
        this.selectionCircle.setVisible(true);
        this.selectionCircle.setScale(1.08);
        this.idleGlow.setAlpha(0.6);
      }

      hideSelectionCircle() {
        this.selectionCircle.setVisible(false);
        this.selectionCircle.setScale(1);
        this.idleGlow.setAlpha(0);
      }

      updateAnimation() {
        if (this.velX === 0 && this.velY === 0) {
          this.stop();
          return;
        }

        const angle = Phaser.Math.RadToDeg(Math.atan2(this.velY, this.velX));
        let direction = 'S';
        if (angle >= -22.5 && angle < 22.5) direction = 'E';
        else if (angle >= 22.5 && angle < 67.5) direction = 'SE';
        else if (angle >= 67.5 && angle < 112.5) direction = 'S';
        else if (angle >= 112.5 && angle < 157.5) direction = 'SW';
        else if (angle >= 157.5 || angle < -157.5) direction = 'W';
        else if (angle >= -157.5 && angle < -112.5) direction = 'NW';
        else if (angle >= -112.5 && angle < -67.5) direction = 'N';
        else if (angle >= -67.5 && angle < -22.5) direction = 'NE';

        const animKey = `anim_run_${direction}`;
        if (this.anims.currentAnim?.key !== animKey) {
          this.play(animKey, true);
        }
      }

      preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.update(time, delta);
      }

      update(time, delta) {
        this.velX = 0;
        this.velY = 0;

        if (this.targetPos) {
          const distanceToTarget = Phaser.Math.Distance.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
          if (distanceToTarget < 5) {
            if (this.path && this.path.length > 0) {
              this.targetPos = this.path.shift();
            } else {
              this.targetPos = null;
            }
          } else {
            let dirX = this.targetPos.x - this.x;
            let dirY = this.targetPos.y - this.y;
            const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
            if (magnitude > 0) {
              dirX /= magnitude;
              dirY /= magnitude;
            }
            this.velX += dirX * this.moveSpeed;
            this.velY += dirY * this.moveSpeed;
          }
        }

        this.applySeparation(this.scene.units.getChildren());

        const dt = delta / 1000;
        this.x += this.velX * dt;
        this.y += this.velY * dt;

        this.x = Phaser.Math.Clamp(this.x, WORLD_BOUNDS.x, WORLD_BOUNDS.right);
        this.y = Phaser.Math.Clamp(this.y, WORLD_BOUNDS.y, WORLD_BOUNDS.bottom);

        this.setDepth(this.y);

        const speedFactor = Phaser.Math.Clamp(this.body.velocity.length() / (this.moveSpeed || 1), 0, 1.2);
        this.shadow.setPosition(this.x, this.y + 10);
        this.shadow.setScale(1 + speedFactor * 0.25, 1 + speedFactor * 0.12);
        this.shadow.setAlpha(0.38 - speedFactor * 0.1);
        this.shadow.setDepth(this.y - 5);

        if (this.selectionCircle.visible) {
          const pulse = 1 + Math.sin(time / 220) * 0.08;
          this.selectionCircle.setScale(pulse);
        }
        this.selectionCircle.setPosition(this.x, this.y);
        this.selectionCircle.setDepth(this.y - 1);

        if (this.idleGlow && this.idleGlow.alpha > 0) {
          this.idleGlow.clear();
          this.idleGlow.lineStyle(2, 0x0ff0fc, 0.18 + speedFactor * 0.35);
          this.idleGlow.strokeCircle(this.x, this.y, this.radius * (1.35 + speedFactor * 0.25));
          this.idleGlow.setDepth(this.y - 2);
        }

        this.updateAnimation();
      }
    }

    const TILE_SIZE = 40;
    const GRID_WIDTH = 20;
    const GRID_HEIGHT = 20;
    const WORLD_BOUNDS = new Phaser.Geom.Rectangle(0, 0, GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);

    let units;
    let selectedUnits = [];
    let graphics;
    let selectionRect;
    let uiPanel;
    let selectionCounter;

    const gameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      backgroundColor: '#1a4d3a',
      parent: containerRef.current,
      physics: {
        default: 'arcade',
        arcade: { debug: false }
      },
      scene: {
        preload,
        create,
        update
      }
    };

    function preload() {
      this.load.atlas('player_run', 'assets/run.png', 'assets/run.json');
    }

    function create() {
      this.input.mouse.disableContextMenu();

      let isDragging = false;
      let startX = 0;
      let startY = 0;

      this.input.on('pointerdown', pointer => {
        if (pointer.leftButtonDown()) {
          isDragging = true;
          startX = pointer.x;
          startY = pointer.y;

          selectedUnits.forEach(unit => {
            unit.clearTint();
            unit.hideSelectionCircle();
          });
          selectedUnits = [];
          updateSelectionCounter();
        } else if (pointer.rightButtonDown()) {
          const worldClickPos = { x: pointer.x, y: pointer.y };
          const clampedWorldX = Phaser.Math.Clamp(worldClickPos.x, WORLD_BOUNDS.x, WORLD_BOUNDS.right);
          const clampedWorldY = Phaser.Math.Clamp(worldClickPos.y, WORLD_BOUNDS.y, WORLD_BOUNDS.bottom);

          createMoveIndicator(this, pointer.x, pointer.y);

          selectedUnits.forEach(unit => {
            const startXPos = unit.x;
            const startYPos = unit.y;
            const path = window.findDirectPath(startXPos, startYPos, clampedWorldX, clampedWorldY);
            if (path) {
              unit.setPath(path);
            } else {
              unit.setPath(null);
            }
          });
        }
      });

      const backgroundLayer = this.add.graphics({ depth: -55 });
      backgroundLayer.fillGradientStyle(0x0a1825, 0x0b1a28, 0x0f2436, 0x112b3f, 1);
      backgroundLayer.fillRect(0, 0, gameConfig.width, gameConfig.height);

      const bgGraphics = this.add.graphics({ depth: -49, alpha: 0.22 });
      bgGraphics.fillStyle(0xffffff, 0.3);
      bgGraphics.lineStyle(1, 0x3a6d92, 0.25);

      const tileSize = 32;
      const gridWidth = 26;
      const gridHeight = 18;
      for (let i = 0; i <= gridWidth; i++) {
        const x = i * tileSize;
        bgGraphics.lineBetween(x, 0, x, gameConfig.height);
      }
      for (let i = 0; i <= gridHeight; i++) {
        const y = i * tileSize;
        bgGraphics.lineBetween(0, y, gameConfig.width, y);
      }

      window.findDirectPath = function (startX, startY, endX, endY) {
        const path = [];
        path.push({ x: endX, y: endY });
        return path;
      };

      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      directions.forEach(dir => {
        this.anims.create({
          key: `anim_run_${dir}`,
          frames: this.anims.generateFrameNames('player_run', {
            prefix: `run_${dir}_`,
            start: 0,
            end: 20,
            zeroPad: 3,
            suffix: '.png'
          }),
          frameRate: 24,
          repeat: -1
        });
      });

      units = this.physics.add.group({ classType: Unit, runChildUpdate: true });
      this.units = units;

      for (let i = 0; i < 8; i++) {
        const x = Phaser.Math.Between(120, 680);
        const y = Phaser.Math.Between(120, 520);
        const unit = new Unit(this, x, y);
        units.add(unit, true);
      }

      createUI(this);

      graphics = this.add.graphics({ depth: 9999 });
      selectionRect = new Phaser.Geom.Rectangle(0, 0, 0, 0);
      let logicalSelectionRect = new Phaser.Geom.Rectangle(0, 0, 0, 0);

      this.input.on('pointermove', pointer => {
        if (isDragging) {
          logicalSelectionRect.x = Math.min(startX, pointer.x);
          logicalSelectionRect.y = Math.min(startY, pointer.y);
          logicalSelectionRect.width = Math.abs(startX - pointer.x);
          logicalSelectionRect.height = Math.abs(startY - pointer.y);

          const viewBounds = new Phaser.Geom.Rectangle(0, 0, this.game.config.width, this.game.config.height);
          const drawRect = Phaser.Geom.Rectangle.Intersection(logicalSelectionRect, viewBounds);

          graphics.clear();
          if (drawRect.width > 0 && drawRect.height > 0) {
            graphics.lineStyle(3, 0x4a90e2, 1);
            graphics.fillStyle(0x4a90e2, 0.15);
            graphics.fillRectShape(drawRect);
            graphics.strokeRectShape(drawRect);
          }
        }
      });

      this.input.on('pointerup', pointer => {
        if (pointer.leftButtonReleased()) {
          isDragging = false;
          graphics.clear();

          selectedUnits.forEach(unit => {
            unit.clearTint();
            unit.hideSelectionCircle();
          });
          selectedUnits = [];

          if (logicalSelectionRect.width < 10 && logicalSelectionRect.height < 10) {
            const clickedObjects = this.physics.overlapRect(pointer.x, pointer.y, 1, 1);
            if (clickedObjects.length > 0) {
              const clickedUnit = clickedObjects.map(body => body.gameObject).find(go => units.contains(go));
              if (clickedUnit) {
                selectedUnits = [clickedUnit];
                clickedUnit.setTint(0x4a90e2);
                clickedUnit.showSelectionCircle();
              }
            }
          } else {
            units.children.iterate(unit => {
              if (Phaser.Geom.Rectangle.Contains(logicalSelectionRect, unit.x, unit.y)) {
                selectedUnits.push(unit);
                unit.setTint(0x4a90e2);
                unit.showSelectionCircle();
              }
            });
          }

          updateSelectionCounter();
        }
      });

      function createUI(scene) {
        uiPanel = scene.add.dom(20, 20).createFromHTML(`
          <div class="ui-panel">
            <div class="ui-title">🎮 RTS Game (Top-Down)</div>
            <div class="ui-info">Unidades: <span id="total-units">0</span></div>
            <div class="ui-info">Seleccionadas: <span id="selected-count">0</span></div>
            <div class="ui-controls">
              <h4>Controles:</h4>
              <p>🖱️ Clic + Arrastrar: Seleccionar</p>
              <p>🖱️ Clic Derecho: Mover</p>
              <p>✨ Vista top-down pura</p>
              <p>✨ Separación manual precisa</p>
              <p>🗺️ Límites del mapa activos</p>
              <p>🧭 Movimiento directo</p>
              <p>🎯 Círculos de selección</p>
            </div>
          </div>
        `);

        selectionCounter = scene.add.dom(gameConfig.width - 20, 20).createFromHTML(`
          <div class="selection-counter">
            <span id="selection-display">0</span>
          </div>
        `);

        uiPanel.getChildByID('total-units').textContent = units ? units.children.size : 0;
      }

      function updateSelectionCounter() {
        if (selectionCounter) {
          const display = selectionCounter.getChildByID('selection-display');
          if (display) {
            display.textContent = selectedUnits.length;
          }
        }
        if (uiPanel) {
          const countElement = uiPanel.getChildByID('selected-count');
          if (countElement) {
            countElement.textContent = selectedUnits.length;
          }
        }
      }

      function createMoveIndicator(scene, px, py) {
        const outerRipple = scene.add.circle(px, py, 16, 0xffffff, 0);
        outerRipple.setStrokeStyle(2, 0x6bc1ff, 0.85);
        outerRipple.setBlendMode(Phaser.BlendModes.ADD);
        outerRipple.setDepth(9999);
        outerRipple.setScale(0.4);
        scene.tweens.add({
          targets: outerRipple,
          scale: 1.9,
          alpha: 0,
          duration: 720,
          ease: 'Cubic.easeOut',
          onComplete: () => outerRipple.destroy()
        });

        const innerPulse = scene.add.circle(px, py, 10, 0x4a90e2, 0.45);
        innerPulse.setDepth(9999);
        innerPulse.setBlendMode(Phaser.BlendModes.ADD);
        innerPulse.setScale(0.6);
        scene.tweens.add({
          targets: innerPulse,
          scale: 1.35,
          alpha: 0,
          duration: 520,
          ease: 'Sine.easeOut',
          onComplete: () => innerPulse.destroy()
        });

        const spark = scene.add.circle(px, py, 3, 0xffffff, 0.95);
        spark.setDepth(9999);
        spark.setBlendMode(Phaser.BlendModes.ADD);
        scene.tweens.add({
          targets: spark,
          scaleX: 2.8,
          scaleY: 2.8,
          alpha: 0,
          duration: 460,
          ease: 'Quad.easeOut',
          onComplete: () => spark.destroy()
        });
      }

      this.events.on('shutdown', () => {
        selectedUnits.forEach(unit => {
          unit.clearTint();
          unit.hideSelectionCircle();
        });
        selectedUnits = [];
      });
    }

    function update() {}

    const game = new Phaser.Game(gameConfig);
    gameRef.current = game;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div className="phaser-rts-wrapper"><div ref={containerRef} /></div>;
};

export default PhaserRTSGame;

