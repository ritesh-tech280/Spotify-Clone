let currentsong = new Audio();
let currFolder;
let songs;

function formatSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${currFolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }

    }
    return songs;
}



const playmusic = (track, pause = false) => {
    //  let audio  = new Audio("/songs/" + track);
    currentsong.src = `/${currFolder}/` + track;
    if (!pause) {

        currentsong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "000:00 / 00:00";

    //show all the sonngs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                        <div class="info">
                            <div> ${song.replaceAll("%20", " ")} </div>
                            <div>Ritesh</div>
                        </div>
                        <div class="playnow">
                            <span>Play now</span>
                        <img class="invert" src="img/play.svg" alt="">
                        </div></li>`;
    }
    //attach an event listner 
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", elemet => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    });
}
async function dislplayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".card-container");
    let array = Array.from(anchors);
      for (let index = 0 ; index < array.length; index++){
        const e = array[index];
      
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").filter(Boolean).slice(-1)[0];
            // get meta data of the folder 
        try {
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
           
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder= "${folder}" class="card">
                        <div  class="play">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="20" height="20"
                                fill="black" style="display: block; transform: translateX(1.5px);">
                                <path
                                    d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }  catch (err) {
             console.warn(` Could not load metadata for folder "${folder}":`, err.message);
        }

        }
    }

    // load the playlist whenever card will clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {

            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playmusic();
            playmusic(songs[0]);

        })
    })

}

async function main() {
    //get play llist of alll song
    songs = await getsongs("songs/ncs");
    playmusic(songs[0], true);

    // Display all the albumbs on the page
    dislplayAlbums();


    //atach an evenet listner to play , next and porev 
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    })

    //Listen for timeupdate event 
    currentsong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML = `${formatSeconds(currentsong.currentTime)}/${formatSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    //add an event to seeek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    })

    // add an event listner for hamberguer 
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //add event listner to close 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add event listeners to prev and next
    prev.addEventListener("click", () => {

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])


        if ((index - 1) >= 0) {

            playmusic(songs[index - 1]);
        }
    })

    next.addEventListener("click", () => {

        currentsong.pause();
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])

        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }
    })
    // ad an ecent to the voumr
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {

        currentsong.volume = parseInt(e.target.value) / 100;
    })
   // add event listner to the colume 
   document.querySelector(".volume>img").addEventListener("click", e => {
    console.log(e.target)
    if(e.target.src.includes("volume.svg")){
         e.target.src =  e.target.src.replace("volume.svg","mute.svg");
        currentsong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    } else {
         e.target.src = e.target.src.replace("mute.svg","volume.svg");
         currentsong.volume = .10;
         document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
    }
   })

      currentsong.addEventListener("ended", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if ((index + 1) < songs.length) {
        playmusic(songs[index + 1]);
    } else {
        // Optional: Loop back to first song
        playmusic(songs[0]);
    }
});
          
    
}
main()

