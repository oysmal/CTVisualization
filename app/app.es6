// move index.html to output folder
import main from './components/Main/loadFile.es6';
import menu from './components/Menu/menu.es6';
import histogram from './components/histogram/histogram.es6';
import coverflow from './components/coverflow/coverflow.es6';

window.onload = () => {
  // Load main view
  $('.main_container').load('components/Main/main.html', () => {
    main();
  });

  // Load menu
  $('.menu_container').load('components/Menu/menu.html', () => {
    menu();
  });

  //load histogram
  $('.histogram_container').load('components/histogram/histogram.html',() =>{
  	histogram();
  });

  //load xray coverflow
  $('.coverflow_container').load('components/coverflow/coverflow.html',()=>{
  	coverflow();
  })

};
