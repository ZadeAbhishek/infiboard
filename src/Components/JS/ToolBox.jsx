import '../CSS/ToolBox.css'
import { useEffect, useState} from 'react';


const ToolBox = ({global , Render}) => {
let wheel = undefined;
let selector = undefined;
let colorPreview = undefined;
let hue = 0; // Initial hue value

// Function to update the color based on the selector's position
function updateColor(color) {
  if(color === undefined){
  const saturation = ((selector.offsetLeft / wheel.clientWidth) * 100).toFixed(2);
  const lightness = 100;
  const hexColor = rgbToHex(hslToRgb(hue / 360, saturation / 100, lightness / 100));

  colorPreview.style.backgroundColor = hexColor;
  global.strokeStyle = hexColor;
  }
  else if(color !== undefined && colorPreview !== undefined){
  colorPreview.style.backgroundColor = color.target.value;
  global.strokeStyle = color.target.value;
  }
  
}

// Function to move the selector based on mouse position
function moveSelector(e) {
  const rect = wheel.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  moveSelectorInternal(x, y);
}

// Function to move the selector based on touch position
function moveSelectorTouch(e) {
  const rect = wheel.getBoundingClientRect();
  const x = e.touches[0].clientX - rect.left;
  const y = e.touches[0].clientY - rect.top;
  moveSelectorInternal(x, y);
}

// Function to move the selector based on position (used by both mouse and touch)
function moveSelectorInternal(x, y) {
  const centerX = wheel.clientWidth / 2;
  const centerY = wheel.clientHeight / 2;

  const deltaX = x - centerX;
  const deltaY = y - centerY;
  const angle = Math.atan2(deltaY, deltaX);
  const distance = Math.min(Math.hypot(deltaX, deltaY), centerX);

  const selectorX = centerX + distance * Math.cos(angle);
  const selectorY = centerY + distance * Math.sin(angle);

  selector.style.left = selectorX + 'px';
  selector.style.top = selectorY + 'px';

  // Calculate hue based on the angle
  // Calculate hue based on the angle
  hue = (Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 180) % 360;
  updateColor();
}

// Convert HSL to RGB
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
      r = g = b = l; // achromatic
  } else {
      const hueToRgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + ((s - l) * s);
      const p = 2 * l - q;

      r = hueToRgb(p, q, h + 1 / 3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Convert RGB to HEX
function rgbToHex(rgb) {
  return '#' + ((1 << 24) | (rgb[0] << 16) | (rgb[1] << 8) | rgb[2]).toString(16).slice(1).toUpperCase();
}
  
useEffect(()=>{
  wheel = document.querySelector('.wheel');
  selector = document.querySelector('.selector');
  colorPreview = document.querySelector('.color-preview');
  // Event listener for mouse drag on the color whee
 
 wheel.addEventListener('mousedown', (e) => {
     e.preventDefault();
     wheel.addEventListener('mousemove', moveSelector);
     window.addEventListener('mouseup', () => {
         wheel.removeEventListener('mousemove', moveSelector);
     });
 });
 
 // Event listeners for touch support
 wheel.addEventListener('touchstart', (e) => {
     e.preventDefault();
     wheel.addEventListener('touchmove', moveSelectorTouch);
     window.addEventListener('touchend', () => {
         wheel.removeEventListener('touchmove', moveSelectorTouch);
     });
 });
   },[])


  function strokeChange() {
    const strokevalue = document.getElementById("customRange1");
    setstrokeWidth(strokevalue.value);
    global.strokeWidth = strokeWidth;

}


function draw() {
  global.canvas.style.cursor = "url('https://img.icons8.com/FFFFFF/external-those-icons-lineal-color-those-icons/24/FF0C0C/external-cursor-selection-cursors-those-icons-lineal-color-those-icons-1.png'), auto"
  global.prevState = global.draw;
  global.draw = 'DRAW';
}

function erase(){
  global.canvas.style.cursor = "url('https://img.icons8.com/color/48/eraser.png'), auto"
  global.prevState = global.draw;
  global.draw = 'ERASE';
}

function undo() {
 let curr = global.drawing.pop();
 if(curr === undefined) return;
 global.state--;
 global.stack.push(curr);
 Render.redrawCanvas();
}

function redo() {
  let curr = global.stack.pop();
  if (curr === null) return;
  global.state++;
  global.drawing.push(curr);
  Render.redrawCanvas();
}


function pan() {
  global.canvas.style.cursor = "grabbing";
  global.prevState = global.draw;
  global.draw = 'PAN';
}

function setCentre() {
  global.offsetX = 0;
  global.offsetY = 0;
  global.scale = 1;
  Render.redrawCanvas();
}

function drawSqaure(){
  global.canvas.style.cursor = "url('https://img.icons8.com/ios-glyphs/30/move.png'), auto"
  global.prevState = global.draw;
  global.draw = "SQUARE"
}



function loadBoard() {
  if (document.querySelector('.file').files[0] === undefined) {
    alert("No file Selected");
    return;
  }
  let fileReader = new FileReader();
  fileReader.onload = function () {
    let parsedJSON = JSON.parse(fileReader.result);
    global.drawing = parsedJSON;
    Render.redrawCanvas();
  }
  fileReader.readAsText(document.querySelector('.file').files[0]);
  closeNav();
}

function saveBoard() {
  const blob = new Blob([JSON.stringify(global.drawing, null, 3)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${global.projectName}.json`;
  a.click();
}

function saveImage() {
  var canvas = global.canvas
  const dataUrl = canvas.toDataURL("image/png");
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = `${global.projectName}.png`;
  anchor.click();
}

function openNav() {
  document.getElementById("setting-menu-id").style.width = "100%";
}

function closeNav() {
  document.getElementById("setting-menu-id").style.width = "0";
}

function openGithub(){
  window.open("https://github.com/ZadeAbhishek/infiboard");
}

function togglepicker(){
  if(document.getElementById("color-picker-id").style.display === "block") document.getElementById("color-picker-id").style.display = "none"; 
   else document.getElementById("color-picker-id").style.display = "block";
 }

  const [strokeWidth, setstrokeWidth] = useState(2);

return (
  
  
  <>


    <div className="group-vertical" role="group" aria-label="Vertical button group">
      <button onClick={draw} id="drawBtn" type="button" className="menubutton"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
      </svg></button>

      <button onClick={erase} id="drawBtn" type="button" className="menubutton"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eraser" viewBox="0 0 16 16">
<path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828l6.879-6.879zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414l-3.879-3.879zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293l.16-.16z"/>
</svg></button>

<button onClick={togglepicker} type="button" className="menubutton"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-palette" viewBox="0 0 16 16">
<path d="M8 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5.5 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
<path d="M16 8c0 3.15-1.866 2.585-3.567 2.07C11.42 9.763 10.465 9.473 10 10c-.603.683-.475 1.819-.351 2.92C9.826 14.495 9.996 16 8 16a8 8 0 1 1 8-8zm-8 7c.611 0 .654-.171.655-.176.078-.146.124-.464.07-1.119-.014-.168-.037-.37-.061-.591-.052-.464-.112-1.005-.118-1.462-.01-.707.083-1.61.704-2.314.369-.417.845-.578 1.272-.618.404-.038.812.026 1.16.104.343.077.702.186 1.025.284l.028.008c.346.105.658.199.953.266.653.148.904.083.991.024C14.717 9.38 15 9.161 15 8a7 7 0 1 0-7 7z"/>
</svg></button>

      <button onClick={undo} id="drawBtn" type="button" className="menubutton"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z" />
        <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z" />
      </svg></button>

      <button onClick={redo} id="drawBtn" type="button" className="menubutton"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
      </svg></button>

      <button onClick={pan} id="PanBtn" type="button" className="menubutton"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-hand-index" viewBox="0 0 16 16">
        <path d="M6.75 1a.75.75 0 0 1 .75.75V8a.5.5 0 0 0 1 0V5.467l.086-.004c.317-.012.637-.008.816.027.134.027.294.096.448.182.077.042.15.147.15.314V8a.5.5 0 1 0 1 0V6.435a4.9 4.9 0 0 1 .106-.01c.316-.024.584-.01.708.04.118.046.3.207.486.43.081.096.15.19.2.259V8.5a.5.5 0 0 0 1 0v-1h.342a1 1 0 0 1 .995 1.1l-.271 2.715a2.5 2.5 0 0 1-.317.991l-1.395 2.442a.5.5 0 0 1-.434.252H6.035a.5.5 0 0 1-.416-.223l-1.433-2.15a1.5 1.5 0 0 1-.243-.666l-.345-3.105a.5.5 0 0 1 .399-.546L5 8.11V9a.5.5 0 0 0 1 0V1.75A.75.75 0 0 1 6.75 1zM8.5 4.466V1.75a1.75 1.75 0 1 0-3.5 0v5.34l-1.2.24a1.5 1.5 0 0 0-1.196 1.636l.345 3.106a2.5 2.5 0 0 0 .405 1.11l1.433 2.15A1.5 1.5 0 0 0 6.035 16h6.385a1.5 1.5 0 0 0 1.302-.756l1.395-2.441a3.5 3.5 0 0 0 .444-1.389l.271-2.715a2 2 0 0 0-1.99-2.199h-.581a5.114 5.114 0 0 0-.195-.248c-.191-.229-.51-.568-.88-.716-.364-.146-.846-.132-1.158-.108l-.132.012a1.26 1.26 0 0 0-.56-.642 2.632 2.632 0 0 0-.738-.288c-.31-.062-.739-.058-1.05-.046l-.048.002zm2.094 2.025z" />
      </svg></button>

      <button onClick={setCentre} type="button" className="menubutton"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrows-angle-contract" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707zM15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 1 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768L15.828.879a.5.5 0 0 0 0-.707z" />
      </svg></button>

      <button onClick={drawSqaure} type="button" className="menubutton"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-square" viewBox="0 0 16 16">
<path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
</svg></button>
      
<button onClick={openNav} type="button" className="menubutton"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
          <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
        </svg></button>

    </div>
    

   <div id="githubPage">
   <button onClick={openGithub} type="button" className="menubutton"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-github" viewBox="0 0 16 16">
<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
</svg></button>
      </div>
    
    <div className="setting-menu" id="setting-menu-id">
    <a href="#" className="dropdown-item"><img className="nav-logo" src={process.env.PUBLIC_URL + '/logo512.png'} /></a> 
    <a href="#" className="closebtn" onClick={closeNav}>&times;</a>
        <a onClick={saveImage} className="dropdown-item">Save Image</a>
        <a onClick={saveBoard} className="dropdown-item">Save Board</a>
        <a className="dropdown-item">
        <input type="file" className="file"></input>
        <button className='menubutton' onClick={loadBoard}>Load Board</button>
        </a>
    </div>

    <div className="color-picker" id="color-picker-id">
      <div className="color-wheel">
          <div className="wheel"></div>
          <div className="selector"></div>
      </div>
          <div className="color-preview"></div>
          <label htmlFor="color-preview" className="">Current Color</label>

     <div className='color-button'>
      <div className='row-color-button'>
      <div className='col-color-button'>
        <button className='color-button-toggler' id="color-button-toggler-black" value={"black"} onClick={updateColor}></button>
        <button className='color-button-toggler' id="color-button-toggler-white" value={"white"} onClick={updateColor}></button>
        <button className='color-button-toggler' id="color-button-toggler-grey" value={"grey"} onClick={updateColor}></button>
      </div>
      <div className='col-color-button'>
      <button className='color-button-toggler' id="color-button-toggler-red" value={"red"} onClick={updateColor}></button>
      <button className='color-button-toggler' id="color-button-toggler-green" value={"green"} onClick={updateColor}></button>
      <button className='color-button-toggler' id="color-button-toggler-yellow" value={"yellow"} onClick={updateColor}></button>
      </div>
      <div className='col-color-button'>
      <button className='color-button-toggler' id="color-button-toggler-pink" value={"pink"} onClick={updateColor}></button>
      <button className='color-button-toggler' id="color-button-toggler-orange" value={"orange"} onClick={updateColor}></button>
      <button className='color-button-toggler' id="color-button-toggler-blue" value={"blue"} onClick={updateColor}></button>
      </div>
      </div>
      <label className="row-color-button">Basic Color</label>
     </div>

      <input type="range" min='2' max='15' value={strokeWidth} className="form-range" id="customRange1" onChange={strokeChange}></input>
      <label htmlFor="customRange1" className="form-label">Stroke</label>
    </div>
  </>
)
}

export default ToolBox





