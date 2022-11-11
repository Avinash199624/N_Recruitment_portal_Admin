import dynamic from 'next/dynamic';

export const createMarkup = (html) => {
  return { __html: html };
};

export const Editor = dynamic(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), { ssr: false });
