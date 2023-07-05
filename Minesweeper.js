function setBoard() {
	// take user input
	var rows = parseInt(document.getElementById("rows").value);
	var columns = parseInt(document.getElementById("columns").value);
	var mines = parseInt(document.getElementById("mines").value); 
	if (rows > 0 && columns > 0 && mines > 0) {
		document.getElementById("boardTitle").innerHTML = "A " + rows + "x" + columns + " board with " + mines + " mines!";
	} else {
		document.getElementById("boardTitle").innerHTML = "Positive numbers only please!"
	}

	// calculate area
	var area = rows * columns;
	document.getElementById("boardArea").innerHTML = area;

	// generate mine locations using a Durstenfeld shuffle
	const cells = Array.from({length: area}, (_, i) => i + 1);
	for (var i = cells.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i+1));
		var temp = cells[i];
		cells[i] = cells[j];
		cells[j] = temp;
	}
	mineLocations = cells.slice(0,mines);
	document.getElementById("mineLocations").innerHTML = mineLocations;

	// create an array without mines
	const gameState = [];
	while (gameState.length < area) {
		gameState.push("0");
	}

	// add each mine
	for (const mineLocation of mineLocations) {
		gameState[mineLocation - 1] = 4;
	}
	document.getElementById("gameState").innerHTML = gameState;


	// remove old board
	if (x = document.getElementById("board")) {
		x.remove();
	}

	// create board
	var board = document.createElement("TABLE");
	board.setAttribute("id", "board");
	document.getElementById("boardCont").appendChild(board);

	// reset cell ticker
	var cellCount = 1;

	// add rows/cells
	for (let i = 0; i < rows; i++) {
		var row = document.createElement("TR");
		row.setAttribute("id", "row");
		document.getElementById("board").appendChild(row);

		for (let j = 0; j < columns; j++) {
			var cell = document.createElement("TD");
			cell.setAttribute("id",`Cell ${cellCount}`); 
			var button = document.createElement("BUTTON");
			button.innerHTML = gameState[cellCount - 1];
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
