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

function clickEvent(event, cell) {
	if (event.shiftKey) {
		toggleFlag(cell);
	} else {
		reveal(cell);
	}
}

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

function reveal(cell) {
	var cellState = gameState[cell];
	if (cellState == 0 || cellState == 4) {
		gameState[cell] = cellState + 2;
		renderBoard();
	}
}

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
			cell.setAttribute("id",`Cell ${cellCount}`); 
			var button = document.createElement("BUTTON");
			button.innerHTML = gameState[cellCount];
			button.setAttribute("onclick", `clickEvent(event, ${cellCount})`);
			cell.appendChild(button);
			row.appendChild(cell);
			cellCount++;
		}
	}

}

function toggleDebugging() {
	let debugging = document.getElementById("debugging");
	let hidden = debugging.getAttribute("hidden");
	if (hidden) {
		debugging.removeAttribute("hidden");
	} else {
		debugging.setAttribute("hidden", "hidden");
	}
}

function test() {
	reveal(1);
}
