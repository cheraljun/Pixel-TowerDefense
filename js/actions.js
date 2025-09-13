export default class Actions {
	constructor(game, dom, tiles) {
		this.game = game;
		this.dom = dom;
		this.scores = null;
		this.mouseX;
		this.mouseY;
		this.handleCanvas();
		this.handleButtonClicks();
		this.handleTileListeners(tiles);

		this.towerInfo = null;
	}

	handleCanvas() {
		this.dom.canvas.addEventListener(
			"mousemove",
			this.handleCanvasMove.bind(this)
		);
		this.dom.canvas.addEventListener(
			"mouseover",
			this.handleCanvasOver.bind(this)
		);
		this.dom.canvas.addEventListener(
			"mouseout",
			this.handleCanvasOut.bind(this)
		);
		this.dom.canvas.addEventListener(
			"click",
			this.handleCanvasClick.bind(this)
		);
		this.dom.canvas.addEventListener(
			"dblclick",
			this.handleCanvasDblClick.bind(this)
		);
	}

	handleCanvasMove(event) {
		this.mouseX = event.offsetX;
		this.mouseY = event.offsetY;
		const towers = this.game.towers;
		if (towers.length < 1) return;
		const tower = towers[towers.length - 1];
		if (!tower.placed && this.game.placingTower === true) {
			tower.location.x = this.mouseX;
			tower.location.y = this.mouseY;
		}
	}

	handleCanvasOver() {
		if (this.game.towers.length < 1) return;
		this.game.towers[this.game.towers.length - 1].visible = true;
	}

	handleCanvasOut() {
		if (this.game.placingTower) {
			this.game.placingTower = false;
			this.game.towers.splice(this.game.towers.length - 1, 1);
		}
	}

	handleCanvasClick() {
		const col = Math.floor(this.mouseX / this.game.cellSize);
		const row = Math.floor(this.mouseY / this.game.cellSize);

		const cell = this.game.grid[col][row];

		this.game.resetSelects();

		if (this.game.placingTower) {
			this.game.checkTowerPlacement(cell);
		} else {
			for (let i = 0; i < this.game.towers.length; i++) {
				let tower = this.game.towers[i];
				if (
					tower.location.x === cell.center.x &&
					tower.location.y === cell.center.y
				) {
					if (tower.selected) {
						tower.deselect(true);
					} else {
						tower.select();
					}
				} else {
					tower.selected = false;
				}
			}
		}
	}

	handleCanvasDblClick() {
		const gridCol = Math.floor(this.mouseX / this.game.cellSize);
		const gridRow = Math.floor(this.mouseY / this.game.cellSize);

		const cell = this.game.grid[gridCol][gridRow];

		this.game.resetSelects();

		for (let i = 0; i < this.game.towers.length; i++) {
			let tower = this.game.towers[i];
			if (
				tower.location.x === cell.center.x &&
				tower.location.y === cell.center.y
			) {
				this.game.selectAllTowers(tower.type, tower.level);
				return;
			}
		}
	}

	handleButtonClicks() {
		this.dom.audio.addEventListener("click", this.audioClick.bind(this));
		this.dom.wave.addEventListener("click", this.waveClick.bind(this));
		this.dom.buy.addEventListener("click", this.buyClick.bind(this));
		this.dom.upgrade.addEventListener("click", this.upgradeClick.bind(this));
		this.dom.sell.addEventListener("click", this.sellClick.bind(this));
		// 改为点击文字切换自动/手动
		this.dom.autoBox.addEventListener("click", this.toggleAutoMode.bind(this));
	}

	audioClick() {
		if (this.game.muted) {
			this.game.muted = false;
			this.game.sound.play();
			this.dom.audio.classList.remove("audio-off");
			this.dom.audio.classList.add("audio-on");
		} else {
			this.game.muted = true;
			this.game.sound.pause();
			this.dom.audio.classList.remove("audio-on");
			this.dom.audio.classList.add("audio-off");
		}
	}

	toggleAutoMode() {
		this.game.autoWave = !this.game.autoWave;
		// 当前处于自动，则显示“手动”；处于手动则显示“自动”
		this.dom.autoBox.innerText = this.game.autoWave ? "手动" : "自动";
	}

	waveClick() {
		if (
			!this.game.sendingWave &&
			this.game.gameStarted &&
			!this.game.gameOver
		) {
			this.game.wave += 1;
			this.game.sendingWave = true;
			this.game.waveTimer = 400;
			if (this.game.wave === 1) {
				this.dom.waveText.innerText = "下一波";
				this.dom.towerMenu.classList.remove("active");
			}
			this.dom.wave.classList.remove("clickable");
			this.game.nextWave();
		}
	}

	upgradeClick() {
		this.game.selectedTowers.forEach((tower) => {
			if (tower.canUpgrade) {
				if (this.game.bits - tower.upgrade >= 0) {
					this.game.bits -= tower.upgrade;
					this.game.cr -= tower.upgrade;
					tower.handleUpgrade();
				} else {
					this.game.actions.blinkBank();
				}
			}
		});
	}

	buyClick() {
		const tileDiv = this.game.showTowerDivInfo;
		if (!tileDiv) return; // 未悬停塔牌时，不执行购买
		if (this.game.placingTower === true) {
			if (!this.game.towers[this.game.towers.length - 1].placed) {
				this.game.towers.splice(this.game.towers.length - 1, 1);
			}
		}
		if (this.game.bits >= tileDiv.cost) {
			this.game.createTower(tileDiv);
			this.game.currentTileDiv = tileDiv;
			this.game.placingTower = true;
			if (this.game.selectedTowers) {
				this.game.resetSelects();
			}
		} else {
			this.game.actions.blinkBank();
		}
	}

	sellClick() {
		this.game.selectedTowers.forEach((tower) => {
			tower.deselect(false);
			this.game.bits += tower.upgrade / 2;
			this.game.cr += tower.upgrade / 2;
		});

		this.game.resetSelects();

		this.game.loadPaths();
		for (let c = 0; c < this.game.numCols; c++) {
			for (let r = 0; r < this.game.numRows; r++) {
				this.game.grid[c][r].loadAdjacentCells();
			}
		}

		this.game.path = this.game.getPath();
	}


	handleTileListeners(tiles) {
		for (let i = 0; i < tiles.length; i++) {
			const tileDiv = tiles[i];
			tileDiv.addEventListener(
				"mouseover",
				(e) => this.tileRollOver(e, this.game),
				false
			);
			tileDiv.addEventListener(
				"mouseout",
				(e) => this.tileRollOut(e, this.game),
				false
			);
			tileDiv.addEventListener(
				"click",
				(e) => this.tileClicked(e, this.game),
				false
			);
		}
	}

	tileRollOver(e, game) {
		game.showTowerDivInfo = e.currentTarget;
	}

	tileRollOut(e, game) {
		game.showTowerDivInfo = null;
	}

	tileClicked(e, game) {
		const towerDiv = e.currentTarget;
		if (game.placingTower === true) {
			if (!game.towers[game.towers.length - 1].placed) {
				game.towers.splice(game.towers.length - 1, 1);
			}
		}
		if (game.bits >= towerDiv.cost) {
			game.createTower(towerDiv);
			game.currentTileDiv = towerDiv;
			game.placingTower = true;
			if (game.selectedTowers) {
				game.resetSelects();
			}
		} else {
			game.actions.blinkBank();
		}
	}

	blinkBank() {
		const bank = this.dom.bank;
		if (!bank.classList.contains("flashing")) {
			bank.classList.add("flashing");
			setTimeout(() => {
				bank.classList.remove("flashing");
			}, 1000);
		}
	}

	showTowerInfo() {
		const target = this.getTower();
		this.toggleEditButtons(target);
		// 同步按钮文字：
		const tileDiv = this.game.showTowerDivInfo;
		if (tileDiv) {
			this.dom.buy.innerText = `${tileDiv.cost}¥`;
		} else {
			this.dom.buy.innerText = "购买";
		}

		// 选中塔时，显示“升级 X¥”；未选中则显示“升级”
		const hasTower = this.game.selectedTowers.length > 0;
		const selectedTower = hasTower
			? this.game.selectedTowers[this.game.selectedTowers.length - 1]
			: null;
		if (selectedTower && selectedTower.canUpgrade) {
			this.dom.upgrade.innerText = `升级 ${selectedTower.upgrade}¥`;
		} else {
			this.dom.upgrade.innerText = "升级";
		}
	}

	getTower() {
		return this.game.showTowerDivInfo
			? this.game.showTowerDivInfo
			: this.game.selectedTowers[this.game.selectedTowers.length - 1];
	}

	toggleEditButtons(tower) {
		const hasTile = !!this.game.showTowerDivInfo;
		const hasTower = this.game.selectedTowers.length > 0;
		const selectedTower = hasTower
			? this.game.selectedTowers[this.game.selectedTowers.length - 1]
			: null;

		// 购买按钮：始终可见；悬浮塔牌时可用
		const buyPrev = this.dom.buy.style.opacity;
		this.dom.buy.style.opacity = hasTile ? 100 : 40;
		this.dom.buy.classList.toggle("clickable", hasTile);

		// 升级按钮：始终可见；选中塔时根据可升级性启用
		const upPrev = this.dom.upgrade.style.opacity;
		const canUpgrade = !!(selectedTower && selectedTower.canUpgrade);
		this.dom.upgrade.style.opacity = hasTower ? (canUpgrade ? 100 : 40) : 40;
		this.dom.upgrade.classList.toggle("clickable", !!(hasTower && canUpgrade));

		// 出售按钮：始终可见；仅选中且已放置时可用
		const sellPrev = this.dom.sell.style.opacity;
		const canSell = !!(selectedTower && selectedTower.placed);
		this.dom.sell.style.opacity = hasTower ? (canSell ? 100 : 40) : 40;
		this.dom.sell.classList.toggle("clickable", !!(hasTower && canSell));
	}

	updateStats() {
		for (let i = 0; i < this.dom.infoTiles.length; i++) {
			let tile = this.dom.infoTiles[i];
			let header = tile.querySelector("h4");
			let value = tile.querySelector("p");
			if (!header) {
				header = document.createElement("h4");
				tile.innerHTML = "";
				tile.appendChild(header);
			}
			if (!value) {
				value = document.createElement("p");
				tile.appendChild(value);
			}

			if (tile.id === "info-bits") {
				header.innerText = "金币";
				value.innerText = this.game.bits + "¥";
			} else if (tile.id === "info-lives") {
				header.innerText = "生命";
				value.innerText = this.game.lives;
			} else if (tile.id === "info-score") {
				header.innerText = "分数";
				value.innerText = this.game.score;
			} else if (tile.id === "info-wave") {
				header.innerText = "波次";
				value.innerText = this.game.wave;
			}
		}
	}

	handleGameOver() {
		this.game.sound.stop();
		this.game.gameOver = true;
		this.game.context.fillStyle = "rgba(125, 125, 125, 0.6)";
		this.game.context.fillRect(
			0,
			0,
			this.game.canvas.width,
			this.game.canvas.height
		);
		this.dom.gameOver.style.opacity = 100;
		this.dom.gameOver.style.width = "100%";
		this.dom.gameOver.style.height = "100%";
		this.dom.overTitle.style.display = "inline-block";

		// 仅显示本次得分
		this.game.f = this.game.score;
		this.dom.final.innerHTML = `最终得分: ${this.game.f}`;
		this.dom.local.innerHTML = "";
		setTimeout(() => {
			this.dom.holder.style.opacity = 0;
			this.dom.gameOver.style.top = "15%";
			this.dom.overTitle.style.color = "rgb(171, 171, 171)";
			this.dom.terminal.style.display = "flex";
			this.dom.canvas.style.backgroundColor = "";
			this.dom.tutorial.style.opacity = 0;
			this.dom.topBar.style.opacity = 0;
			this.dom.bottomBar.style.opacity = 0;
			setTimeout(() => {
				this.dom.terminal.style.opacity = 100;
				setTimeout(() => {
					this.game.context.clearRect(
						0,
						0,
						this.game.canvas.width,
						this.game.canvas.height
					);
				}, 1000);
			}, 1000);
		}, 1000);
	}

	newGame() {
		this.dom.gameOver.style.opacity = 0;
		this.dom.gameOver.style.width = "0px";
		this.dom.gameOver.style.height = "0px";
		this.dom.overTitle.style.display = "none";
		this.dom.terminal.style.display = "none";
		this.dom.holder.style.opacity = 100;
		if (this.dom.footer) this.dom.footer.style.opacity = 100;
		// 恢复 footer 交互
		if (this.dom.footer) this.dom.footer.style.pointerEvents = "auto";
		this.dom.gameOver.style.top = "40%";
		this.dom.progress.style.width = "0%";
		this.dom.terminal.removeChild(this.dom.terminal.lastChild);
		while (this.dom.scores.firstChild) {
			this.dom.scores.removeChild(this.dom.scores.lastChild);
		}
		while (this.dom.towerMenu.firstChild) {
			this.dom.towerMenu.removeChild(this.dom.towerMenu.lastChild);
		}
		this.game.autoWave = false;
		this.dom.autoBox.innerText = "自动";
		this.dom.waveText.innerText = "第一波";
		this.dom.wave.classList.remove("active");
		this.dom.topBar.style.opacity = 0;
		this.dom.bottomBar.style.opacity = 0;
		// tutorial removed
		this.init();
	}
}
