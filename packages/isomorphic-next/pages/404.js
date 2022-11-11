import Head from 'next/head';
import React from 'react';
import IntlMessages from '@iso/components/utility/intlMessages';
import FourZeroFourStyleWrapper from '../styled/404.styles';
import Image from '@iso/assets/images/rob.png';
import Router from 'next/router';

const FourZeroFour = () => {
  return (
    <FourZeroFourStyleWrapper className='iso404Page'>
      <div className='iso404Content'>
        <h1>
          <IntlMessages id='page404.title' />
        </h1>
        <h3>
          <IntlMessages id='page404.subTitle' />
        </h3>
        <p>
          <IntlMessages id='page404.description' />
        </p>
        <button type='button' onClick={() => Router.back()}>
          <a className='isoMenuHolder'>
            <span className='nav-text'>
              <IntlMessages id='page404.backButton' />
            </span>
          </a>
        </button>
      </div>

      <div className='iso404Artwork'>
        <img alt='#' src={Image} />
      </div>
    </FourZeroFourStyleWrapper>
  );
};

export default () => (
  <>
    <Head>
      <title>404</title>
    </Head>
    <FourZeroFour />
  </>
);
