// move index.html to output folder
import $ from '../bower_components/jquery/dist/jquery.min.js';
import main from './components/Main/loadFile.es6';

window.onload = () => {
  $('.container').load('components/Main/main.html', () => {
    main();
  });
};
