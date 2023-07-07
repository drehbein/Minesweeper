if (!localStorage) {
	alert("Game data will not be saved as your browser or device does not support local storage.");
}

// Loads dashboard
function loadDashboard() {
	loadWinrate();
}

// Loads win rate
function loadWinrate() {
	gameHistory = JSON.parse(localStorage.getItem("gameHistory") || "[]");
	var wins = gameHistory.filter(function(item) {
		return item.win;
	}).length;
	var games = gameHistory.length;
	console.log(wins);
	var winRate = "Win rate: " + (wins / games) * 100 + "% (" + wins + " / " + games + ")";
	document.getElementById("winRate").innerHTML = winRate;
}

// Initiates game
function setBoard() {
	// take user input
	rows = parseInt(document.getElementById("rows").value);
	columns = parseInt(document.getElementById("columns").value);
	mines = parseInt(document.getElementById("mines").value);
	area = rows * columns;

	// abort if board is invalid
	if (isNaN(rows) || isNaN(columns) || isNaN(mines) || rows < 1 || columns < 1 || mines < 1) {
		alert("There must be at least one rows, column, and mine");
		return;
	} else if (mines > area - 9) {
		alert("Mine quantity must be at least 9 less than the total area");
		return;
	} else if (area > 2000) {
		alert("Area must be 2000 cells or less");
		return;
	}

	// hide setup options
	document.getElementById("setup").setAttribute("hidden", "hidden");

	// reset tracking
	revealed = 0;
	flagged = 0;
	startTimer();
	clickCount = 0;
	metaData = {
		rows:rows,
		columns:columns,
		mines:mines,
		startTime:Date()
	};

	// create an array without mines
	gameState = null;
	gameState = {};
	for (var i = 0; i < area; i++) {
		gameState[i] = {
			Location:i,
			Mine:false,
			Hidden:true,
			Flagged:false,
			Borders:labelBorders(i)
		};
	}

	gameOver = false;
	renderBoard();
	document.getElementById("game").removeAttribute("hidden");
}

// Assign mine locations
function assignMineLocations (cellLocation) {

	// count adjacent cells
	var guaranteedEmpty = adjacentCellIdentifier(cellLocation);

	// generate mine locations
	mineLocations = new Map();
	while (mineLocations.size < mines) {
		var randomLocation = Math.floor(Math.random() * area);
		if (!guaranteedEmpty.includes(randomLocation) && cellLocation !== randomLocation) {
			mineLocations.set(randomLocation, true);
		}
	}
	var mineLocations = Array.from(mineLocations.keys());
	document.getElementById("mineLocationsDebug").innerHTML = "Location of " + mines + " mines: " + mineLocations.sort(function(a, b){return a - b});

	// add each mine
	for (const mineLocation of mineLocations) {
		gameState[mineLocation].Mine = true;
	}

	// Assign adjacent mine count to each empty space
	for (var i = 0; i < area; i++) {
		var adjacentCells = adjacentCellIdentifier(i);

		// Filter for adjacent mines
		var adjacentMines = adjacentCells.filter(function (i) {
			return(gameState[i]["Mine"] === true);
		});
		gameState[i]["Adjacent"] = adjacentMines.length;
	}
}

// Assemble adjacent cells; reading order from top-left
function adjacentCellIdentifier (cellLocation) {
	var cell = gameState[cellLocation];
	var offsets = [-1, 0, 1]; // Row and column offsets

	var adjacentCells = [];

	for (var i = 0; i < offsets.length; i++) {
		for (var j = 0; j < offsets.length; j++) {
			var rowOffset = offsets[i];
			var colOffset = offsets[j];
			if (rowOffset === 0 && colOffset === 0) {
				// Skip the current cell
				continue;
			}

			var newRow = Math.floor(cellLocation / columns) + rowOffset;
			var newCol = (cellLocation % columns) + colOffset;

			if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < columns) {
				var adjacentCellLocation = newRow * columns + newCol;
				adjacentCells.push(adjacentCellLocation);
			}
		}
	}

	return adjacentCells;
}

// Return border labels
function labelBorders(cell) {
	let borders = {};
	if (cell < columns) {
		borders.top = true;
	}
	if ((cell + 1) % columns === 0) {
		borders.right = true;
	}
	if (cell + 1 > columns * (rows - 1)) {
		borders.bottom = true;
	}
	if (cell % columns === 0) {
		borders.left = true;
	}
	return borders;
}

// Handle 'reveal' or 'flag' clicks
function clickEvent(event, cellLocation) {
	if (clickCount === 0) {
		assignMineLocations(cellLocation);
	}
	clickCount++;
	var cell = gameState[cellLocation];
	if (gameOver) {
		return;
	}
	if (event.shiftKey && cell.Hidden) {
		cell.Flagged = !cell.Flagged;
		flagged += cell.Flagged ? 1 : -1;
		renderBoard();
		return;
	}
	if (cell.Flagged || !cell.Hidden) {
		return;
	}
	if (cell.Mine) {
		cell.Hidden = false;
		endGame("lose");
		return;
	}

	revealEmpty(cell);

	checkWin();
}

// Reveal empty cell clusters
function revealEmpty(cell) {
	if (!cell.Hidden) {
		return;
	}

	const stack = [cell];
	const visited = new Set();
	while (stack.length > 0) {
		const currentCell = stack.pop();
		if (visited.has(currentCell)) {
			continue;
		}

		visited.add(currentCell);
		currentCell.Hidden = false;
		revealed++;
		if (currentCell.Adjacent === 0) {
			const adjacentCells = adjacentCellIdentifier(currentCell.Location);
			for (const cellLocation of adjacentCells) {
				const adjacentCell = gameState[cellLocation];
				if (adjacentCell.Hidden && !adjacentCell.Flagged) {
					stack.push(adjacentCell);
				}
			}
		}
	}
}

// check win condition
function checkWin() {
	if (revealed >= area - mines) {
		endGame("win");
		return;
	} else {
		renderBoard();
	}
}

// end game and store game information in local storage
function endGame(result) {
	metaData.win = result === "win";
	metaData.endTime = Date();
	metaData.clickCount = clickCount;
	metaData.correctRevealed = revealed;
	metaData.flagged = flagged;
	let gameHistory = JSON.parse(localStorage.getItem("gameHistory") || "[]");
	gameHistory.push(metaData);
	localStorage.setItem("gameHistory", JSON.stringify(gameHistory));
	gameOver = true;
	if (result === "win") {
		for (let cellLocation in gameState) {
			if (!gameState[cellLocation].Flagged && gameState[cellLocation].Mine) {
				gameState[cellLocation].Flagged = true;
				flagged++;
			}
		}
	}
	clearInterval(timer);
	renderBoard();
	setTimeout(() => {
		alert(`Game over, you ${result}!`);
	}, 100);
}

// Updates board graphic
function renderBoard() {
	// remove old board
	if (x = document.getElementById("board")) {
		x.remove();
	}

	// create board
	var board = document.createElement("TABLE");
	board.setAttribute("id", "board");
	document.getElementById("boardCont").appendChild(board);

	// reset cell ticker
	var cellCount = 0;

	// add rows/cells
	var board = document.getElementById("board");
	for (let i = 0; i < rows; i++) {
		var row = document.createElement("TR");
		row.setAttribute("id", "row");
		board.appendChild(row);

		for (let j = 0; j < columns; j++) {
			var cell = document.createElement("TD");
			var imageElement = document.createElement("IMG");
			var imageFile = imageSelector(cellCount, cell);
			imageElement.setAttribute("src", imageFile.src);
			imageElement.setAttribute("style", "width:50px;height:50px;");
			imageElement.setAttribute("alt", imageFile.alt);
			imageElement.setAttribute("onclick", `clickEvent(event, ${cellCount})`);
			cell.appendChild(imageElement);
			row.appendChild(cell);
			cellCount++;
		}
	}

	// update revealed count
	document.getElementById("revealed").innerHTML = "Revealed: " + revealed;
	document.getElementById("flagged").innerHTML = "Flagged: " + flagged;

}

// Select display for each cell
function imageSelector(cellCount, cell) {
	cellState = gameState[cellCount];
	if (cellState.Flagged) {
		return {src:"MinesweeperImages/flag.png", alt:"Flag"};
	} else if (cellState.Hidden) {
		return {src:"MinesweeperImages/hidden.png", alt:"Hidden"};
	} else if (!cellState.Mine) {
		return {src:`MinesweeperImages/${cellState.Adjacent}.png`, alt:"Empty"};
	} else if (cellState.Mine && !cellState.Hidden) {
		return {src:"MinesweeperImages/bomb.png", alt:"Mine"};
	}
}

// start timer
function startTimer() {
	timeElapsed = 0;
	document.getElementById("timer").innerHTML = "Time elapsed: " + timeElapsed;
	timer = setInterval(tick, 1000);
}

// maintain timer
function tick() {
	timeElapsed++;
	document.getElementById("timer").innerHTML = "Time elapsed: " + timeElapsed;
}

// restart game
function restart() {
	document.getElementById("game").setAttribute("hidden", "hidden");
	clearInterval(timer);
	if (x = document.getElementById("board")) {
		x.remove();
	}
	metaData = {};
	document.getElementById("setup").removeAttribute("hidden");
	
}

// Toggle debugging information
function toggleDebugging() {
	let debugging = document.getElementById("debugging");
	let hidden = debugging.getAttribute("hidden");
	if (hidden) {
		debugging.removeAttribute("hidden");
	} else {
		debugging.setAttribute("hidden", "hidden");
	}
}

// Debugging button
function test() {
	console.log(gameState);
}
