// Initiates game
function setBoard() {
	// take user input
	rows = parseInt(document.getElementById("rows").value);
	columns = parseInt(document.getElementById("columns").value);
	mines = parseInt(document.getElementById("mines").value);
	area = rows * columns;

	// abort if board is invalid
	if (rows < 1 || columns < 1 || mines < 1) {
		alert("There must be at least one rows, column, and mine");
		return;
	} else if (mines > area) {
		alert("Mine quantity must be less than the total area");
		return;
	} else if (area > 2000) {
		alert("Area must be 2000 cells or less");
		return;
	}

	// hide setup options
	document.getElementById("setup").setAttribute("hidden", "hidden");

	// start tracking
	revealed = 0;
	flagged = 0;
	startTimer();

	// generate mine locations
	mineLocations = new Set();
	while (mineLocations.size < mines) {
		var randomLocation = Math.floor(Math.random() * area);
		mineLocations.add(randomLocation);
	}
	mineLocations = Array.from(mineLocations);
	document.getElementById("mineLocations").innerHTML = "Location of " + mines + " mines: " + mineLocations;

	// create an array without mines
	gameState = [];
	while (gameState.length < area) {
		gameState.push({
			Location:gameState.length,
			Mine:false,
			Hidden:true,
			Flagged:false,
			Borders:labelBorders(gameState.length)
		});
	}

	// add each mine
	for (const mineLocation of mineLocations) {
		gameState[mineLocation].Mine = true;
	}

	// Identify empty spaces
	const emptySpaces = gameState.filter(function (cell) {
		return(cell.Mine == false);
	});

	// Assign adjacent mine count to each empty space
	for (const emptySpace of emptySpaces) {
		var adjacentCells = adjacentCellIdentifier(emptySpace.Location);

		// Filter for adjacent mines
		var adjacentMines = adjacentCells.filter(function (cellLocation) {
			return(gameState[cellLocation].Mine == true);
		});
		emptySpace.Adjacent = adjacentMines.length;
	}

	gameOver = false;
	renderBoard();
	document.getElementById("game").removeAttribute("hidden");
}

// Assemble adjacent cells; reading order from top-left
function adjacentCellIdentifier (cellLocation) {
	var cell = gameState[cellLocation];
	var offsets = [-1, 0, 1]; // Row and column offsets

	var adjacentCells = [];

	for (var rowOffset of offsets) {
		for (var colOffset of offsets) {
			if (rowOffset === 0 && colOffset === 0) {
				// Skip the current cell
				continue;
			}

			var newRow = Math.floor(cell.Location / columns) + rowOffset;
			var newCol = (cell.Location % columns) + colOffset;

			if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < columns) {
				var adjacentCellLocation = newRow * columns + newCol;
				adjacentCells.push(adjacentCellLocation);
			}
		}
	}

	return adjacentCells;
}

// Identifies blank clusters and cells adjacent
function blankClusterIdentifier(starterCell) {
	var newBlanks = [starterCell];
	var knownBlanks = [];
	while (newBlanks.length > knownBlanks.length) {
		knownBlanks.push(...newBlanks);
		knownBlanks = [...new Set(knownBlanks)];
		for (const knownBlank of knownBlanks) {
			var adjacentCells = adjacentCellIdentifier(knownBlank); //working
			newBlanks.push(...adjacentCells);
			newBlanks = [...new Set(newBlanks)];
			newBlanks = newBlanks.filter(function (cellLocation) {
				return(gameState[cellLocation].Adjacent == 0);
			});
		}
	}
	var blankCluster = [];
	for (const knownBlank of knownBlanks) {
		blankCluster.push(...adjacentCellIdentifier(knownBlank));
	}
	blankCluster = [...new Set(blankCluster)];
	return blankCluster;
}

// Return border labels
function labelBorders(cell) {
	let borders = {};
	if (cell < columns) {
		borders.top = true;
	}
	if ((cell + 1) % columns == 0) {
		borders.right = true;
	}
	if (cell + 1 > columns * (rows - 1)) {
		borders.bottom = true;
	}
	if (cell % columns == 0) {
		borders.left = true;
	}
	return borders;
}

// Handle 'reveal' or 'flag' clicks
function clickEvent(event, cell) {
	if (gameOver == true) {
		return;
	} else if (event.shiftKey && gameState[cell].Hidden == true) {
		var cellState = gameState[cell];
		if (cellState.Flagged == true) {
			gameState[cell].Flagged = false;
			flagged--;
		} else if (cellState.Hidden == true) {
			gameState[cell].Flagged = true;
			flagged++;
		}
	} else if (gameState[cell].Flagged == false) {
		if (gameState[cell].Mine == true) {
			gameOver = true;
			gameState[cell].Hidden = false;
			clearInterval(timer);
			renderBoard();
			setTimeout(() => {alert("Game over, you lose!");}, 50);
			return;
		} else if (gameState[cell].Adjacent !== 0) {
			if (gameState[cell].Hidden == true) {
				gameState[cell].Hidden = false;
				revealed++;
			}
		} else {
			blankCluster = blankClusterIdentifier(cell);
			for (const cell in blankCluster) {
				if (gameState[blankCluster[cell]].Hidden == true) {
					gameState[blankCluster[cell]].Hidden = false;
					revealed++;
				}
			}
		}
		if (revealed >= area - mines) {
			gameOver = true;
			for (const mineLocation of mineLocations) {
				gameState[mineLocation].Flagged = true;
				flagged++;
			}
			clearInterval(timer);
			renderBoard();
			setTimeout(() => {alert("Game over, you win!");}, 50);
			return;
		}

	}
	renderBoard();
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
	for (let i = 0; i < rows; i++) {
		var row = document.createElement("TR");
		row.setAttribute("id", "row");
		document.getElementById("board").appendChild(row);

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
	if (cellState.Flagged == true) {
		return {src:"MinesweeperImages/flag.png", alt:"Flag"};
	} else if (cellState.Hidden == true) {
		return {src:"MinesweeperImages/hidden.png", alt:"Hidden"};
	} else if (cellState.Mine == false) {
		return {src:`MinesweeperImages/${cellState.Adjacent}.png`, alt:"Empty"};
	} else if (cellState.Mine == true && cellState.Hidden == false) {
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
	console.log(blankCluster.sort(function(a, b){return a - b}));

}
