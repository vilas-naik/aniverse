import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import Vibrant from 'node-vibrant';
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.json());

app.get("/", async (req, res) => {
    res.render("index.ejs");

});

async function getPalette(imageUrl) {
    return new Promise((resolve, reject) => {
        Vibrant.from(imageUrl)
            .getPalette()
            .then((palette) => {
                resolve(palette);
            })
            .catch((error) => {
                reject(error);
            });
    });
}



app.post("/anime", async (req, res) => {
    try {
        const userSearch = req.body.search.toLowerCase();

        const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${userSearch}&sfw&limit=10`);
        let selectedAnime = response.data.data[0];
        for (let i = 0; i < response.data.data.length; i++) {
            let defaultTitle = "";
            let EnglishTitle = "";
            response.data.data[i].titles.forEach((e) => {
                if (e.type == 'Default') {
                    defaultTitle = e.title;
                }
                else if (e.type == 'English') {
                    EnglishTitle = e.title;
                }
            })
            if (defaultTitle.toLowerCase() == userSearch || EnglishTitle.toLowerCase() == userSearch) {
                selectedAnime = response.data.data[i];
                break;
            }
            else if (response.data.data[i].popularity < selectedAnime.popularity) {
                selectedAnime = response.data.data[i];
            }
        };
        let name = selectedAnime.titles[0].title;

        let searchTerm = name.split(" ");
        let searchTermFinal = "";
        let count = 0;
        searchTerm.forEach(element => {
            if (count == 2 && element.length <= 3) {
                count++;
                return;
            }
            else if (count < 3) {
                searchTermFinal += element + " ";
                count++;
            }
            else {
                return;
            }
        });
        const wallpaper = await axios.get(`https://wallhaven.cc/api/v1/search?q=${searchTermFinal}&atleast=1920x1080`);
        let selectedWallpaper;
        if (wallpaper.data.meta.total > 0) {
            selectedWallpaper = wallpaper.data.data[0];
            for (let i = 0; i < wallpaper.data.data.length; i++) {
                if (wallpaper.data.data[i].favorites > selectedAnime.favorites) {
                    selectedWallpaper = wallpaper.data.data[i];
                }
            };
            selectedWallpaper = selectedWallpaper.path;
        }
        let image = selectedAnime.images.jpg.image_url;
        const palette = await getPalette(image);
        let malLink = selectedAnime.url;
        let yt = selectedAnime.trailer.url;
        let synopsis = selectedAnime.synopsis;
        res.render("main.ejs", {
            background: selectedWallpaper,
            title: name,
            ytLink: yt,
            malLink: malLink,
            poster: image,
            synopsis: synopsis,
            colors: palette
        })
    } catch (error) {
        console.log(error);
    }
})

app.listen(port, () => {
    console.log(`Hosted`);
});
