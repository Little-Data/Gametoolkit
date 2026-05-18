import React from 'react';
import Layout from '@theme-original/Layout';
import BackToTopButton from '@site/src/components/BackToTopButton';

export default function LayoutWrapper(props) {
  return (
    <>
      <Layout {...props} />
      <BackToTopButton />
    </>
  );
}