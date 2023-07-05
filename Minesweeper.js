function setBoard() {
	var rows = parseInt(document.getElementById("rows").value);
	var columns = parseInt(document.getElementById("columns").value); 
	if (rows > 0 && columns > 0) {
		document.getElementById("boardTitle").innerHTML = rows + "x" + columns + " Board!";
	} else {
		document.getElementById("boardTitle").innerHTML = "Positive numbers only please!"
	}

	if (x = document.getElementById("board")) {
		x.remove();
	}

	var board = document.createElement("TABLE");
	board.setAttribute("id", "board");
	document.getElementById("boardCont").appendChild(board);
	
	for (let i = 0; i < rows; i++) {
		var row = document.createElement("TR");
		row.setAttribute("id", "row");
		document.getElementById("board").appendChild(row);

		for (let j = 0; j < columns; j++) {
			var cell = document.createElement("TD");
			var text = document.createTextNode("text node");
			cell.appendChild(text);
			row.appendChild(cell);
		}
	}
}
