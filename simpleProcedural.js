function SimpleProcedural (seed, width, height, mapsettings, tiles) {
	this.map = [];
	this.width = width || 500;
	this.height = height || 500;

	mapsettings = mapsettings || {};
	this.waterlevel = mapsettings.waterlevel || .3;
	this.houselevel = mapsettings.houselevel || .1;
	this.boatlevel = mapsettings.boatlevel || .5;
	this.zoom = mapsettings.zoom || 1;

	this.tiles = tiles || ["ground", "water", "house", "boat"];
	noise.seed(seed || Math.random());
}

SimpleProcedural.prototype.printToConsole = function printToConsole (currentMap) {
	currentMap = currentMap || this.map;
	console.log("The generated map:");
	for (var y = 0; y < this.height; y++) {
		var row = "";
		for (var x = 0; x < this.width; x++) {
			if (currentMap[x]) {
				row += currentMap[x][y];
			}
		}
		console.log(row);
	}
	return this;
};

SimpleProcedural.prototype.printToDom = function printToDom (element, currentMap) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
	currentMap = currentMap || this.map;
	for (var y = 0; y < this.height; y++) {
		var row = "";
		for (var x = 0; x < this.width; x++) {
			if (currentMap[x]) {
				row += currentMap[x][y];
			}
		}
		element.appendChild(document.createElement("br"));
		element.appendChild(document.createTextNode(row));
	}
	return this;
};

SimpleProcedural.prototype.generateMap = function generateMap (currentMap) {
	currentMap = currentMap || this.map;
	currentMap.length = 0;
	for (var k = 0; k < this.tiles.length; k++) {
		if (typeof this.tiles[k] === "function") {
			this.tiles[k](this.map, this.width, this.height, this);
		} else if (typeof this.tileFunctions[this.tiles[k]] === "function") {
			this.tileFunctions[this.tiles[k]](this.map, this.width, this.height, this);
		} else {
			console.log("UNDEFINED TILE: ", this.tiles[k]);
		}
	}
	return this;
};

SimpleProcedural.prototype.tileFunctions = {};
SimpleProcedural.prototype.tileFunctions.ground = function ground (currentMap, width, height) {
	for (var x = 0; x < width; x++) {
		currentMap[x] = currentMap[x] || [];
		for (var y = 0; y < height; y++) {
			currentMap[x][y] = "#";
		}
	}
};

SimpleProcedural.prototype.tileFunctions.water = function water (currentMap, width, height, settings) {
	for (var x = 0; x < width; x++) {
		currentMap[x] = currentMap[x] || [];
		for (var y = 0; y < height; y++) {
			if (Math.abs(noise.perlin2(x / (width * settings.zoom), y / (height * settings.zoom))) < settings.waterlevel) {
				currentMap[x][y] = "~";
			}
		}
	}
};

SimpleProcedural.prototype.tileFunctions.house = function house (currentMap, width, height, settings) {
	for (var x = 0; x < width; x++) {
		currentMap[x] = currentMap[x] || [];
		for (var y = 0; y < height; y++) {
			if (currentMap[x][y] === "#" && Math.random() < settings.houselevel) {
				currentMap[x][y] = "H";
			}
		}
	}
};

SimpleProcedural.prototype.tileFunctions.boat = function boat (currentMap, width, height, settings) {
	for (var x = 0; x < width; x++) {
		currentMap[x] = currentMap[x] || [];
		for (var y = 0; y < height; y++) {
			if (neighboursContain(currentMap, x, y, "~", true)
			&& neighboursContain(currentMap, x, y, "H")
			&& Math.random() < settings.boatlevel) {
				currentMap[x][y] = "U";
			}
		}
	}
	
	function neighboursContain (map, x, y, target, direct) {
		if ((map[x - 1] &&(
				(!direct && map[x - 1][y - 1] === target) ||
				map[x - 1][y    ] === target ||
				(!direct && map[x - 1][y + 1] === target))) ||
			(map[x] && (
				map[x    ][y - 1] === target ||
				map[x    ][y + 1] === target)) ||
			(map[x + 1] && (
				(!direct && map[x + 1][y - 1] === target) ||
				map[x + 1][y    ] === target ||
				(!direct && map[x + 1][y + 1] === target)))) {
			return true;
		}
		return false;
	};
};