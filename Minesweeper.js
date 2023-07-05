function setBoard() {
	//take user input
	var rows = parseInt(document.getElementById("rows").value);
	var columns = parseInt(document.getElementById("columns").value); 
	if (rows > 0 && columns > 0) {
		document.getElementById("boardTitle").innerHTML = rows + "x" + columns + " Board!";
	} else {
		document.getElementById("boardTitle").innerHTML = "Positive numbers only please!"
	}

	//remove old boards
	if (x = document.getElementById("board")) {
		x.remove();
	}

	//create table
	var board = document.createElement("TABLE");
	board.setAttribute("id", "board");
	document.getElementById("boardCont").appendChild(board);

	//reset cell ticker
	var cellCount = 1;

	//Add rows/columns
	for (let i = 0; i < rows; i++) {
		var row = document.createElement("TR");
		row.setAttribute("id", "row");
		document.getElementById("board").appendChild(row);

		for (let j = 0; j < columns; j++) {
			var cell = document.createElement("TD");
			var text = document.createTextNode(`Cell ${cellCount}`);
			cell.appendChild(text);
			row.appendChild(cell);
			cellCount++;
		}
	}
}
