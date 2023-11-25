import SceneService from './services/SceneService'
import './style.scss'

const sceneService = new SceneService();


const controlL = document.querySelector('#control-l');
const controlR = document.querySelector('#control-r');

controlL.addEventListener('click', function() {
  sceneService.moveCam('left')
});

controlR.addEventListener('click', function() {
  sceneService.moveCam('right')
});