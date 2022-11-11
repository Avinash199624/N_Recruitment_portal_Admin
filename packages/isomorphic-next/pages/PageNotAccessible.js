import Head from 'next/head';
import React from 'react';
import Link from 'next/link';
import IntlMessages from '@iso/components/utility/intlMessages';
import FourZeroFourStyleWrapper from '../styled/404.styles';
import Image from '@iso/assets/images/rob.png';
function PageNotAccessible() {
  return (
    <FourZeroFourStyleWrapper className='iso404Page'>
      <div className='iso404Content'>
        <h1>
          <IntlMessages id='pageNotAccessible.title' />
        </h1>
        <h3>
          <IntlMessages id='pageNotAccessible.subTitle' />
        </h3>
        <p>
          <IntlMessages id='pageNotAccessible.description' />
        </p>
        <button type='button'>
          <Link href='/dashboard'>
            <a className='isoMenuHolder'>
              <span className='nav-text'>
                <IntlMessages id='pageNotAccessible.backButton' />
              </span>
            </a>
          </Link>
        </button>
      </div>

      <div className='iso404Artwork'>
        <img alt='#' src={Image} />
      </div>
    </FourZeroFourStyleWrapper>
  );
}

export default () => (
  <>
    <Head>
      <title>Page not accessible</title>
    </Head>
    <PageNotAccessible />
  </>
);
