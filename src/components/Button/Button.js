import React, { useEffect, useState } from 'react';
import { bool, node, string } from 'prop-types';
import classNames from 'classnames';
import IconSpinner from '../IconSpinner/IconSpinner';
import IconCheckmark from '../IconCheckmark/IconCheckmark';

import css from './Button.module.css';

const PlainButton = (props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    children,
    className,
    rootClassName,
    spinnerClassName,
    checkmarkClassName,
    inProgress,
    ready,
    disabled,
    enforcePagePreloadFor,
    ...rest
  } = props;

  const rootClass = rootClassName || css.root;
  const classes = classNames(rootClass, className, {
    [css.ready]: ready,
    [css.inProgress]: inProgress,
  });

  let content;

  if (inProgress) {
    content = <IconSpinner rootClassName={spinnerClassName || css.spinner} />;
  } else if (ready) {
    content = <IconCheckmark rootClassName={checkmarkClassName || css.checkmark} />;
  } else {
    content = children;
  }

  // All buttons are disabled until the component is mounted. This
  // prevents e.g. being able to submit forms to the backend before
  // the client side is handling the submit.
  const buttonDisabled = mounted ? disabled : true;

  return (
    <button className={classes} {...rest} disabled={buttonDisabled}>
      {content}
    </button>
  );
};

const Button = (props) => {
  // enforcePagePreloadFor do not work anymore
  const { enforcePagePreloadFor, ...restProps } = props;
  return <PlainButton {...restProps} />;
};

Button.defaultProps = {
  rootClassName: null,
  className: null,
  spinnerClassName: null,
  checkmarkClassName: null,
  inProgress: false,
  ready: false,
  disabled: false,
  enforcePagePreloadFor: null,
  children: null,
};

Button.propTypes = {
  rootClassName: string,
  className: string,
  spinnerClassName: string,
  checkmarkClassName: string,

  inProgress: bool,
  ready: bool,
  disabled: bool,
  enforcePagePreloadFor: string,

  children: node,
};

export default Button;

export const PrimaryButton = props => {
  const classes = classNames(props.rootClassName || css.primaryButtonRoot, css.primaryButton);
  return <Button {...props} rootClassName={classes} />;
};
PrimaryButton.displayName = 'PrimaryButton';

export const PrimaryButtonInline = props => {
  const classes = classNames(props.rootClassName || css.primaryButtonInlineRoot, css.primaryButton);
  return <Button {...props} rootClassName={classes} />;
};
PrimaryButtonInline.displayName = 'PrimaryButtonInline';

export const SecondaryButton = props => {
  const classes = classNames(props.rootClassName || css.secondaryButtonRoot, css.secondaryButton);
  return <Button {...props} rootClassName={classes} />;
};
SecondaryButton.displayName = 'SecondaryButton';

export const SecondaryButtonInline = props => {
  const classes = classNames(
    props.rootClassName || css.secondaryButtonInlineRoot,
    css.secondaryButtonInline
  );
  return <Button {...props} rootClassName={classes} />;
};
SecondaryButton.displayName = 'SecondaryButton';

export const InlineTextButton = props => {
  const classes = classNames(props.rootClassName || css.inlineTextButtonRoot, css.inlineTextButton);
  return <Button {...props} rootClassName={classes} />;
};
InlineTextButton.displayName = 'InlineTextButton';

export const SocialLoginButton = props => {
  const classes = classNames(props.rootClassName || css.socialButtonRoot, css.socialButton);
  return <Button {...props} rootClassName={classes} />;
};

SocialLoginButton.displayName = 'SocialLoginButton';
