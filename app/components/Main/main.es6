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

};

export default main;
