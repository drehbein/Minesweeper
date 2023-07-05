// Initiates game
function setBoard() {
	// take user input
	rows = parseInt(document.getElementById("rows").value);
	columns = parseInt(document.getElementById("columns").value);
	mines = parseInt(document.getElementById("mines").value); 
	if (rows > 0 && columns > 0 && mines > 0) {
		document.getElementById("boardTitle").innerHTML = "A " + rows + "x" + columns + " board with " + mines + " mines!";
	} else {
		document.getElementById("boardTitle").innerHTML = "Positive numbers only please!"
	}

	// calculate area
	var area = rows * columns;
	document.getElementById("boardArea").innerHTML = area;

	// generate mine locations using a Durstenfeld shuffle
	const cells = Array.from({length: area}, (_, i) => i);
	for (var i = cells.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i+1));
		var temp = cells[i];
		cells[i] = cells[j];
		cells[j] = temp;
	}
	mineLocations = cells.slice(0,mines);
	document.getElementById("mineLocations").innerHTML = mineLocations;

	// create an array without mines
	gameState = [];
	while (gameState.length < area) {
		gameState.push(0);
	}

	// add each mine
	for (const mineLocation of mineLocations) {
		gameState[mineLocation] = 4;
	}
	document.getElementById("gameState").innerHTML = gameState;

	renderBoard();
}

// Direct clicks to 'reveal' or 'flag' functions
function clickEvent(event, cell) {
	if (event.shiftKey) {
		toggleFlag(cell);
	} else {
		reveal(cell);
	}
	document.getElementById("gameState").innerHTML = gameState;
}

// Flag or unflag cell
function toggleFlag(cell) {
	var cellState = gameState[cell];
	if (cellState == 0 || cellState == 4) {
		gameState[cell] = cellState + 1;
		renderBoard();
	} else if (cellState == 1 || cellState == 5) {
		gameState[cell] = cellState - 1;
		renderBoard();
	}
}

// Reveal cell
function reveal(cell) {
	var cellState = gameState[cell];
	if (cellState == 0 || cellState == 4) {
		gameState[cell] = cellState + 2;
		renderBoard();
	}
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
			var imageFile = imageSelector(cellCount);
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

function imageSelector(cellCount) {
	cellState = gameState[cellCount];
	if (cellState == 0 || cellState == 4) {
		return {src:"MinesweeperImages/hidden.png", alt:"Hidden"};
	} else if (cellState == 2) {
		return {src:"MinesweeperImages/empty.png", alt:"Empty"};
	} else if (cellState == 1 || cellState == 5) {
		return {src:"MinesweeperImages/flag.png", alt:"Flag"};
	} else if (cellState == 6) {
		return {src:"MinesweeperImages/bomb.png", alt:"Mine"};
	}
}

// Toggles debugging information
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
	reveal(1);
}
