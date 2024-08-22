import React from 'react';
import { func, node, string } from 'prop-types';

const PlainForm = (props) => {
  const { children, contentRef, ...restProps } = props;

  const formProps = {
    // These are mainly default values for the server
    // rendering. Otherwise the form would submit potentially
    // sensitive data with the default GET method until the client
    // side code is loaded.
    method: 'post',
    action: '/',

    // allow content ref function to be passed to the form
    ref: contentRef,

    ...restProps,
  };

  return <form {...formProps}>{children}</form>;
};

const Form = (props) => {
  // enforcePagePreloadFor do not work anymore
  const { enforcePagePreloadFor, ...restProps } = props;
  return <PlainForm {...restProps} />;
};

Form.defaultProps = {
  children: null,
  contentRef: null,
  enforcePagePreloadFor: null,
};

Form.propTypes = {
  children: node,
  contentRef: func,
  enforcePagePreloadFor: string,
};

export default Form;
