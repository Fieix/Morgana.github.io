// Массив треков из Persona
const tracks = [
    {
        title: "Burn My Dread",
        url: "music/01. Burn My Dread.mp3",
        unlocked: true
    },
    {
        title: "Wake Up, Get Up, Get Out There (Revelations Arrange)",
        url: "music/5-20. Wake Up, Get Up, Get Out There -Revelations Arrange-.mp3",
        unlocked: true
    },
    {
        title: "Phantom",
        url: "music/1-02. Phantom.mp3",
        unlocked: false
    },
    {
        title: "King, Queen and Slaves",
        url: "music/1-16. King, Queen and Slaves.mp3",
        unlocked: false
    },
    {
        title: "King, Queen and Slaves (Another Version)",
        url: "music/1-15. King, Queen and Slaves -another version-.mp3",
        unlocked: false
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
    
    // Обновление градиента ползунка
    e.target.style.setProperty('--value', `${e.target.value}%`);
    
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

// Установка начального значения градиента
volumeSlider.style.setProperty('--value', `${volumeSlider.value}%`);

// Предварительная загрузка аудио
function preloadAudio(url) {
    const audio = new Audio();
    audio.src = url;
}

// Предзагружаем все треки
tracks.forEach(track => preloadAudio(track.url));

// Функция для обновления списка треков
function updateTracksList() {
    const tracksList = document.querySelector('.tracks-list');
    tracksList.innerHTML = '';

    tracks.forEach((track, index) => {
        const trackItem = document.createElement('div');
        trackItem.className = `track-item ${track.unlocked ? '' : 'locked'} ${index === currentTrackIndex ? 'playing' : ''}`;
        
        trackItem.innerHTML = `
            <span class="track-icon ${index === currentTrackIndex ? 'playing' : ''}">${index === currentTrackIndex ? '🎵' : '🎼'}</span>
            <div class="track-info">
                <div class="track-title">${track.title}</div>
                <div class="track-status">${track.unlocked ? 'Разблокирован' : 'Заблокирован'}</div>
            </div>
        `;

        if (track.unlocked) {
            trackItem.addEventListener('click', () => {
                if (index !== currentTrackIndex) {
                    currentTrackIndex = index;
                    bgMusic.src = track.url;
                    bgMusic.play().catch(error => {
                        console.error('Ошибка воспроизведения:', error);
                    });
                    musicButton.classList.add('playing');
                    updateCurrentTrackDisplay();
                    updateTracksList();
                }
            });
        }

        tracksList.appendChild(trackItem);
    });
}

// Модифицируем функцию updateCurrentTrackDisplay
function updateCurrentTrackDisplay() {
    if (currentTrackIndex !== -1 && !bgMusic.paused) {
        currentTrackElement.textContent = `Сейчас играет: ${tracks[currentTrackIndex].title}`;
        currentTrackElement.classList.add('visible');
    } else {
        currentTrackElement.classList.remove('visible');
    }
    updateTracksList();
}

// Функция для воспроизведения случайного трека
function playRandomTrack() {
    // Получаем только разблокированные треки
    const unlockedTracks = tracks.filter(track => track.unlocked);
    const randomIndex = Math.floor(Math.random() * unlockedTracks.length);
    currentTrackIndex = tracks.findIndex(track => track === unlockedTracks[randomIndex]);
    
    bgMusic.onerror = function() {
        console.error('Ошибка загрузки аудио:', bgMusic.error);
        currentTrackElement.textContent = 'Ошибка загрузки аудио';
        currentTrackElement.classList.add('visible');
    };
    
    bgMusic.src = tracks[currentTrackIndex].url;
    bgMusic.volume = volumeSlider.value / 100;
    
    bgMusic.play().catch(error => {
        console.error('Ошибка воспроизведения:', error);
        currentTrackElement.textContent = 'Ошибка воспроизведения';
        currentTrackElement.classList.add('visible');
    });
    
    updateCurrentTrackDisplay();
}

// Добавляем новые элементы управления
const prevButton = document.querySelector('.prev-track');
const playPauseButton = document.querySelector('.play-pause');
const nextButton = document.querySelector('.next-track');

// Функция для воспроизведения предыдущего трека
function playPreviousTrack() {
    const unlockedTracks = tracks.filter(track => track.unlocked);
    const currentUnlockedIndex = unlockedTracks.findIndex(track => track === tracks[currentTrackIndex]);
    const prevUnlockedIndex = (currentUnlockedIndex - 1 + unlockedTracks.length) % unlockedTracks.length;
    
    currentTrackIndex = tracks.findIndex(track => track === unlockedTracks[prevUnlockedIndex]);
    bgMusic.src = tracks[currentTrackIndex].url;
    bgMusic.play().catch(error => {
        console.error('Ошибка воспроизведения:', error);
    });
    musicButton.classList.add('playing');
    updateCurrentTrackDisplay();
}

// Функция для воспроизведения следующего трека
function playNextTrack() {
    const unlockedTracks = tracks.filter(track => track.unlocked);
    const currentUnlockedIndex = unlockedTracks.findIndex(track => track === tracks[currentTrackIndex]);
    const nextUnlockedIndex = (currentUnlockedIndex + 1) % unlockedTracks.length;
    
    currentTrackIndex = tracks.findIndex(track => track === unlockedTracks[nextUnlockedIndex]);
    bgMusic.src = tracks[currentTrackIndex].url;
    bgMusic.play().catch(error => {
        console.error('Ошибка воспроизведения:', error);
    });
    musicButton.classList.add('playing');
    updateCurrentTrackDisplay();
}

// Функция для обновления состояния кнопки воспроизведения/паузы
function updatePlayPauseButton() {
    playPauseButton.textContent = bgMusic.paused ? '⏯️' : '⏸️';
}

// Обработчики для кнопок управления
prevButton.addEventListener('click', playPreviousTrack);
nextButton.addEventListener('click', playNextTrack);

playPauseButton.addEventListener('click', () => {
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
    updatePlayPauseButton();
});

// Обновляем обработчик окончания трека
bgMusic.addEventListener('ended', () => {
    playNextTrack();
});

// Добавляем обработчик для обновления состояния кнопки воспроизведения/паузы
bgMusic.addEventListener('play', updatePlayPauseButton);
bgMusic.addEventListener('pause', updatePlayPauseButton);

let score = 0;
let clicksPerSecond = 0;
let autoClickerCount = 0;
let multiplier = 1;
let multiplierLevel = 0;
let lastClickTime = Date.now();

// Базовые цены улучшений
let autoClickerBasePrice = 100;
let multiplierBasePrice = 200;
let speedUpgradeBasePrice = 325;

// Текущие цены улучшений
let currentAutoClickerPrice = autoClickerBasePrice;
let currentMultiplierPrice = multiplierBasePrice;
let currentSpeedUpgradePrice = speedUpgradeBasePrice;

// Коэффициент роста цены (1.15 - стандартный коэффициент для многих кликеров)
const priceGrowthRate = 1.15;

// Параметры автокликера
let autoClickerInterval = 1000; // начальный интервал в миллисекундах
let speedUpgradeLevel = 0; // уровень улучшения скорости
const speedUpgradeMultiplier = 0.9; // каждое улучшение ускоряет на 10%

const scoreElement = document.getElementById('score');
const clicksPerSecondElement = document.getElementById('clicks-per-second');
const clickArea = document.getElementById('clickArea');
const autoClickerButton = document.getElementById('autoClickerButton');
const multiplierButton = document.getElementById('multiplierButton');

// Создание элемента для отображения всплывающих очков
function createScorePopup(amount) {
    const popup = document.createElement('div');
    const finalScore = Math.floor(amount * multiplier);
    
    // Добавляем знак плюс и форматируем число
    popup.textContent = `+${finalScore}`;
    popup.className = 'score-popup';
    
    // Получаем размеры области клика
    const clickAreaRect = clickArea.getBoundingClientRect();
    
    // Генерируем случайную позицию внутри области клика
    const randomX = Math.random() * (clickAreaRect.width - 60); // 60px - примерная ширина текста
    const randomY = Math.random() * (clickAreaRect.height - 30); // 30px - примерная высота текста
    
    // Устанавливаем начальную позицию
    popup.style.left = `${randomX}px`;
    popup.style.top = `${randomY}px`;
    
    // Случайный угол поворота для начальной позиции
    const randomRotation = (Math.random() - 0.5) * 30;
    
    // Случайное направление движения
    const randomDirection = Math.random() * Math.PI * 2;
    const moveDistance = 100; // Расстояние перемещения
    const moveX = Math.cos(randomDirection) * moveDistance;
    const moveY = Math.sin(randomDirection) * moveDistance;
    
    // Добавляем дополнительные эффекты для больших чисел
    if (finalScore > 100) {
        popup.style.fontSize = '2.5em';
        popup.style.textShadow = `
            0 0 15px rgba(255, 51, 51, 0.9),
            0 0 25px rgba(255, 51, 51, 0.5),
            0 0 35px rgba(255, 51, 51, 0.3)
        `;
    }
    
    // Случайный цвет для разнообразия (оттенки красного)
    const hue = 0; // красный
    const saturation = 100;
    const lightness = 50 + Math.random() * 10;
    popup.style.color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    
    // Создаем keyframes для уникальной анимации
    popup.style.animation = 'none';
    popup.style.transform = `
        translate(0, 0) 
        scale(0.5) 
        rotate(${randomRotation}deg)
    `;
    popup.style.opacity = '0';
    
    clickArea.appendChild(popup);
    
    // Запускаем анимацию в следующем кадре
    requestAnimationFrame(() => {
        popup.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
        popup.style.transform = `
            translate(${moveX}px, ${moveY}px) 
            scale(1.2) 
            rotate(${randomRotation * -0.5}deg)
        `;
        popup.style.opacity = '1';
        
        setTimeout(() => {
            popup.style.transform = `
                translate(${moveX * 1.5}px, ${moveY * 1.5}px) 
                scale(0.8) 
                rotate(${randomRotation * -1}deg)
            `;
            popup.style.opacity = '0';
        }, 500);
    });
    
    // Удаляем элемент после завершения анимации
    setTimeout(() => {
        popup.remove();
    }, 1000);
}

// Обновление текста кнопок
function updateButtonTexts() {
    autoClickerButton.textContent = `Автокликер (${Math.floor(currentAutoClickerPrice)} очков)`;
    multiplierButton.textContent = `Множитель x1.25 (${Math.floor(currentMultiplierPrice)} очков)`;
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

// Базовая цена музыкального трека
let musicTrackBasePrice = 1000;
let currentMusicTrackPrice = musicTrackBasePrice;

// Обновление текста цен в магазине
function updateShopPrices() {
    document.getElementById('autoClickerPrice').textContent = Math.floor(currentAutoClickerPrice);
    document.getElementById('multiplierPrice').textContent = Math.floor(currentMultiplierPrice);
    document.getElementById('musicTrackPrice').textContent = Math.floor(currentMusicTrackPrice);
    document.getElementById('speedUpgradePrice').textContent = Math.floor(currentSpeedUpgradePrice);
}

// Обновление состояния кнопок в магазине
function updateShopButtons() {
    const autoClickerButton = document.getElementById('autoClickerButton');
    const multiplierButton = document.getElementById('multiplierButton');
    const musicTrackButton = document.getElementById('musicTrackButton');
    const speedUpgradeButton = document.getElementById('speedUpgradeButton');
    
    if (autoClickerButton) {
        autoClickerButton.disabled = score < currentAutoClickerPrice;
        autoClickerButton.classList.toggle('disabled', score < currentAutoClickerPrice);
    }
    
    if (multiplierButton) {
        multiplierButton.disabled = score < currentMultiplierPrice;
        multiplierButton.classList.toggle('disabled', score < currentMultiplierPrice);
    }
    
    if (musicTrackButton) {
        const allTracksUnlocked = tracks.every(track => track.unlocked);
        musicTrackButton.disabled = score < currentMusicTrackPrice || allTracksUnlocked;
        musicTrackButton.classList.toggle('disabled', score < currentMusicTrackPrice || allTracksUnlocked);
        
        if (allTracksUnlocked) {
            musicTrackButton.textContent = 'Все треки открыты';
        }
    }
    
    if (speedUpgradeButton) {
        speedUpgradeButton.disabled = score < currentSpeedUpgradePrice;
        speedUpgradeButton.classList.toggle('disabled', score < currentSpeedUpgradePrice);
    }
}

// Обновление счета
function updateScore(amount) {
    const oldScore = score;
    score += amount * multiplier;
    scoreElement.textContent = Math.floor(score);
    
    clicksPerSecondElement.textContent = (clicksPerSecond + autoClickerCount).toFixed(1);
    updateShopButtons();
    updateShopPrices();
}

// Покупка автокликера
document.getElementById('autoClickerButton').addEventListener('click', () => {
    if (score >= currentAutoClickerPrice) {
        score -= currentAutoClickerPrice;
        autoClickerCount++;
        currentAutoClickerPrice = Math.floor(autoClickerBasePrice * Math.pow(priceGrowthRate, autoClickerCount));
        updateScore(0);
        
        // Показываем уведомление о покупке
        showNotification('Автокликер куплен!');
        
        if (autoClickerCount === 1) {
            window.autoClickerInterval = setInterval(autoClick, autoClickerInterval);
        }
    }
});

// Покупка множителя
document.getElementById('multiplierButton').addEventListener('click', () => {
    if (score >= currentMultiplierPrice) {
        score -= currentMultiplierPrice;
        multiplierLevel++;
        multiplier *= 1.25;
        currentMultiplierPrice = Math.floor(multiplierBasePrice * Math.pow(priceGrowthRate, multiplierLevel));
        updateScore(0);
        
        showNotification('Множитель куплен!');
    }
});

// Покупка улучшения скорости
document.getElementById('speedUpgradeButton').addEventListener('click', () => {
    if (score >= currentSpeedUpgradePrice) {
        score -= currentSpeedUpgradePrice;
        speedUpgradeLevel++;
        
        // Уменьшаем интервал на 10%
        autoClickerInterval *= speedUpgradeMultiplier;
        
        // Обновляем цену следующего улучшения
        currentSpeedUpgradePrice = Math.floor(speedUpgradeBasePrice * Math.pow(priceGrowthRate, speedUpgradeLevel));
        
        // Перезапускаем автокликер с новым интервалом
        if (autoClickerCount > 0) {
            clearInterval(window.autoClickerInterval);
            window.autoClickerInterval = setInterval(autoClick, autoClickerInterval);
        }
        
        updateScore(0);
        showNotification('Скорость автокликера увеличена!');
    }
});

// Добавляем обновление списка треков при покупке нового трека
document.getElementById('musicTrackButton').addEventListener('click', () => {
    const lockedTrackIndex = tracks.findIndex(track => !track.unlocked);
    
    if (score >= currentMusicTrackPrice && lockedTrackIndex !== -1) {
        score -= currentMusicTrackPrice;
        tracks[lockedTrackIndex].unlocked = true;
        
        currentMusicTrackPrice *= 5; // Увеличиваем цену в 5 раз
        
        updateScore(0);
        updateShopPrices();
        updateShopButtons();
        updateTracksList();
        
        showNotification(`Открыт новый трек: ${tracks[lockedTrackIndex].title}!`);
        preloadAudio(tracks[lockedTrackIndex].url);
    }
});

// Обновляем каждую секунду
setInterval(() => {
    clicksPerSecond = 0;
    clicksPerSecondElement.textContent = autoClickerCount.toFixed(1);
    updateShopButtons();
}, 1000);

// Инициализация магазина
updateShopPrices();
updateShopButtons();

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

// Функции сохранения и загрузки
function encodeGameState() {
    const gameState = {
        score: score,
        autoClickerCount: autoClickerCount,
        multiplier: multiplier,
        multiplierLevel: multiplierLevel,
        currentAutoClickerPrice: currentAutoClickerPrice,
        currentMultiplierPrice: currentMultiplierPrice,
        currentMusicTrackPrice: currentMusicTrackPrice,
        currentSpeedUpgradePrice: currentSpeedUpgradePrice,
        speedUpgradeLevel: speedUpgradeLevel,
        autoClickerInterval: autoClickerInterval,
        wallpaperMode: wallpaperMode,
        tracks: tracks.map(track => ({
            title: track.title,
            unlocked: track.unlocked
        }))
    };
    
    const jsonString = JSON.stringify(gameState);
    const encodedString = btoa(jsonString);
    
    return encodedString.split('').map(char => 
        String.fromCharCode(char.charCodeAt(0) + 1)
    ).join('');
}

function decodeGameState(encodedString) {
    try {
        const decodedBase64 = encodedString.split('').map(char => 
            String.fromCharCode(char.charCodeAt(0) - 1)
        ).join('');
        
        const jsonString = atob(decodedBase64);
        const gameState = JSON.parse(jsonString);
        
        const requiredFields = [
            'score', 
            'autoClickerCount', 
            'multiplier', 
            'multiplierLevel', 
            'currentAutoClickerPrice', 
            'currentMultiplierPrice',
            'currentMusicTrackPrice',
            'currentSpeedUpgradePrice',
            'speedUpgradeLevel',
            'autoClickerInterval',
            'wallpaperMode',
            'tracks'
        ];
        
        if (!requiredFields.every(field => gameState.hasOwnProperty(field))) {
            throw new Error('Некорректный формат сохранения');
        }
        
        return gameState;
    } catch (error) {
        console.error('Ошибка при расшифровке:', error);
        return null;
    }
}

function loadGameState(gameState) {
    score = gameState.score;
    autoClickerCount = gameState.autoClickerCount;
    multiplier = gameState.multiplier;
    multiplierLevel = gameState.multiplierLevel;
    currentAutoClickerPrice = gameState.currentAutoClickerPrice;
    currentMultiplierPrice = gameState.currentMultiplierPrice;
    currentMusicTrackPrice = gameState.currentMusicTrackPrice;
    currentSpeedUpgradePrice = gameState.currentSpeedUpgradePrice;
    speedUpgradeLevel = gameState.speedUpgradeLevel;
    autoClickerInterval = gameState.autoClickerInterval;
    wallpaperMode = gameState.wallpaperMode;
    
    // Обновляем состояние треков
    gameState.tracks.forEach(savedTrack => {
        const track = tracks.find(t => t.title === savedTrack.title);
        if (track) {
            track.unlocked = savedTrack.unlocked;
        }
    });
    
    // Обновляем отображение
    updateScore(0);
    updateButtonTexts();
    updateTracksList();
    
    // Обновляем режим обоев
    document.querySelector(`input[value="${wallpaperMode}"]`).checked = true;
    updateWallpaper();
    
    // Перезапускаем автокликер если он был активен
    if (autoClickerCount > 0) {
        clearInterval(window.autoClickerInterval);
        window.autoClickerInterval = setInterval(autoClick, autoClickerInterval);
    }
}

// Функция для создания уведомлений
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Обработчики кнопок экспорта и импорта
document.getElementById('exportButton').addEventListener('click', () => {
    const saveCode = encodeGameState();
    const importInput = document.getElementById('importInput');
    importInput.style.display = 'block';
    importInput.value = saveCode;
    importInput.select();
    document.execCommand('copy');
    
    showNotification('Код сохранения скопирован в буфер обмена!');
    
    setTimeout(() => {
        importInput.style.display = 'none';
    }, 5000);
});

document.getElementById('importButton').addEventListener('click', () => {
    const importInput = document.getElementById('importInput');
    importInput.style.display = 'block';
    importInput.value = '';
    importInput.focus();
});

document.getElementById('importInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const saveCode = e.target.value.trim();
        const gameState = decodeGameState(saveCode);
        
        if (gameState) {
            loadGameState(gameState);
            e.target.style.display = 'none';
            showNotification('Сохранение успешно загружено!');
        } else {
            showNotification('Ошибка! Неверный код сохранения.', 'error');
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const settingsIcon = document.querySelector('.settings-icon');
    const settingsModal = document.querySelector('.settings-modal');
    
    // Открытие/закрытие окна настроек
    settingsIcon.addEventListener('click', () => {
        settingsModal.classList.toggle('active');
    });
    
    // Закрытие окна настроек при клике вне его
    document.addEventListener('click', (e) => {
        if (!settingsModal.contains(e.target) && !settingsIcon.contains(e.target)) {
            settingsModal.classList.remove('active');
        }
    });

    // Предотвращение закрытия при клике внутри модального окна
    settingsModal.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

// Управление магазином
const shopIcon = document.querySelector('.shop-icon');
const shopOverlay = document.querySelector('.shop-overlay');
const shopContainer = document.querySelector('.shop-container');
const shopClose = document.querySelector('.shop-close');

// Открытие магазина
shopIcon.addEventListener('click', () => {
    shopOverlay.classList.add('active');
    shopContainer.classList.add('active');
    // Добавляем задержку для анимации появления полок
    document.querySelectorAll('.shop-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(50px)';
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, parseFloat(item.style.animationDelay) * 1000);
    });
});

// Закрытие магазина при клике на крестик
shopClose.addEventListener('click', () => {
    shopOverlay.classList.remove('active');
    shopContainer.classList.remove('active');
});

// Закрытие магазина при клике вне контейнера
shopOverlay.addEventListener('click', (e) => {
    if (e.target === shopOverlay) {
        shopOverlay.classList.remove('active');
        shopContainer.classList.remove('active');
    }
});

// Предотвращение закрытия при клике внутри контейнера
shopContainer.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Инициализация списка треков при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateTracksList();
});

let wallpaperMode = 'auto';

// Функция для обновления обоев
function updateWallpaper() {
    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= 8 && currentHour < 16;
    
    // Получаем текущий и новый URL обоев
    const currentWallpaper = document.body.style.backgroundImage;
    let newWallpaper;
    
    switch (wallpaperMode) {
        case 'auto':
            newWallpaper = isDaytime ? 'url("wallpaper day.jpg")' : 'url("wallpaper.jpg")';
            break;
        case 'day':
            newWallpaper = 'url("wallpaper day.jpg")';
            break;
        case 'night':
            newWallpaper = 'url("wallpaper.jpg")';
            break;
    }
    
    // Если обои действительно меняются
    if (currentWallpaper !== newWallpaper) {
        // Устанавливаем текущие обои как фоновое изображение для псевдоэлемента
        document.body.style.setProperty('--current-wallpaper', currentWallpaper || newWallpaper);
        document.body.classList.add('switching-wallpaper');
        
        // Устанавливаем новые обои для body
        document.body.style.backgroundImage = newWallpaper;
        
        // Удаляем класс после завершения анимации
        setTimeout(() => {
            document.body.classList.remove('switching-wallpaper');
        }, 1500);
    }
}

// Обработчики для переключения режима обоев
document.querySelectorAll('input[name="wallpaperMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        wallpaperMode = e.target.value;
        updateWallpaper();
        
        // Показываем уведомление о смене режима
        const modeTexts = {
            'auto': 'Автоматическая смена обоев',
            'day': 'Установлены дневные обои',
            'night': 'Установлены ночные обои'
        };
        showNotification(modeTexts[wallpaperMode]);
    });
});

// Обновляем обои при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateWallpaper();
    createParticles();
    updateTracksList();
    
    // Устанавливаем начальный режим
    const savedMode = localStorage.getItem('wallpaperMode');
    if (savedMode) {
        wallpaperMode = savedMode;
        document.querySelector(`input[value="${savedMode}"]`).checked = true;
        updateWallpaper();
    }
});

// Сохраняем режим обоев при изменении
function saveWallpaperMode(mode) {
    localStorage.setItem('wallpaperMode', mode);
}

// Добавляем сохранение режима при его изменении
document.querySelectorAll('input[name="wallpaperMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        saveWallpaperMode(e.target.value);
    });
});

// Обновляем обои каждую минуту только в автоматическом режиме
setInterval(() => {
    if (wallpaperMode === 'auto') {
        updateWallpaper();
    }
}, 60000); 