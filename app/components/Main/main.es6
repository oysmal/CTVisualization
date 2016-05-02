'use strict';
import loadFile from '../LoadFile/loadFile.es6';
import fileList from '../FileList/fileList.es6';

var main = () => {

  $('#file-container').load('components/LoadFile/loadfile.html', () => {
    loadFile();
  });

  $('#file-list-container').load('components/FileList/filelist.html', () => {
    fileList();
  });
  
  //------------------------------------//
  
  $('#move-xplane').on('change input', (e) => {
     $(document).trigger('move_xplane', {value: e.target.value});
  });
  
  $('#toggle-xplane').on('click', (e) => {
     $(document).trigger('toggle_xplane');
  });
  
  //------------------------------------//
  
  $('#move-yplane').on('change input', (e) => {
     $(document).trigger('move_yplane', {value: e.target.value});
  });
  
  $('#toggle-yplane').on('click', (e) => {
     $(document).trigger('toggle_yplane');
  });
  
  //------------------------------------//
  
  $('#move-zplane').on('change input', (e) => {
     $(document).trigger('move_zplane', {value: e.target.value});
  });
  
  $('#toggle-zplane').on('click', (e) => {
     $(document).trigger('toggle_zplane');
  });

};

export default main;
