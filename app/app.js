// move index.html to output folder
import $ from '../bower_components/jquery/dist/jquery.min.js';


import loadFile from './components/Main/loadFile.js';
loadFile();

$(document.body).load('./components/Main/main.html');
