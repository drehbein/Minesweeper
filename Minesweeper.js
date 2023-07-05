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
	var area = rows * columns;

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
		// Assemble adjacent cells; reading order from top-left
		var adjacentCells = [
			... !emptySpace.Borders.top && !emptySpace.Borders.left ? [emptySpace.Location - columns - 1] : [],
			... !emptySpace.Borders.top ? [emptySpace.Location - columns] : [],
			... !emptySpace.Borders.top && !emptySpace.Borders.right ? [emptySpace.Location - columns + 1] : [],
			... !emptySpace.Borders.left ? [emptySpace.Location - 1] : [],
			... !emptySpace.Borders.right ? [emptySpace.Location + 1] : [],
			... !emptySpace.Borders.bottom && !emptySpace.Borders.left ? [emptySpace.Location + columns - 1] : [],
			... !emptySpace.Borders.bottom ? [emptySpace.Location + columns] : [],
			... !emptySpace.Borders.bottom && !emptySpace.Borders.right ? [emptySpace.Location + columns + 1] : [],
		];
		// Filter for adjacent mines
		var adjacentMines = adjacentCells.filter(function (cellLocation) {
			return(gameState[cellLocation].Mine == "True");
		});
		emptySpace.Adjacent = adjacentMines.length;
	}

	renderBoard();
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
	if (event.shiftKey) {
		var cellState = gameState[cell];
		if (cellState.Flagged == "True") {
			gameState[cell].Flagged = "False";
		} else if (cellState.Hidden == "True") {
			gameState[cell].Flagged = "True";
		}
	} else {
		gameState[cell].Hidden = "False";
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
	console.log(gameState);
}
