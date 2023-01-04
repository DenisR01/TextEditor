const fileInput=document.querySelector("#IntroducereImagine");
const myCanvas=document.querySelector("#canvas");
const myCanvasCtx=myCanvas.getContext("2d");
const cropButton=document.querySelector("#crop");
const deleteButton = document.querySelector("#delete");
const rescaleValue = document.querySelector("#rescaleValue");
const textToAdd = document.querySelector("#textToAdd");
const textSize = document.querySelector("#textSize");
const textColor = document.querySelector("#textColor");

let original=null;
let image=null;
let mousedown = null;

let mouseX = null;
let mouseY = null;
let shiftPressed = false;
let movingSelection = false;
let addingText = false;

let originalSelectionStartPoint = {x : null, y : null};
let originalSelectionEndPoint = {x : null, y : null};
let selectionStartPoint = {x : null, y : null};
let selectionEndPoint = {x : null, y : null};

let moveStartPoint = {x : null, y : null};
let moveEndPoint = {x : null, y : null};

let cropTopLeft = {x : null, y : null};
let cropBottomRight = {x : null, y : null};

let resizeType = 'height';

function renderImage(){
    myCanvas.width = image.width;
    myCanvas.height = image.height;
    myCanvasCtx.drawImage(image, 0, 0);
}

function applyChanges(){

    const newimg = canvas.toDataURL('image/jpg');
    image.src = newimg;
    cropBottomRight = {x : 0, y : 0};
    cropTopLeft = {x : image.height, y : image.width};
    //renderImage();
}

function cropImage(){
    myCanvas.width= cropBottomRight.x - cropTopLeft.x;
    myCanvas.height= cropBottomRight.y - cropTopLeft.y;
    myCanvasCtx.drawImage(image, cropTopLeft.x, cropTopLeft.y, cropBottomRight.x - cropTopLeft.x, cropBottomRight.y - cropTopLeft.y,
                          0, 0, cropBottomRight.x - cropTopLeft.x, cropBottomRight.y - cropTopLeft.y);
    applyChanges();
}

function drawShape(points){
    myCanvasCtx.beginPath();
    myCanvasCtx.moveTo(points[0].x, points[0].y);
    for(let i=1; i<points.length; i++){
        myCanvasCtx.lineTo(points[i].x, points[i].y);
        myCanvasCtx.moveTo(points[i].x, points[i].y);
    }
    myCanvasCtx.stroke();
}

function drawSelectionRectangle(){
    const myCanvasCtx=myCanvas.getContext("2d");
    myCanvasCtx.setLineDash([5, 5]);
    drawShape([selectionStartPoint, {x : selectionEndPoint.x, y : selectionStartPoint.y}, 
               selectionEndPoint, {x : selectionStartPoint.x, y : selectionEndPoint.y}, selectionStartPoint]);
}

fileInput.addEventListener("change",()=>{
    image=new Image();
    image.addEventListener("load",()=>{
        cropTopLeft = {x : 0, y : 0};
        cropBottomRight = {x : image.width, y : image.height};
        selectionStartPoint = {x : 0, y : 0};
        selectionEndPoint = {x : image.width, y : image.height};
        renderImage();
    });
    image.src=URL.createObjectURL(fileInput.files[0]);
});

function getCorners(A, B){
    TopLeft = {x : Math.min(A.x, B.x), y : Math.min(A.y, B.y)};
    BottomRight = {x : Math.max(A.x, B.x), y : Math.max(A.y, B.y)};
    return {'topLeft' : TopLeft, 'bottomRight' : BottomRight};
}

cropButton.addEventListener("click", ()=>{
        let corners = getCorners(selectionStartPoint, selectionEndPoint);
        cropTopLeft = corners.topLeft;
        cropBottomRight = corners.bottomRight;
        cropImage();
});

deleteButton.addEventListener("click", ()=>{
    let corners = getCorners(selectionStartPoint, selectionEndPoint);
    renderImage();
    myCanvasCtx.clearRect(corners.topLeft.x, corners.topLeft.y, 
                          corners.bottomRight.x - corners.topLeft.x, corners.bottomRight.y - corners.topLeft.y);
    applyChanges();
});

myCanvas.addEventListener("mousedown", ()=>{
    if(mousedown == null){
    if(addingText){
        myCanvasCtx.fillStyle = textColor.value;
        myCanvasCtx.font = textSize.value + "px" + " serif";
        myCanvasCtx.fillText(textToAdd.value, mouseX, mouseY);
        addingText = false;
        myCanvas.style.cursor = "auto";
        applyChanges();
    }
    else
    if(!shiftPressed){
        selectionStartPoint.x = mouseX;
        selectionStartPoint.y = mouseY;
        mousedown = setInterval(makeSelection, 10);
        console.log("selecting!");
    }
    else{
        movingSelection = true;

        moveStartPoint.x = mouseX;
        moveStartPoint.y = mouseY;

        originalSelectionStartPoint.x = selectionStartPoint.x;
        originalSelectionStartPoint.y = selectionStartPoint.y;
        originalSelectionEndPoint.x = selectionEndPoint.x;
        originalSelectionEndPoint.y = selectionEndPoint.y;

        mousedown = setInterval(moveSelection, 10);
    }
    }
});

myCanvas.addEventListener("mousemove", (event)=>{
    let rect = canvas.getBoundingClientRect()
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    if(event.shiftKey)
        shiftPressed = true;
    else
        shiftPressed = false;
})

function makeSelection(event, rect){
    selectionEndPoint.x = mouseX;
    selectionEndPoint.y = mouseY;
    renderImage();
    drawSelectionRectangle();
}

function renderMoving(){
    renderImage();
    let originalCorners = getCorners(originalSelectionStartPoint, originalSelectionEndPoint);
    console.log(originalCorners);
    let corners = getCorners(selectionStartPoint, selectionEndPoint);

    myCanvasCtx.clearRect(originalCorners.topLeft.x, originalCorners.topLeft.y,
    originalCorners.bottomRight.x - originalCorners.topLeft.x, originalCorners.bottomRight.y - originalCorners.topLeft.y);
    
    myCanvasCtx.drawImage(image, originalCorners.topLeft.x, originalCorners.topLeft.y, originalCorners.bottomRight.x - originalCorners.topLeft.x, originalCorners.bottomRight.y - originalCorners.topLeft.y,
    corners.topLeft.x, corners.topLeft.y, corners.bottomRight.x - corners.topLeft.x, corners.bottomRight.y - corners.topLeft.y);
}

function moveSelection(event, rect){
    moveEndPoint.x = mouseX;
    moveEndPoint.y = mouseY;

    let deltaX = moveEndPoint.x - moveStartPoint.x;
    let deltaY = moveEndPoint.y - moveStartPoint.y;

    let corners = getCorners(selectionStartPoint, selectionEndPoint);
    if(corners.topLeft.x + deltaX >= 0 && corners.bottomRight.x + deltaX <= myCanvas.width){
        selectionStartPoint.x += deltaX;
        selectionEndPoint.x += deltaX;
    }

    if(corners.topLeft.y + deltaY >= 0 && corners.bottomRight.y + deltaY <= myCanvas.height){
        selectionStartPoint.y += deltaY;
        selectionEndPoint.y += deltaY;
    }
    renderMoving();
    drawSelectionRectangle();
    moveStartPoint.x = moveEndPoint.x
    moveStartPoint.y = moveEndPoint.y;
}

document.addEventListener("mouseup", () => {
    if(mousedown != null){
    clearInterval(mousedown);
    mousedown = null;
    if(movingSelection){
        renderMoving();
        applyChanges();
        drawSelectionRectangle();
        movingSelection = false;
    }
    }
})

function setResizeType(type){
    resizeType = type;
}

function resize(){
    let newSize = parseInt(rescaleValue.value);
    if(newSize != null && !isNaN(newSize)){
        let newHeight = 0;
        let newWidth = 0;
        if(resizeType === 'height'){
            newHeight = newSize;
            newWidth = newHeight * (myCanvas.width / myCanvas.height);
        }
        else{
            newWidth = newSize;
            newHeight = newWidth * (myCanvas.height / myCanvas.width)
        }
        myCanvas.width = newWidth;
        myCanvas.height = newHeight;
        console.log(newHeight + " " + newWidth);
        myCanvasCtx.drawImage(image, 0, 0, image.width, image.height, 0, 0, newWidth, newHeight);
        applyChanges();
    }
}

function invertColor(){
    renderImage();
    let corners = getCorners(selectionStartPoint, selectionEndPoint);
    var imgData = myCanvasCtx.getImageData(corners.topLeft.x, corners.topLeft.y, 
    corners.bottomRight.x - corners.topLeft.x, corners.bottomRight.y - corners.topLeft.y);
    // invert colors
    var i;
    for (i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 255 - imgData.data[i];
        imgData.data[i+1] = 255 - imgData.data[i+1];
        imgData.data[i+2] = 255 - imgData.data[i+2];
        imgData.data[i+3] = 255;
    }
    myCanvasCtx.putImageData(imgData, corners.topLeft.x, corners.topLeft.y);
    applyChanges();
}

function addText(){
    myCanvas.style.cursor = "crosshair";
    addingText = true;
}