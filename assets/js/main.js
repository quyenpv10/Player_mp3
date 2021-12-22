/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / pause/ seek
 * 4. CD rotate
 * 5. Next / Prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'F8_PLAYER'
const playlist = $('.playlist');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress')
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setconfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    songs: [{
            name: 'Ngày Khác Lạ',
            singer: 'Den Vau',
            path: './assets/music/song1.mp4',
            image: './assets/image/den.jpg'
        },
        {
            name: 'Sugar',
            singer: 'Maroon5',
            path: './assets/music/song2.mp4',
            image: './assets/image/maroon5.jpg'
        },
        {
            name: 'Summertime',
            singer: 'K391',
            path: './assets/music/song3.mp4',
            image: './assets/image/k391.jpg'
        },
        {
            name: 'Lost Frequencies',
            singer: 'Janieck Devy',
            path: './assets/music/song4.mp4',
            image: './assets/image/lostFrequencies.jpg'
        },
        {
            name: 'Lemon Tree',
            singer: 'Den Vau',
            path: './assets/music/song5.mp4',
            image: './assets/image/lemonTree.jpg'
        }, {
            name: 'TheFatRat',
            singer: 'Monody',
            path: './assets/music/song6.mp4',
            image: './assets/image/Fatrat.jpg'
        },
        {
            name: 'Veveda',
            singer: 'Victone',
            path: './assets/music/song7.mp4',
            image: './assets/image/viceTone.jpg'
        }
    ],
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = "${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                     <div class="body">
                         <h3 class="title">${song.name}</h3>
                         <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join("");
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })


    },
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        //Xu li CD quay / dung
        const cdThumbAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 10000, // 10s
            iterations: Infinity
        })

        cdThumbAnimate.pause();

        // Xử lí phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.screenY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lí khi play

        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // Khi song duoc play
        audio.onplay = function() {
                _this.isPlaying = true;
                player.classList.add('playing');
                cdThumbAnimate.play();
            }
            // khi song bi pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // khi tien do bai hat thay doi

        audio.ontimeupdate = function() {
                if (audio.duration) {
                    const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                    progress.value = progressPercent;
                }
            }
            // Xu li khi tua song
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;

        }

        // xu li khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // xu li khi prev song
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong();
            }
            audio.play();
        }

        // xu li random on/ off
        randomBtn.onclick = function(e) {
                _this.isRandom = !_this.isRandom;
                _this.setconfig('isRandom', _this.isRandom);
                randomBtn.classList.toggle('active', _this.isRandom);
            }
            // xu li repeat a song
        repeatBtn.onclick = function(e) {
                _this.isRepeat = !_this.isRepeat;
                _this.setconfig('isRepeat', _this.isRepeat);
                repeatBtn.classList.toggle('active', _this.isRepeat);
            }
            // xu li next song khi audio ended
        audio.onended = function() {
                if (_this.isRepeat) {
                    audio.play();
                } else {
                    nextBtn.click();
                }
            }
            //Lang nghe hanh vi click vao playlish
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');

            if (songNode || e.target.closest('.option')) {
                // xu li khi click vao song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurentSong();
                    audio.play();
                    _this.render();

                }

                // xu li khi click vao option
                if (e.target.closest('.option')) {

                }

            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',

            });
        }, 200);

    },

    loadCurentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;

    },

    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurentSong();

    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex <= 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurentSong();

    },


    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurentSong();

    },

    start: function() {
        this.loadConfig();
        // Định nghĩa các thuộc tính cho Object
        this.defineProperties();

        //Lắng nghe xử lí các sử kiện
        this.handleEvents();
        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurentSong();

        // Render playlist
        this.render()
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start();