const fileInput=document.querySelector("#IntroducereImagine");
const myCanvas=document.querySelector("#canvas");
const myCanvasCtx=myCanvas.getContext("2d");
const btnAdauga=document.querySelector("#crop");
const original=null;
let image=null;




function renderImage(){
    myCanvas.width=image.width;
    myCanvas.height=image.height;
    myCanvasCtx.drawImage(image,0,0);
}
fileInput.addEventListener("change",()=>{
    image=new Image();
    image.addEventListener("load",()=>{
        renderImage();
    });
    image.src=URL.createObjectURL(fileInput.files[0]);
    original=image;



});

btnAdauga.addEventListener("crop",()=>{
    window.onload = function () {
        var canvas = document.getElementById("canvas");
        var contex = canvas.getContext("2d");
          
        contex.drawImage(original, 10, 10, 
            300, 175, 0, 0, 100, 175);
    }
   
   
});