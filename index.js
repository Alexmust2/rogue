
document.addEventListener("DOMContentLoaded", function () {
  const mapWidth = 40;
  const mapHeight = 24;
  const tileSize = 25;
  const gameMap = generateMap(mapWidth, mapHeight);
  let enemies = [];
  let hero;

  function generateMap(width, height) {
    const map = [];
    for (let i = 0; i < height; i++) {
      map[i] = [];
      for (let j = 0; j < width; j++) {
        map[i][j] = "W";
      }
    }
    return map;
  }

  function renderMap() {
    const fieldElement = document.querySelector(".field");
    fieldElement.innerHTML = "";
  
    for (let i = 0; i < gameMap.length; i++) {
      for (let j = 0; j < gameMap[i].length; j++) {
        const tileElement = document.createElement("div");
        tileElement.classList.add("tile");
        tileElement.classList.add(`tile${gameMap[i][j].toUpperCase()}`);
        tileElement.style.left = j * tileSize + "px";
        tileElement.style.top = i * tileSize + "px";
        fieldElement.appendChild(tileElement);
  
        if (gameMap[i][j] === "P") {
          const healthBarElement = document.createElement("div");
          healthBarElement.classList.add("health");
          healthBarElement.style.backgroundColor = "#00ff00";
          healthBarElement.style.position = "absolute";
          healthBarElement.style.left = "0px";
          healthBarElement.style.top = "0px";
          healthBarElement.style.width = (tileSize * (hero.health / 100)) + "px";
          healthBarElement.style.height = "3px";
          tileElement.appendChild(healthBarElement);
        }
  
        if (gameMap[i][j] === "E") {
          const healthBarElement = document.createElement("div");
          healthBarElement.classList.add("health");
          healthBarElement.style.position = "absolute";
          healthBarElement.style.left = "0px";
          healthBarElement.style.top = "0px";
          healthBarElement.style.width = (tileSize * (enemies.find(enemy => enemy.x === j && enemy.y === i).health / 100)) + "px";
          healthBarElement.style.height = "3px";
          tileElement.appendChild(healthBarElement);
        }
      }
    }
  }

  function placeRooms() {
    const numRooms = getRandomInt(5, 10);
    const roomOccupied = createOccupiedArray();

    for (let i = 0; i < numRooms; i++) {
      const roomWidth = getRandomInt(3, 8);
      const roomHeight = getRandomInt(3, 8);

      let roomPlaced = false;

      for (let attempt = 0; attempt < 10; attempt++) {
        const startX = getRandomInt(1, mapWidth - roomWidth - 2);
        const startY = getRandomInt(1, mapHeight - roomHeight - 2);

        let overlap = false;
        for (let x = startX - 1; x < startX + roomWidth + 1; x++) {
          for (let y = startY - 1; y < startY + roomHeight + 1; y++) {
            if (roomOccupied[y] && roomOccupied[y][x]) {
              overlap = true;
              break;
            }
          }
          if (overlap) break;
        }

        if (!overlap) {
          for (let x = startX; x < startX + roomWidth; x++) {
            for (let y = startY; y < startY + roomHeight; y++) {
              gameMap[y][x] = "F";
              roomOccupied[y][x] = true;
            }
          }
          roomPlaced = true;
          break;
        }
      }
    }
  }

  function createOccupiedArray() {
    const array = [];
    for (let i = 0; i < mapHeight; i++) {
      array[i] = [];
      for (let j = 0; j < mapWidth; j++) {
        array[i][j] = false;
      }
    }
    return array;
  }

  function placeItems() {
    for (let i = 0; i < 2; i++) {
      placeItem("SW");
    }

    for (let i = 0; i < 10; i++) {
      placeItem("HP");
    }
  }

  function placeItem(itemType) {
    let itemPlaced = false;

    while (!itemPlaced) {
      const x = getRandomInt(0, mapWidth - 1);
      const y = getRandomInt(0, mapHeight - 1);

      if (gameMap[y][x] === "F") {
        gameMap[y][x] = itemType;
        itemPlaced = true;
      }
    }
  }

  function placeCorridors() {
    const numCorridors = {
      vertical: getRandomInt(3, 5),
      horizontal: getRandomInt(3, 5),
    };

    for (let i = 0; i < numCorridors.vertical; i++) {
      const corridorHeight = mapHeight;
      const corridorWidth = 1;
      const corridorX = getRandomInt(1, mapWidth - corridorWidth - 2);
      const corridorY = getRandomInt(1, mapHeight - corridorHeight - 2);

      for (let y = corridorY; y < corridorY + corridorHeight; y++) {
        if (gameMap[y]) {
          gameMap[y][corridorX] = "C";
        }
      }
    }

    for (let i = 0; i < numCorridors.horizontal; i++) {
      const corridorHeight = 1;
      const corridorWidth = mapWidth;
      const corridorX = getRandomInt(1, mapWidth - corridorWidth - 2);
      const corridorY = getRandomInt(1, mapHeight - corridorHeight - 2);

      for (let x = corridorX; x < corridorX + corridorWidth; x++) {
        if (gameMap[corridorY]) {
          gameMap[corridorY][x] = "C";
        }
      }
    }
  }

  function connectRooms() {
    const roomsAndCorridors = [];

    for (let i = 1; i < mapHeight - 1; i++) {
      for (let j = 1; j < mapWidth - 1; j++) {
        if (gameMap[i][j] === "F" || gameMap[i][j] === "C") {
          roomsAndCorridors.push({ x: j, y: i });
        }
      }
    }

    for (let i = 0; i < roomsAndCorridors.length; i++) {
      const currentRoomOrCorridor = roomsAndCorridors[i];
      const targetRoomOrCorridor = getRandomElement(
        roomsAndCorridors.filter(
          (roomOrCorridor) => roomOrCorridor !== currentRoomOrCorridor
        )
      );

      if (!isConnected(currentRoomOrCorridor, targetRoomOrCorridor)) {
        connectTwoPoints(currentRoomOrCorridor, targetRoomOrCorridor);
      }
    }
  }

  function connectTwoPoints(point1, point2) {
    let x = point1.x;
    let y = point1.y;

    while (x !== point2.x) {
      gameMap[y][x] = "F";
      x += (point2.x - point1.x) / Math.abs(point2.x - point1.x);
    }

    while (y !== point2.y) {
      gameMap[y][x] = "F";
      y += (point2.y - point1.y) / Math.abs(point2.y - point1.y);
    }
  }

  function isConnected(point1, point2) {
    const minX = Math.min(point1.x, point2.x);
    const maxX = Math.max(point1.x, point2.x);
    const minY = Math.min(point1.y, point2.y);
    const maxY = Math.max(point1.y, point2.y);

    for (let x = minX; x <= maxX; x++) {
      if (gameMap[point1.y][x] === "F" && !isVerticalObstacle(minY, maxY, x)) {
        return true;
      }
    }

    for (let y = minY; y <= maxY; y++) {
      if (gameMap[y][point1.x] === "F" && !isHorizontalObstacle(minX, maxX, y)) {
        return true;
      }
    }

    return false;
  }

  function isVerticalObstacle(minY, maxY, x) {
    for (let y = minY; y <= maxY; y++) {
      if (gameMap[y][x] !== "F") {
        return true;
      }
    }
    return false;
  }

  function isHorizontalObstacle(minX, maxX, y) {
    for (let x = minX; x <= maxX; x++) {
      if (gameMap[y][x] !== "F") {
        return true;
      }
    }
    return false;
  }

  function getRandomElement(array) {
    const randomIndex = getRandomInt(0, array.length - 1);
    return array[randomIndex];
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  
  class Character {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.type = type;
      this.health = 100;
      this.attackPower = 10;
    }

    move(dx, dy) {
      const targetX = this.x + dx;
      const targetY = this.y + dy;
  
      if (
        gameMap[targetY] &&
        gameMap[targetY][targetX] &&
        (gameMap[targetY][targetX] === "F" ||
          gameMap[targetY][targetX] === "C" ||
          gameMap[targetY][targetX] === "HP" && this.type === "P" ||
          gameMap[targetY][targetX] === "SW" && this.type === "P")
      ) {
        if (gameMap[targetY][targetX] === "HP") {
          gameMap[targetY][targetX] = "F";
          if(hero.health != 100) {
            this.health += 20;
          }
        } else if (gameMap[targetY][targetX] === "SW") {
          gameMap[targetY][targetX] = "F";

          this.attackPower += 10
        }
  
        gameMap[this.y][this.x] = "F";
        this.x = targetX;         
        this.y = targetY;
        gameMap[this.y][this.x] = this.type;
      }
    }

    attack() {
      const targets = this.getAdjacentEnemies();
      for (const target of targets) {
        const targetEnemy = enemies.find(enemy => enemy.x === target.x && enemy.y === target.y);
        if (targetEnemy) {
          targetEnemy.health -= this.attackPower;
          console.log(targetEnemy.health);
          if (targetEnemy.health <= 0) {
            gameMap[targetEnemy.y][targetEnemy.x] = "F";
            enemies = enemies.filter(enemy => enemy !== targetEnemy);
          } else {
            const healthBarElement = document.querySelector(`.tile${targetEnemy.type} .health`);
            healthBarElement.style.width = (tileSize * (targetEnemy.health / 100)) + "px";
          }
        }
      }
      renderMap();
    }
    
    
    
    getAdjacentEnemies() {
      const targets = [];
      const offsets = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
    
      for (const offset of offsets) {
        const targetX = this.x + offset.x;
        const targetY = this.y + offset.y;
    
        if (
          targetY >= 0 && targetY < gameMap.length &&
          targetX >= 0 && targetX < gameMap[targetY].length &&
          gameMap[targetY][targetX] === "E"
        ) {
          targets.push({ x: targetX, y: targetY });
        }
      }
      return targets;
    }
}

  function spawnHeroRandomly() {
    let heroSpawned = false;
  
    while (!heroSpawned) {
      const x = getRandomInt(0, mapWidth - 1);
      const y = getRandomInt(0, mapHeight - 1);
  
      if (gameMap[y][x] === "F") {
        hero = new Character(x, y, "P");
        gameMap[hero.y][hero.x] = "P";
        heroSpawned = true;
      }
    }
  }

  function spawnEnemies() {
  
    for (let i = 0; i < 10; i++) {
      let enemySpawned = false;
  
      while (!enemySpawned) {
        const x = getRandomInt(0, mapWidth - 1);
        const y = getRandomInt(0, mapHeight - 1);
  
        if (gameMap[y][x] === "F") {
          const enemy = new Character(x, y, "E");
          gameMap[enemy.y][enemy.x] = "E";
          enemies.push(enemy);
          enemySpawned = true;
        }
      }
    }
  
    return enemies;
  }
  
  const keyState = {};

  document.addEventListener("keydown", function (event) {
    if (!keyState[event.code]) {
      keyState[event.code] = true;
  
      switch (event.code) {
        case "KeyW":
          hero.move(0, -1);
          break;
        case "KeyS":
          hero.move(0, 1);
          break;
        case "KeyA":
          hero.move(-1, 0);
          break;
        case "KeyD":
          hero.move(1, 0);
          break;
        case "Space":
          hero.attack();
          renderMap();
          break;
      }
  
      renderMap();
    }
  });
  
  document.addEventListener("keyup", function (event) {
    keyState[event.code] = false;
  });

  function updateEnemies() {
    for (const enemy of enemies) {
      const heroAdjacent = isHeroAdjacent(enemy);
  
      if (heroAdjacent) {
        enemyAttack(enemy);
      } else {
        const direction = getRandomInt(0, 3);
        switch (direction) {
          case 0:
            enemy.move(0, -1);
            break;
          case 1:
            enemy.move(0, 1);
            break;
          case 2:
            enemy.move(-1, 0);
            break;
          case 3:
            enemy.move(1, 0);
            break;
        }
      }
    }
    renderMap();
  }
  
  function isHeroAdjacent(enemy) {
    const offsets = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
  
    for (const offset of offsets) {
      const targetX = enemy.x + offset.x;
      const targetY = enemy.y + offset.y;
  
      if (
        targetY >= 0 &&
        targetY < gameMap.length &&
        targetX >= 0 &&
        targetX < gameMap[targetY].length &&
        gameMap[targetY][targetX] === "P"
      ) {
        return true;
      }
    }
  
    return false;
  }
  
  function enemyAttack(enemy) {
    hero.health -= enemy.attackPower;
  
    if (hero.health <= 0) {
      location.reload();
    } else {
      const healthBarElement = document.querySelector(`.tile${hero.type} .health`);
      healthBarElement.style.width = (tileSize * (hero.health / 100)) + "px";
    }
  }

    setInterval(() => {
      updateEnemies()
      this
    }, 1500)

  placeRooms();
  placeCorridors();
  connectRooms();
  placeItems();
  spawnHeroRandomly();
  spawnEnemies();
  updateEnemies()
  renderMap();
});


