// Game state
const gameState = {
    coins: 100,
    level: 1,
    happiness: 50,
    activeBall: 'canada',
    ownedBalls: ['canada'],
    availableBalls: [
        { id: 'usa', name: 'USA Ball', price: 150 },
        { id: 'uk', name: 'UK Ball', price: 200 },
        { id: 'france', name: 'France Ball', price: 250 },
        { id: 'germany', name: 'Germany Ball', price: 300 },
        { id: 'japan', name: 'Japan Ball', price: 350 }
    ]
};

// DOM elements
const coinsElement = document.getElementById('coins');
const levelElement = document.getElementById('level');
const happinessElement = document.getElementById('happiness');
const feedButton = document.getElementById('feed-btn');
const playButton = document.getElementById('play-btn');
const ballCollection = document.getElementById('ball-collection');
const availableBallsContainer = document.querySelector('.available-balls');

// World functionality
const enterWorldBtn = document.getElementById('enter-world-btn');
const worldContainer = document.getElementById('world-container');
const returnBtn = document.getElementById('return-btn');
const goParkBtn = document.getElementById('go-park-btn');
const goMarketBtn = document.getElementById('go-market-btn');
const goHomeBtn = document.getElementById('go-home-btn');
const worldAreas = document.querySelectorAll('.world-area');
const playerBall = document.getElementById('player-ball');
const inventoryItems = document.getElementById('inventory-items');

// World state
const worldState = {
    currentArea: 'home',
    inventory: [],
    playerPosition: { x: 1000, y: 1000 } // center of the 2000x2000 world
};

// Update DOM elements
const worldContainers = document.querySelectorAll('.world-area-container');
const miniMapPlayerHome = document.getElementById('mini-map-player-home');
const miniMapPlayerPark = document.getElementById('mini-map-player-park');
const miniMapPlayerMarket = document.getElementById('mini-map-player-market');

// Add these variables to track screen states
let isInSupermarket = false;
let isInParkActivities = false;

// Add these DOM elements
const marketBuilding = document.querySelector('.market-building');
const parkBuilding = document.querySelector('.park-building');
const supermarketSign = document.querySelector('.supermarket-sign');
const parkSign = document.querySelector('.park-sign');

// Initialize the game
function initGame() {
    updateStats();
    renderAvailableBalls();
    
    // Add event listeners
    feedButton.addEventListener('click', feedBall);
    playButton.addEventListener('click', playWithBall);
    
    // Start happiness decay
    setInterval(decreaseHappiness, 10000);
    
    // Start passive income
    setInterval(passiveIncome, 5000);
}

// Update game stats display
function updateStats() {
    coinsElement.textContent = gameState.coins;
    levelElement.textContent = gameState.level;
    happinessElement.textContent = gameState.happiness;
}

// Render available balls for adoption
function renderAvailableBalls() {
    availableBallsContainer.innerHTML = '';
    
    gameState.availableBalls.forEach(ball => {
        if (!gameState.ownedBalls.includes(ball.id)) {
            const ballElement = document.createElement('div');
            ballElement.className = 'ball-item';
            ballElement.innerHTML = `
                <div class="ball ${ball.id}-ball locked">
                    <div class="eyes"></div>
                </div>
                <div class="ball-name">${ball.name}</div>
                <div class="ball-price">${ball.price} coins</div>
                <button class="adopt-btn" data-id="${ball.id}">Adopt</button>
            `;
            
            const adoptButton = ballElement.querySelector('.adopt-btn');
            adoptButton.addEventListener('click', () => adoptBall(ball));
            
            availableBallsContainer.appendChild(ballElement);
        }
    });
}

// Feed the ball to increase happiness
function feedBall() {
    if (gameState.coins >= 5) {
        gameState.coins -= 5;
        gameState.happiness = Math.min(100, gameState.happiness + 10);
        updateStats();
    } else {
        alert("Not enough coins!");
    }
}

// Play with the ball to increase happiness
function playWithBall() {
    if (gameState.coins >= 10) {
        gameState.coins -= 10;
        gameState.happiness = Math.min(100, gameState.happiness + 25);
        updateStats();
    } else {
        alert("Not enough coins!");
    }
}

// Adopt a new ball
function adoptBall(ball) {
    if (gameState.coins >= ball.price) {
        gameState.coins -= ball.price;
        gameState.ownedBalls.push(ball.id);
        
        // Add to collection
        const ballElement = document.createElement('div');
        ballElement.className = 'ball-item owned';
        ballElement.innerHTML = `
            <div class="ball ${ball.id}-ball">
                <div class="eyes"></div>
            </div>
            <div class="ball-name">${ball.name}</div>
            <button class="select-btn" data-id="${ball.id}">Select</button>
        `;
        
        const selectButton = ballElement.querySelector('.select-btn');
        selectButton.addEventListener('click', () => selectBall(ball.id, ball.name));
        
        ballCollection.appendChild(ballElement);
        
        // Update available balls
        renderAvailableBalls();
        updateStats();
    } else {
        alert("Not enough coins to adopt this ball!");
    }
}

// Select a ball to make active
function selectBall(ballId, ballName) {
    gameState.activeBall = ballId;
    
    // Update active ball display
    const activeBallElement = document.getElementById('active-ball');
    activeBallElement.className = `ball ${ballId}-ball`;
    
    // Update ball name
    document.querySelector('.current-ball .ball-name').textContent = ballName;
}

// Decrease happiness over time
function decreaseHappiness() {
    gameState.happiness = Math.max(0, gameState.happiness - 5);
    updateStats();
}

// Passive income based on happiness and level
function passiveIncome() {
    const income = Math.floor((gameState.happiness / 10) * gameState.level);
    gameState.coins += income;
    
    // Level up if enough coins
    if (gameState.coins >= gameState.level * 500) {
        gameState.level++;
    }
    
    updateStats();
}

// Initialize the game when the page loads
window.addEventListener('load', initGame);

// Initialize world
function initWorld() {
    enterWorldBtn.addEventListener('click', toggleWorld);
    returnBtn.addEventListener('click', toggleWorld);
    goParkBtn.addEventListener('click', () => changeArea('park'));
    goMarketBtn.addEventListener('click', () => changeArea('market'));
    goHomeBtn.addEventListener('click', () => changeArea('home'));
    
    // Set up buy buttons
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const foodItem = e.target.closest('.food-item');
            const name = foodItem.dataset.name;
            const price = parseInt(foodItem.dataset.price);
            buyFood(name, price);
        });
    });
    
    // Set up player movement
    document.addEventListener('keydown', movePlayer);
    
    // Initialize player ball appearance
    updatePlayerBall();
    
    // Add event listeners for interactive buildings
    if (marketBuilding) {
        marketBuilding.addEventListener('click', () => {
            changeArea('market');
            setTimeout(() => enterSupermarket(), 500);
        });
    }
    
    if (parkBuilding) {
        parkBuilding.addEventListener('click', () => {
            changeArea('park');
            setTimeout(() => enterParkActivities(), 500);
        });
    }
    
    if (supermarketSign) {
        supermarketSign.addEventListener('click', enterSupermarket);
    }
    
    if (parkSign) {
        parkSign.addEventListener('click', enterParkActivities);
    }
    
    // Add collision detection for buildings
    setInterval(checkBuildingCollisions, 100);
}

// Toggle world visibility
function toggleWorld() {
    if (worldContainer.classList.contains('hidden')) {
        worldContainer.classList.remove('hidden');
        updatePlayerBall();
    } else {
        worldContainer.classList.add('hidden');
    }
}

// Change area in the world
function changeArea(area) {
    worldState.currentArea = area;
    
    // Hide all areas
    worldAreas.forEach(areaElement => {
        areaElement.classList.remove('active');
    });
    
    // Show selected area
    document.getElementById(`world-${area}`).classList.add('active');
    
    // Update player ball appearance
    updatePlayerBall();
    
    // Update camera position
    updateCameraPosition();
}

// Update player ball appearance
function updatePlayerBall() {
    // Get the current player ball based on area
    let currentPlayerBall;
    switch(worldState.currentArea) {
        case 'home':
            currentPlayerBall = document.getElementById('player-ball');
            break;
        case 'park':
            currentPlayerBall = document.getElementById('player-ball-park');
            break;
        case 'market':
            currentPlayerBall = document.getElementById('player-ball-market');
            break;
    }
    
    // Update class
    currentPlayerBall.className = 'player-ball';
    currentPlayerBall.classList.add(`${gameState.activeBall}-ball`);
    
    // Add eyes if needed
    if (!currentPlayerBall.querySelector('.eyes')) {
        const eyes = document.createElement('div');
        eyes.className = 'eyes';
        currentPlayerBall.appendChild(eyes);
    }
    
    // Update position
    updatePlayerPosition();
}

// Update player position
function updatePlayerPosition() {
    // Get the current player ball based on area
    let currentPlayerBall;
    let currentPositionDisplay;
    let currentMiniMapPlayer;
    
    switch(worldState.currentArea) {
        case 'home':
            currentPlayerBall = document.getElementById('player-ball');
            currentPositionDisplay = document.getElementById('position-display');
            currentMiniMapPlayer = miniMapPlayerHome;
            break;
        case 'park':
            currentPlayerBall = document.getElementById('player-ball-park');
            currentPositionDisplay = document.getElementById('position-display-park');
            currentMiniMapPlayer = miniMapPlayerPark;
            break;
        case 'market':
            currentPlayerBall = document.getElementById('player-ball-market');
            currentPositionDisplay = document.getElementById('position-display-market');
            currentMiniMapPlayer = miniMapPlayerMarket;
            break;
    }
    
    // Update ball position
    currentPlayerBall.style.left = `${worldState.playerPosition.x}px`;
    currentPlayerBall.style.top = `${worldState.playerPosition.y}px`;
    
    // Update position display
    currentPositionDisplay.textContent = `${Math.round(worldState.playerPosition.x)}, ${Math.round(worldState.playerPosition.y)}`;
    
    // Update mini-map
    const miniMapX = (worldState.playerPosition.x / 2000) * 100;
    const miniMapY = (worldState.playerPosition.y / 2000) * 100;
    currentMiniMapPlayer.style.left = `${miniMapX}%`;
    currentMiniMapPlayer.style.top = `${miniMapY}%`;
    
    // Update camera position
    updateCameraPosition();
}

// Update camera position function
function updateCameraPosition() {
    const currentContainer = document.querySelector(`#world-${worldState.currentArea} .world-area-container`);
    const sceneElement = document.querySelector(`#world-${worldState.currentArea} .scene`);
    const sceneWidth = sceneElement.offsetWidth;
    const sceneHeight = sceneElement.offsetHeight;
    
    // Get current player ball position
    let playerX, playerY;
    const currentPlayerBall = document.querySelector(`#world-${worldState.currentArea} .player-ball`);
    
    if (currentPlayerBall) {
        playerX = parseInt(currentPlayerBall.style.left) || worldState.playerPosition.x;
        playerY = parseInt(currentPlayerBall.style.top) || worldState.playerPosition.y;
    } else {
        playerX = worldState.playerPosition.x;
        playerY = worldState.playerPosition.y;
    }
    
    // Calculate camera position (centered on player)
    const cameraX = playerX - (sceneWidth / 2);
    const cameraY = playerY - (sceneHeight / 2);
    
    // Constrain camera to world boundaries
    const constrainedX = Math.max(0, Math.min(2000 - sceneWidth, cameraX));
    const constrainedY = Math.max(0, Math.min(2000 - sceneHeight, cameraY));
    
    // Apply camera position with smooth transition
    currentContainer.style.transition = 'transform 0.2s ease-out';
    currentContainer.style.transform = `translate(${-constrainedX}px, ${-constrainedY}px)`;
}

// Add collision detection for world objects
function checkCollision(x, y, worldArea) {
    // Get all objects in the current world area
    const objects = worldArea.querySelectorAll('.world-object');
    
    // Define player size
    const playerSize = 50; // Width/height of player ball
    
    // Check collision with each object
    for (let obj of objects) {
        // Get object position and size
        const objRect = obj.getBoundingClientRect();
        const objLeft = parseInt(obj.style.left);
        const objTop = parseInt(obj.style.top);
        const objWidth = objRect.width;
        const objHeight = objRect.height;
        
        // Simple collision detection
        if (x < objLeft + objWidth &&
            x + playerSize > objLeft &&
            y < objTop + objHeight &&
            y + playerSize > objTop) {
            return true; // Collision detected
        }
    }
    
    return false; // No collision
}

// Update player movement to include collision detection
function movePlayer(direction, worldArea, playerBall, positionDisplay) {
    // Get current position
    let currentLeft = parseInt(playerBall.style.left) || 0;
    let currentTop = parseInt(playerBall.style.top) || 0;
    
    // Calculate new position
    let newLeft = currentLeft;
    let newTop = currentTop;
    const moveStep = 20;
    
    switch(direction) {
        case 'up':
            newTop = currentTop - moveStep;
            break;
        case 'down':
            newTop = currentTop + moveStep;
            break;
        case 'left':
            newLeft = currentLeft - moveStep;
            break;
        case 'right':
            newLeft = currentLeft + moveStep;
            break;
    }
    
    // Check boundaries
    if (newLeft < 0) newLeft = 0;
    if (newTop < 0) newTop = 0;
    if (newLeft > 1950) newLeft = 1950;
    if (newTop > 1950) newTop = 1950;
    
    // Check for collisions
    if (!checkCollision(newLeft, newTop, worldArea)) {
        // No collision, update position
        playerBall.style.left = newLeft + 'px';
        playerBall.style.top = newTop + 'px';
        
        // Update worldState position to keep track
        worldState.playerPosition.x = newLeft;
        worldState.playerPosition.y = newTop;
        
        // Update position display
        positionDisplay.textContent = `${newLeft}, ${newTop}`;
        
        // Update mini-map
        updateMiniMap(newLeft, newTop, worldArea);
        
        // Update camera to follow player
        updateCameraPosition();
    }
}

// Add this to your existing event listeners
document.addEventListener('keydown', function(e) {
    if (worldContainer.classList.contains('hidden')) return;
    
    const activeArea = document.querySelector('.world-area.active');
    const playerBall = activeArea.querySelector('.player-ball');
    const positionDisplay = activeArea.querySelector('.position-indicator span');
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
            movePlayer('up', activeArea, playerBall, positionDisplay);
            break;
        case 'ArrowDown':
        case 's':
            movePlayer('down', activeArea, playerBall, positionDisplay);
            break;
        case 'ArrowLeft':
        case 'a':
            movePlayer('left', activeArea, playerBall, positionDisplay);
            break;
        case 'ArrowRight':
        case 'd':
            movePlayer('right', activeArea, playerBall, positionDisplay);
            break;
    }
});

// Update mini-map position
function updateMiniMap(x, y, worldArea) {
    const miniMapPlayer = worldArea.querySelector('.mini-map-player');
    if (miniMapPlayer) {
        // Scale down coordinates to fit mini-map
        const miniMapX = (x / 2000) * 100;
        const miniMapY = (y / 2000) * 100;
        
        miniMapPlayer.style.left = miniMapX + '%';
        miniMapPlayer.style.top = miniMapY + '%';
    }
}

// Buy food from market
function buyFood(name, price) {
    if (gameState.coins >= price) {
        gameState.coins -= price;
        worldState.inventory.push({ type: 'food', name, icon: getFoodIcon(name) });
        updateStats();
        updateInventory();
        alert(`You bought ${name}!`);
    } else {
        alert("Not enough coins!");
    }
}

// Get food icon based on name
function getFoodIcon(name) {
    const icons = {
        'Pizza': '🍕',
        'Ice Cream': '🍦',
        'Burger': '🍔'
    };
    return icons[name] || '🍽️';
}

// Update inventory display
function updateInventory() {
    inventoryItems.innerHTML = '';
    
    worldState.inventory.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.innerHTML = `
            <div class="inventory-icon">${item.icon}</div>
            <div class="inventory-name">${item.name}</div>
        `;
        
        // Add click event to use food
        itemElement.addEventListener('click', () => useItem(index));
        
        inventoryItems.appendChild(itemElement);
    });
}

// Use item from inventory
function useItem(index) {
    const item = worldState.inventory[index];
    
    if (item.type === 'food') {
        const useFood = confirm(`Do you want to eat ${item.name}?`);
        
        if (useFood) {
            // Remove from inventory
            worldState.inventory.splice(index, 1);
            
            // Increase happiness
            gameState.happiness = Math.min(100, gameState.happiness + 15);
            
            updateInventory();
            updateStats();
            alert(`Your ball enjoyed the ${item.name}! Happiness increased.`);
        }
    }
}

// Function to check for collisions with buildings
function checkBuildingCollisions() {
    if (worldContainer.classList.contains('hidden')) return;
    
    const playerX = worldState.playerPosition.x;
    const playerY = worldState.playerPosition.y;
    const playerRadius = 25; // Half of player ball width
    
    // Check collision based on current area
    switch(worldState.currentArea) {
        case 'home':
            // Check market building collision
            if (marketBuilding) {
                const marketRect = {
                    x: parseInt(marketBuilding.style.left),
                    y: parseInt(marketBuilding.style.top),
                    width: 120,
                    height: 120
                };
                
                if (checkCollision(playerX, playerY, worldAreas[0])) {
                    createEnterEffect(playerX, playerY);
                    changeArea('market');
                    setTimeout(() => enterSupermarket(), 500);
                }
            }
            
            // Check park building collision
            if (parkBuilding) {
                const parkRect = {
                    x: parseInt(parkBuilding.style.left),
                    y: parseInt(parkBuilding.style.top),
                    width: 120,
                    height: 120
                };
                
                if (checkCollision(playerX, playerY, worldAreas[1])) {
                    createEnterEffect(playerX, playerY);
                    changeArea('park');
                    setTimeout(() => enterParkActivities(), 500);
                }
            }
            break;
            
        case 'market':
            // Check supermarket sign collision
            if (supermarketSign) {
                const signRect = {
                    x: parseInt(supermarketSign.style.left),
                    y: parseInt(supermarketSign.style.top),
                    width: 80,
                    height: 120
                };
                
                if (checkCollision(playerX, playerY, worldAreas[2])) {
                    createEnterEffect(playerX, playerY);
                    enterSupermarket();
                }
            }
            break;
            
        case 'park':
            // Check park sign collision
            if (parkSign) {
                const signRect = {
                    x: parseInt(parkSign.style.left),
                    y: parseInt(parkSign.style.top),
                    width: 80,
                    height: 120
                };
                
                if (checkCollision(playerX, playerY, worldAreas[1])) {
                    createEnterEffect(playerX, playerY);
                    enterParkActivities();
                }
            }
            break;
    }
}

// Function to enter the supermarket
function enterSupermarket() {
    if (isInSupermarket) return;
    
    // Create supermarket screen if it doesn't exist
    let supermarketScreen = document.querySelector('.supermarket-screen');
    if (!supermarketScreen) {
        supermarketScreen = document.createElement('div');
        supermarketScreen.className = 'supermarket-screen';
        supermarketScreen.innerHTML = `
            <h3>Supermarket</h3>
            <div class="supermarket-items">
                <div class="food-item" data-name="Pizza" data-price="15">
                    <div class="food-icon">🍕</div>
                    <div class="food-name">Pizza</div>
                    <div class="food-price">15 coins</div>
                    <button class="buy-btn">Buy</button>
                </div>
                <div class="food-item" data-name="Ice Cream" data-price="10">
                    <div class="food-icon">🍦</div>
                    <div class="food-name">Ice Cream</div>
                    <div class="food-price">10 coins</div>
                    <button class="buy-btn">Buy</button>
                </div>
                <div class="food-item" data-name="Burger" data-price="20">
                    <div class="food-icon">🍔</div>
                    <div class="food-name">Burger</div>
                    <div class="food-price">20 coins</div>
                    <button class="buy-btn">Buy</button>
                </div>
                <div class="food-item" data-name="Sushi" data-price="25">
                    <div class="food-icon">🍣</div>
                    <div class="food-name">Sushi</div>
                    <div class="food-price">25 coins</div>
                    <button class="buy-btn">Buy</button>
                </div>
            </div>
            <button class="back-to-world-btn">Back to World</button>
            <div class="exit-door">
                <div class="exit-sign">EXIT</div>
            </div>
        `;
        
        document.querySelector(`#world-${worldState.currentArea} .scene`).appendChild(supermarketScreen);
        
        // Add event listeners for buy buttons
        const buyButtons = supermarketScreen.querySelectorAll('.buy-btn');
        buyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const foodItem = e.target.closest('.food-item');
                const name = foodItem.dataset.name;
                const price = parseInt(foodItem.dataset.price);
                buyFood(name, price);
            });
        });
        
        // Add event listener for back button
        const backButton = supermarketScreen.querySelector('.back-to-world-btn');
        backButton.addEventListener('click', exitSupermarket);
        
        // Add event listener for exit door
        const exitDoor = supermarketScreen.querySelector('.exit-door');
        exitDoor.addEventListener('click', exitSupermarket);
    }
    
    // Show supermarket screen
    supermarketScreen.classList.add('active');
    isInSupermarket = true;
}

// Function to exit the supermarket
function exitSupermarket() {
    const supermarketScreen = document.querySelector('.supermarket-screen');
    if (supermarketScreen) {
        supermarketScreen.classList.remove('active');
    }
    isInSupermarket = false;
}

// Function to enter park activities
function enterParkActivities() {
    if (isInParkActivities) return;
    
    // Create park screen if it doesn't exist
    let parkScreen = document.querySelector('.park-screen');
    if (!parkScreen) {
        parkScreen = document.createElement('div');
        parkScreen.className = 'park-screen';
        parkScreen.innerHTML = `
            <h3>Park Activities</h3>
            <div class="park-activities">
                <div class="activity-item" data-name="Play Ball" data-happiness="20">
                    <div class="activity-icon">⚽</div>
                    <div class="activity-name">Play Ball</div>
                    <div class="activity-description">Play ball with your country ball</div>
                </div>
                <div class="activity-item" data-name="Swing" data-happiness="15">
                    <div class="activity-icon">🏄</div>
                    <div class="activity-name">Swing</div>
                    <div class="activity-description">Enjoy swinging in the park</div>
                </div>
                <div class="activity-item" data-name="Picnic" data-happiness="25">
                    <div class="activity-icon">🧺</div>
                    <div class="activity-name">Picnic</div>
                    <div class="activity-description">Have a relaxing picnic</div>
                </div>
            </div>
            <button class="back-to-world-btn">Back to World</button>
            <div class="exit-door">
                <div class="exit-sign">EXIT</div>
            </div>
        `;
        
        document.querySelector(`#world-${worldState.currentArea} .scene`).appendChild(parkScreen);
        
        // Add event listeners for activity items
        const activityItems = parkScreen.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const activityItem = e.currentTarget;
                const name = activityItem.dataset.name;
                const happiness = parseInt(activityItem.dataset.happiness);
                doActivity(name, happiness);
            });
        });
        
        // Add event listener for back button
        const backButton = parkScreen.querySelector('.back-to-world-btn');
        backButton.addEventListener('click', exitParkActivities);
        
        // Add event listener for exit door
        const exitDoor = parkScreen.querySelector('.exit-door');
        exitDoor.addEventListener('click', exitParkActivities);
    }
    
    // Show park screen
    parkScreen.classList.add('active');
    isInParkActivities = true;
}

// Function to exit park activities
function exitParkActivities() {
    const parkScreen = document.querySelector('.park-screen');
    if (parkScreen) {
        parkScreen.classList.remove('active');
    }
    isInParkActivities = false;
}

// Function to do a park activity
function doActivity(name, happinessIncrease) {
    // Increase happiness
    gameState.happiness = Math.min(100, gameState.happiness + happinessIncrease);
    
    // Update stats
    updateStats();
    
    // Show message
    alert(`Your ball enjoyed ${name}! Happiness increased by ${happinessIncrease}.`);
}

// Initialize world when the page loads
window.addEventListener('load', initWorld);

// Add this function to create a visual effect when entering buildings
function createEnterEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'enter-effect';
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    
    const currentScene = document.querySelector(`#world-${worldState.currentArea} .scene`);
    currentScene.appendChild(effect);
    
    // Remove the effect after animation completes
    setTimeout(() => {
        effect.remove();
    }, 1000);
} 