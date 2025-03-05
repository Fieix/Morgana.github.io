// Массив треков из Persona
const tracks = [
    {
        title: "Burn My Dread",
        url: "music/01. Burn My Dread.mp3"
    },
    {
        title: "Wake Up, Get Up, Get Out There",
        url: "music/5-20. Wake Up, Get Up, Get Out There -Revelations Arrange-.mp3"
    }
];

let currentTrackIndex = -1;
let isMusicPlaying = false;

const musicButton = document.querySelector('.music-button');
const musicIcon = document.querySelector('.music-icon');
const currentTrackElement = document.querySelector('.current-track');
const bgMusic = document.getElementById('bgMusic');
const volumeSlider = document.getElementById('volumeSlider');

// Установка начальной громкости
bgMusic.volume = volumeSlider.value / 100;

// Обработчик изменения громкости
volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    bgMusic.volume = volume;
    
    // Обновление иконки громкости
    const volumeIcon = document.querySelector('.volume-icon');
    if (volume === 0) {
        volumeIcon.textContent = '🔇';
    } else if (volume < 0.5) {
        volumeIcon.textContent = '🔉';
    } else {
        volumeIcon.textContent = '🔊';
    }
});

// Предварительная загрузка аудио
function preloadAudio(url) {
    const audio = new Audio();
    audio.src = url;
}

// Предзагружаем все треки
tracks.forEach(track => preloadAudio(track.url));

// Функция для обновления отображения текущего трека
function updateCurrentTrackDisplay() {
    if (currentTrackIndex !== -1 && !bgMusic.paused) {
        currentTrackElement.textContent = `Сейчас играет: ${tracks[currentTrackIndex].title}`;
        currentTrackElement.classList.add('visible');
    } else {
        currentTrackElement.classList.remove('visible');
    }
}

// Функция для воспроизведения случайного трека
function playRandomTrack() {
    const randomIndex = Math.floor(Math.random() * tracks.length);
    currentTrackIndex = randomIndex;
    
    bgMusic.onerror = function() {
        console.error('Ошибка загрузки аудио:', bgMusic.error);
        currentTrackElement.textContent = 'Ошибка загрузки аудио';
        currentTrackElement.classList.add('visible');
    };
    
    bgMusic.src = tracks[randomIndex].url;
    bgMusic.volume = 0.5;
    
    bgMusic.play().catch(error => {
        console.error('Ошибка воспроизведения:', error);
        currentTrackElement.textContent = 'Ошибка воспроизведения';
        currentTrackElement.classList.add('visible');
    });
    
    updateCurrentTrackDisplay();
}

// Обработчик окончания трека
bgMusic.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    bgMusic.src = tracks[currentTrackIndex].url;
    bgMusic.play();
    updateCurrentTrackDisplay();
});

// Обработчик клика по кнопке музыки
musicButton.addEventListener('click', () => {
    if (bgMusic.paused) {
        if (currentTrackIndex === -1) {
            playRandomTrack();
        } else {
            bgMusic.play().catch(error => {
                console.error('Ошибка воспроизведения:', error);
            });
        }
        musicButton.classList.add('playing');
    } else {
        bgMusic.pause();
        musicButton.classList.remove('playing');
    }
    updateCurrentTrackDisplay();
});

// Автоматически загружаем первый трек при первом клике на игровую область
document.querySelector('.click-area').addEventListener('click', function firstClick() {
    if (currentTrackIndex === -1) {
        currentTrackIndex = 0;
        bgMusic.src = tracks[currentTrackIndex].url;
        bgMusic.load();
        bgMusic.pause();
    }
    this.removeEventListener('click', firstClick);
});

let score = 0;
let clicksPerSecond = 0;
let autoClickerCount = 0;
let multiplier = 1;
let multiplierLevel = 0;
let lastClickTime = Date.now();

// Базовые цены улучшений
let autoClickerBasePrice = 100;
let multiplierBasePrice = 200;

// Текущие цены улучшений
let currentAutoClickerPrice = autoClickerBasePrice;
let currentMultiplierPrice = multiplierBasePrice;

// Коэффициент роста цены (1.15 - стандартный коэффициент для многих кликеров)
const priceGrowthRate = 1.15;

const scoreElement = document.getElementById('score');
const clicksPerSecondElement = document.getElementById('clicks-per-second');
const clickArea = document.getElementById('clickArea');
const autoClickerButton = document.getElementById('autoClicker');
const multiplierButton = document.getElementById('multiplier');

// Создание элемента для отображения всплывающих очков
function createScorePopup(amount) {
    const popup = document.createElement('div');
    popup.textContent = `+${Math.floor(amount * multiplier)}`;
    popup.style.position = 'absolute';
    popup.style.color = '#ff0000';
    popup.style.fontSize = '24px';
    popup.style.fontWeight = 'bold';
    popup.style.pointerEvents = 'none';
    popup.style.userSelect = 'none';
    popup.style.webkitUserSelect = 'none';
    popup.style.msUserSelect = 'none';
    popup.style.mozUserSelect = 'none';
    popup.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    popup.style.zIndex = '1000';
    
    // Случайное положение вокруг места клика
    const x = Math.random() * 100 - 50;
    const y = Math.random() * 100 - 50;
    
    popup.style.left = `calc(50% + ${x}px)`;
    popup.style.top = `calc(50% + ${y}px)`;
    
    clickArea.appendChild(popup);
    
    // Анимация движения вверх и исчезновения
    popup.animate([
        { transform: 'translateY(0) scale(1)', opacity: 1 },
        { transform: 'translateY(-100px) scale(1.5)', opacity: 0 }
    ], {
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }).onfinish = () => popup.remove();
}

// Обновление текста кнопок
function updateButtonTexts() {
    autoClickerButton.textContent = `Автокликер (${Math.floor(currentAutoClickerPrice)} очков)`;
    multiplierButton.textContent = `Множитель +0.25 (${Math.floor(currentMultiplierPrice)} очков)`;
}

// Обработчик клика по Моргане
clickArea.addEventListener('click', () => {
    const currentTime = Date.now();
    const timeDiff = (currentTime - lastClickTime) / 1000;
    
    if (timeDiff < 1) {
        clicksPerSecond = 1 / timeDiff;
    }
    
    lastClickTime = currentTime;
    createScorePopup(1);
    updateScore(1);
    
    // Добавляем эффект пульсации при клике
    clickArea.style.transform = 'scale(0.95)';
    setTimeout(() => {
        clickArea.style.transform = '';
    }, 100);
});

// Автокликер
function autoClick() {
    if (autoClickerCount > 0) {
        createScorePopup(autoClickerCount);
        updateScore(autoClickerCount);
    }
}

// Обновление счета
function updateScore(amount) {
    const oldScore = score;
    score += amount * multiplier;
    scoreElement.textContent = Math.floor(score);
    
    // Анимация изменения счета
    if (score > oldScore) {
        scoreElement.classList.add('score-popup');
        setTimeout(() => {
            scoreElement.classList.remove('score-popup');
        }, 300);
    }
    
    clicksPerSecondElement.textContent = (clicksPerSecond + autoClickerCount).toFixed(1);
    updateButtons();
}

// Покупка автокликера
autoClickerButton.addEventListener('click', () => {
    if (score >= currentAutoClickerPrice) {
        score -= currentAutoClickerPrice;
        autoClickerCount++;
        currentAutoClickerPrice = Math.floor(autoClickerBasePrice * Math.pow(priceGrowthRate, autoClickerCount));
        updateScore(0);
        updateButtonTexts();
        if (autoClickerCount === 1) {
            setInterval(autoClick, 1000);
        }
    }
});

// Покупка множителя
multiplierButton.addEventListener('click', () => {
    if (score >= currentMultiplierPrice) {
        score -= currentMultiplierPrice;
        multiplierLevel++;
        multiplier = 1 + (multiplierLevel * 0.25);
        currentMultiplierPrice = Math.floor(multiplierBasePrice * Math.pow(priceGrowthRate, multiplierLevel));
        updateScore(0);
        updateButtonTexts();
    }
});

// Обновление состояния кнопок
function updateButtons() {
    autoClickerButton.disabled = score < currentAutoClickerPrice;
    multiplierButton.disabled = score < currentMultiplierPrice;
}

// Обновление каждую секунду
setInterval(() => {
    clicksPerSecond = 0;
    clicksPerSecondElement.textContent = autoClickerCount.toFixed(1);
    updateButtons();
}, 1000);

// Инициализация текста кнопок
updateButtonTexts();

// Функция для создания частиц
function createParticles() {
    const container = document.querySelector('.particles-container');
    const particleCount = 30;

    // Очищаем контейнер
    container.innerHTML = '';

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Случайное начальное положение
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Случайная задержка анимации
        particle.style.animationDelay = Math.random() * 10 + 's';
        
        container.appendChild(particle);
        
        // Пересоздаем частицу когда анимация заканчивается
        particle.addEventListener('animationend', () => {
            particle.style.top = '100%';
            particle.style.left = Math.random() * 100 + '%';
            void particle.offsetWidth; // Сброс анимации
            particle.style.top = Math.random() * 100 + '%';
        });
    }
}

// Создаем частицы при загрузке страницы
document.addEventListener('DOMContentLoaded', createParticles); 