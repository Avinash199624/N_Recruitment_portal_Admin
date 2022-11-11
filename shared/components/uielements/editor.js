import React from 'react';
import dynamic from 'next/dynamic';

export const createMarkup = (html) => {
  return { __html: html };
};

export const EditorDynamic = dynamic(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), { ssr: false });

const Editor = (props) => {
  const toolbar = {
    options: [
      'inline',
      'blockType',
      'fontSize',
      // 'fontFamily',
      'list',
      'textAlign',
      'colorPicker',
      'link',
      // 'embedded',
      // 'emoji',
      'image',
      'remove',
      'history',
    ],
  };

  return <EditorDynamic toolbar={toolbar} {...props} />;
};

export default Editor;
