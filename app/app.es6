// move index.html to output folder
import $ from '../bower_components/jquery/dist/jquery.min.js';
import loadFile from './components/Main/loadFile.es6';

window.onload = () => {
  $('.container').load('components/Main/main.html');

  loadFile();
};
