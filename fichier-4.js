// ============================
// JUKEBLOCKS - FREE EDITION
// Base de données locale en JSON
// ============================

// Configuration
const STORAGE_KEY = 'jukeblocks-blocks';
const GRID_SIZE = 4; // Nombre de colonnes

// État de l'application
let blocks = [];
let selectedBlockId = null;

// DOM Elements
const blocksArea = document.getElementById('blocksArea');
const blockTitleInput = document.getElementById('blockTitle');
const blockArtistInput = document.getElementById('blockArtist');
const statsDisplay = document.getElementById('stats');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Charger les données existantes
    loadBlocks();
    renderBlocks();
    updateStats();
    
    // Événements
    document.getElementById('addBlock').addEventListener('click', addBlock);
    
    // Click sur les blocks
    blocksArea.addEventListener('click', (e) => {
        const blockEl = e.target.closest('.block');
        if (blockEl) toggleBlockSelection(blockEl);
    });
});

// Charger depuis localStorage
function loadBlocks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        blocks = JSON.parse(stored);
    } else {
        blocks = [];
    }
}

// Sauvegarder en localStorage
function saveBlocks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

// Rendre les blocks HTML
function renderBlocks() {
    // Nettoyer l'area
    blocksArea.innerHTML = '';
    
    // Trier les blocks (nouveaux d'abord)
    const sortedBlocks = [...blocks].sort((a, b) => b.created - a.created);
    
    // Créer la grille
    sortedBlocks.forEach(block => {
        const blockEl = createBlockElement(block);
        blocksArea.appendChild(blockEl);
    });
}

// Créer un élément block HTML
function createBlockElement(block) {
    const el = document.createElement('div');
    el.className = `block ${block.id === selectedBlockId ? 'selected' : ''}`;
    el.dataset.id = block.id;
    
    const time = new Date(block.created);
    const formattedTime = time.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    el.innerHTML = `
        <div class="block-header">
            <span class="block-title">${escapeHtml(block.title)}</span>
            <span class="block-time">${formattedTime}</span>
        </div>
        <p class="block-desc">${block.artist ? `— ${escapeHtml(block.artist)}` : ''}</p>
        <div class="block-actions">
            <button class="btn btn-edit" onclick="editBlock('${block.id}')">Modifier</button>
            <button class="btn btn-delete" onclick="deleteBlock('${block.id}')">Supprimer</button>
        </div>
    `;
    
    return el;
}

// Ajouter un nouveau block
function addBlock() {
    const title = blockTitleInput.value.trim();
    const artist = blockArtistInput.value.trim();
    
    if (!title) {
        // Shake animation sur l'input
        blockTitleInput.style.borderColor = '#ff5f57';
        blockTitleInput.style.boxShadow = '0 0 10px #ff5f57';
        setTimeout(() => {
            blockTitleInput.style.borderColor = var(--border);
            blockTitleInput.style.boxShadow = 'none';
        }, 500);
        return;
    }
    
    const newBlock = {
        id: Date.now().toString(),
        title,
        artist: artist || 'Inconnu',
        created: new Date().getTime()
    };
    
    blocks.push(newBlock);
    saveBlocks();
    
    // Réinitialiser les inputs
    blockTitleInput.value = '';
    blockArtistInput.value = '';
    
    // Ré-render
    renderBlocks();
    updateStats();
}

// Sélectionner/désélectionner un block
function toggleBlockSelection(blockEl) {
    const blockId = blockEl.dataset.id;
    
    // Si c'est déjà sélectionné, le désélectionner
    if (selectedBlockId === blockId) {
        selectedBlockId = null;
        blockEl.classList.remove('selected');
    } else {
        // Sinon, sélectionner celui-ci et désélectionner l'autre
        if (selectedBlockId) {
            const prevEl = document.querySelector(`.block[data-id="${selectedBlockId}"]`);
            if (prevEl) prevEl.classList.remove('selected');
        }
        selectedBlockId = blockId;
        blockEl.classList.add('selected');
    }
}

// Modifier un block
function editBlock(id) {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    
    const newTitle = prompt('Modifier le titre:', block.title);
    const newArtist = prompt('Modifier l\'artiste:', block.artist || '');
    
    if (newTitle !== null) {
        block.title = newTitle.trim() || 'Sans titre';
    }
    if (newArtist !== null) {
        block.artist = newArtist.trim() || 'Inconnu';
    }
    
    saveBlocks();
    renderBlocks();
    updateStats();
}

// Supprimer un block
function deleteBlock(id) {
    if (confirm('Supprimer ce block ?')) {
        blocks = blocks.filter(b => b.id !== id);
        if (selectedBlockId === id) selectedBlockId = null;
        
        saveBlocks();
        renderBlocks();
        updateStats();
    }
}

// Mise à jour des stats
function updateStats() {
    const count = blocks.length;
    statsDisplay.innerHTML = `${count} block${count !== 1 ? 's' : ''} créé${count !== 1 ? 's' : ''}`;
}

// Escape HTML special characters
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}