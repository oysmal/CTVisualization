// move index.html to output folder
import main from './components/Main/loadFile.es6';

window.onload = () => {
  $('.container').load('components/Main/main.html', () => {
    main();
  });
};
