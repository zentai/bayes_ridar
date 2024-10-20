import { Pmf } from './empiricaldist.js'; 
let pmf;
const mapInput = document.getElementById('upload-map');
const mapContainer = document.getElementById('map-container');
const mapImage = document.getElementById('map');
const gridSizeSelect = document.getElementById('grid-size');
const setGridButton = document.getElementById('set-grid');
const markOptionSelect = document.getElementById('mark-option');
const recalculateButton = document.getElementById('recalculate');

let gridSize = 10;
let isMouseDown = false;
let gridCells = [];

const MarkOptions = {
    NO_GO: { value: '0.001', color: 'rgba(128, 0, 255, 0.6)' },
    NOT_FOUND: { value: '0.5', color: 'rgba(128, 128, 0, 0.6)' },
    HIGH_CHANCE: { value: '1.5', color: 'rgba(255, 128, 0, 0.6)' },
    ROUGH_SEARCH: { value: '0.3', color: 'rgba(255, 255, 0, 0.6)' }, // 粗略搜寻
    DETAILED_SEARCH: { value: '0.1', color: 'rgba(0, 255, 128, 0.6)' }, // 细致搜寻
    PROFESSIONAL_TOOLS: { value: '0.05', color: 'rgba(0, 128, 255, 0.6)' }, // 使用专业工具搜寻
    SIMILAR_TERRAIN: { value: '1.8', color: 'rgba(255, 0, 128, 0.6)' } // 相似地貌
};

class GridCell {
    constructor(id, element) {
        this.id = id;
        this.element = element;
        this.probability = 0;
        this.markedState = null;
        this.originalColor = '';
        this.isUserMarked = false; // Indicates if the cell is user-marked
    }

    mark(type) {
        const markOption = MarkOptions[type];
        if (this.markedState === markOption?.value) {
            // If the cell is already marked with the same likelihood value, unmark it
            this.reset();
            return;
        }
        if (markOption) {
            this.markedState = markOption.value;
            this.element.style.backgroundColor = markOption.color;
            this.isUserMarked = true;
            this.element.dataset.marked = type;
        }
    }

    reset() {
        this.element.style.backgroundColor = this.originalColor;
        this.element.dataset.marked = '';
        this.markedState = null;
        this.isUserMarked = false;
    }

    updateProbability(probability, max_p) {
        this.probability = probability;
        let likelihood = 0.5 * (probability/max_p); // Scale sigmoid output to [0, 0.8]
        const heatColor = 'rgba(255, 0, 0, ' + likelihood + ')';
        this.originalColor = heatColor;
        if (!this.isUserMarked) { // Only update color if the cell is not user-marked
            this.element.style.backgroundColor = heatColor;
        }
        this.element.dataset.previousProbability = probability;
        this.element.title = 'Posterior Probability: ' + probability.toFixed(2);
    }
}

// Upload and display map image
mapInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            mapImage.src = e.target.result;
            mapImage.style.display = 'block';
            console.log('Map image loaded successfully.');
        };
        reader.readAsDataURL(file);
    }
});

// Set grid resolution and draw grid
setGridButton.addEventListener('click', function() {
    gridSize = parseInt(gridSizeSelect.value);
    console.log('Grid size selected:', gridSize);
    drawGrid(gridSize);
    // Initialize PMF with new grid size
    pmf = new Pmf([...Array(gridSize * gridSize).keys()]);
    console.log('PMF initialized with grid size:', gridSize);
});

function drawGrid(size) {
    mapContainer.addEventListener('mousedown', () => { isMouseDown = true; });
    mapContainer.addEventListener('mouseup', () => { isMouseDown = false; });
    mapContainer.addEventListener('mouseleave', () => { isMouseDown = false; });

    // Remove existing grid elements
    gridCells.forEach(cell => mapContainer.removeChild(cell.element));
    gridCells = [];

    if (mapImage.style.display === 'none') {
        alert('Please upload a map image first.');
        return;
    }

    const containerWidth = mapContainer.clientWidth;
    const containerHeight = mapContainer.clientHeight;
    const cellWidth = containerWidth / size;
    const cellHeight = containerHeight / size;
    console.log('Container width:', containerWidth, 'Container height:', containerHeight);
    console.log('Calculated cell width:', cellWidth, 'Calculated cell height:', cellHeight);

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cellElement = document.createElement('div');
            cellElement.classList.add('grid-cell');
            cellElement.style.width = `${cellWidth}px`;
            cellElement.style.height = `${cellHeight}px`;
            cellElement.style.left = `${col * cellWidth}px`;
            cellElement.style.top = `${row * cellHeight}px`;
            cellElement.dataset.id = row * size + col;
            cellElement.addEventListener('mousedown', (e) => startMarking(cellElement, e));
            cellElement.addEventListener('mouseenter', (e) => handleMouseEnter(cellElement, e));
            mapContainer.appendChild(cellElement);

            const gridCell = new GridCell(row * size + col, cellElement);
            gridCells.push(gridCell);
        }
    }
    console.log('Grid drawn with', gridCells.length, 'cells.');
}

function startMarking(cellElement, e) {
    isMouseDown = true;
    const gridCell = gridCells.find(cell => cell.element === cellElement);
    const markType = markOptionSelect.value;
    markCell(gridCell, markType);
}

function handleMouseEnter(cellElement, e) {
    if (isMouseDown) {
        const gridCell = gridCells.find(cell => cell.element === cellElement);
        markCell(gridCell, markOptionSelect.value);
    }
}

function markCell(gridCell, markType) {
    if (markType && gridCell.markedState !== MarkOptions[markType]?.value) {
        gridCell.mark(markType);
    } else {
        gridCell.reset();
    }
}

// Recalculate and update grid based on new data
recalculateButton.addEventListener('click', function() {
    let likelihoodUpdates = {};
    gridCells.forEach((cell) => {
        if (cell.markedState !== null) {
            if (!likelihoodUpdates[cell.markedState]) {
                likelihoodUpdates[cell.markedState] = [];
            }
            likelihoodUpdates[cell.markedState].push(cell.id);
        }
    });
    console.log('Likelihood updates:', likelihoodUpdates);
    // Apply likelihood updates to the PMF
    for (const [likelihood, cells] of Object.entries(likelihoodUpdates)) {
        cells.forEach((cellId) => {
            pmf.applyLikelihood(cellId, parseFloat(likelihood));
        });
    }
    let max_p = pmf.normalize()
    // Update grid cells with new posterior probabilities
    const updatedProbabilities = pmf.getProbabilities();
    console.log('Updated probabilities:', updatedProbabilities);
    gridCells.forEach((cell) => {
        cell.updateProbability(updatedProbabilities[cell.id], max_p);
        cell.reset(); // Reset after updating the probability to ensure all cells are ready for new marking
    });
});
