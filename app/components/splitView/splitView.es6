'use strict';
import loadFile from '../splitView_loadFile/loadFile.es6';
import fileList from '../splitView_fileList/fileList.es6';

var main = () => {

  $('#file-container').load('components/splitView_loadFile/loadfile.html', () => {
    loadFile();
  });

  $('#file-list-container').load('components/splitView_fileList/filelist.html', () => {
    fileList();
  });

};

export default main;
