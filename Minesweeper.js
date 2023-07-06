// Initiates game
function setBoard() {
	// take user input
	rows = parseInt(document.getElementById("rows").value);
	columns = parseInt(document.getElementById("columns").value);
	mines = parseInt(document.getElementById("mines").value); 
	if (rows < 0 || columns < 0 || mines < 0) {
		alert("Positive numbers only please!");
	}

	// calculate area
	area = rows * columns;

	// start tracking
	revealed = 0;

	// generate mine locations using a Durstenfeld shuffle
	const cells = Array.from({length: area}, (_, i) => i);
	for (var i = cells.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i+1));
		var temp = cells[i];
		cells[i] = cells[j];
		cells[j] = temp;
	}
	mineLocations = cells.slice(0,mines);
	document.getElementById("mineLocations").innerHTML = "Location of " + mines + " mines: " + mineLocations;

	// create an array without mines
	gameState = [];
	while (gameState.length < area) {
		gameState.push({
			Location:gameState.length,
			Mine:"False",
			Hidden:"True",
			Flagged:"False",
			Borders:labelBorders(gameState.length)
		});
	}

	// add each mine
	for (const mineLocation of mineLocations) {
		gameState[mineLocation].Mine = "True";
	}

	// Identify empty spaces
	const emptySpaces = gameState.filter(function (cell) {
		return(cell.Mine == "False");
	});

	// Assign adjacent mine count to each empty space
	for (const emptySpace of emptySpaces) {
		var adjacentCells = adjacentCellIdentifier(emptySpace.Location);

		// Filter for adjacent mines
		var adjacentMines = adjacentCells.filter(function (cellLocation) {
			return(gameState[cellLocation].Mine == "True");
		});
		emptySpace.Adjacent = adjacentMines.length;
	}

	renderBoard();
}

// Assemble adjacent cells; reading order from top-left
function adjacentCellIdentifier (cellLocation) {
	var cell = gameState[cellLocation];
	return [
		... !cell.Borders.top && !cell.Borders.left ? [cell.Location - columns - 1] : [],
		... !cell.Borders.top ? [cell.Location - columns] : [],
		... !cell.Borders.top && !cell.Borders.right ? [cell.Location - columns + 1] : [],
		... !cell.Borders.left ? [cell.Location - 1] : [],
		... !cell.Borders.right ? [cell.Location + 1] : [],
		... !cell.Borders.bottom && !cell.Borders.left ? [cell.Location + columns - 1] : [],
		... !cell.Borders.bottom ? [cell.Location + columns] : [],
		... !cell.Borders.bottom && !cell.Borders.right ? [cell.Location + columns + 1] : [],
	];
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
		borders.top = "True";
	}
	if ((cell + 1) % columns == 0) {
		borders.right = "True";
	}
	if (cell + 1 > columns * (rows - 1)) {
		borders.bottom = "True";
	}
	if (cell % columns == 0) {
		borders.left = "True";
	}
	return borders;
}

// Handle 'reveal' or 'flag' clicks
function clickEvent(event, cell) {
	if (event.shiftKey && gameState[cell].Hidden == "True") {
		var cellState = gameState[cell];
		if (cellState.Flagged == "True") {
			gameState[cell].Flagged = "False";
		} else if (cellState.Hidden == "True") {
			gameState[cell].Flagged = "True";
		}
	} else if (gameState[cell].Flagged == "False") {
		if (gameState[cell].Mine == "True") {
			gameState[cell].Hidden = "False";
			renderBoard();
			setTimeout(() => {alert("Game over, you lose!");}, 50);
			return;
		} else if (gameState[cell].Adjacent !== 0) {
			gameState[cell].Hidden = "False";
			revealed++;
		} else {
			blankCluster = blankClusterIdentifier(cell);
			for (const cell in blankCluster) {
				if (gameState[blankCluster[cell]].Hidden == "True") {
					gameState[blankCluster[cell]].Hidden = "False";
					revealed++;
				}
			}
		}
		if (revealed >= area - mines) {
			for (const mineLocation of mineLocations) {
				gameState[mineLocation].Flagged = "True";
			}
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

}

// Select display for each cell
function imageSelector(cellCount, cell) {
	cellState = gameState[cellCount];
	if (cellState.Flagged == "True") {
		return {src:"MinesweeperImages/flag.png", alt:"Flag"};
	} else if (cellState.Hidden == "True") {
		return {src:"MinesweeperImages/hidden.png", alt:"Hidden"};
	} else if (cellState.Mine == "False") {
		return {src:`MinesweeperImages/${cellState.Adjacent}.png`, alt:"Empty"};
	} else if (cellState.Mine == "True" && cellState.Hidden == "False") {
		return {src:"MinesweeperImages/bomb.png", alt:"Mine"};
	}
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
