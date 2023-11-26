import SceneService from './services/SceneService'
import './style.scss'

const sceneService = new SceneService();


const controlL = document.querySelector('#control-l');
const controlR = document.querySelector('#control-r');
const controlC = document.querySelector('#control-c');
const mainFrame = document.querySelector('#main-frame');

controlL.addEventListener('click', function() {
  sceneService.moveCam('left')
});

controlR.addEventListener('click', function() {
  sceneService.moveCam('right')
});

controlC.addEventListener('click', function() {
  sceneService.loadGame()
});

mainFrame.addEventListener('click', function() {
  sceneService.fullScreen()
});