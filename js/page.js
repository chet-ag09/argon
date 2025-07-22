
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const cssUpload = document.getElementById('cssUpload');
const styleTag = document.getElementById('user-css');
const vol_up = document.getElementById("vol_up");
const vol_down = document.getElementById("vol_down");

playBtn.onclick = () => window.api.send('play');
pauseBtn.onclick = () => window.api.send('play');

vol_up.onclick = () => window.api.send('vol_up');
vol_down.onclick = () => window.api.send('vol_down');

window.onkeydown = (e) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
    window.close();
    } else if (e.key.toLowerCase() == 'i') {
        cssUpload.click();
    }
};


window.api.onResponse((data) => {
    try {
    const parsed = JSON.parse(data);
    document.getElementById('output').textContent =
        `${parsed.title} - ${parsed.artist}`;

    if (parsed.status === 'Playing') {
        playBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
    } else if (parsed.status === 'Paused') {
        pauseBtn.classList.add('hidden');
        playBtn.classList.remove('hidden');
    }
    } catch (e) {
    console.error("Failed to parse data:", data);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const savedCSS = window.customCSS.load();
    if (savedCSS) styleTag.textContent = savedCSS;
});

cssUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
    const cssContent = e.target.result;
    styleTag.textContent = cssContent;
    window.customCSS.save(cssContent);
    };
    reader.readAsText(file);
});