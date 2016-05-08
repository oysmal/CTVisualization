'use strict';
import loadFile from '../LoadFile/loadFile.es6';
import fileList from '../FileList/fileList.es6';

let main = () => {

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

  // ---------------------------------------- //
  $('#xplane-dir-pos').on('click', (e) => {
     $(document).trigger('toggleCutDirX', {val: 1.0});
  });

  $('#xplane-dir-neg').on('click', (e) => {
     $(document).trigger('toggleCutDirX', {val: -1.0});
  });

  $('#yplane-dir-pos').on('click', (e) => {
     $(document).trigger('toggleCutDirY', {val: 1.0});
  });

  $('#yplane-dir-neg').on('click', (e) => {
     $(document).trigger('toggleCutDirY', {val: -1.0});
  });

  $('#zplane-dir-pos').on('click', (e) => {
     $(document).trigger('toggleCutDirZ', {val: 1.0});
  });

  $('#zplane-dir-neg').on('click', (e) => {
     $(document).trigger('toggleCutDirZ', {val: -1.0});
  });

  // ---------------------------------------- //
};

export default main;
