import palette from 'get-rgba-palette'
import pixels from 'get-image-pixels'
import load from 'img'
 
load("https://cdn.myanimelist.net/images/anime/1792/138022.jpg", function(err, img) {
    //get flat RGBA pixels array
    var px = pixels(img)
    console.log(`rgba array is ${px}`)
    //get 5 prominent colors from our image
    var colors = palette(px, 5)
    console.log(`colors is ${colors}`)
})