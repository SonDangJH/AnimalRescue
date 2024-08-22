/**
 * This component wraps React-Router's Link by providing name-based routing.
 *
 * The `name` prop should match a route in the flattened
 * routeConfiguration passed in context by the RoutesProvider
 * component. The `params` props is the route params for the route
 * path of the given route name.
 *
 * The `to` prop is an object with the same shape as Link requires,
 * but without `pathname` that will be generated from the given route
 * name.
 *
 * Some additional props can be passed for the <a> element like
 * `className` and `style`.
 *
 * The component can also be given the `activeClassName` prop that
 * will be added to the element className if the current URL matches
 * the one in the generated pathname of the link.
 */
import React from 'react';
import { any, object, string } from 'prop-types';
import { Link, useMatch } from 'react-router-dom';
import classNames from 'classnames';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { pathByRouteName } from '../../util/routes';

const NamedLink = ({
  activeClassName = 'NamedLink_active',
  children,
  className,
  name,
  params = {},
  style = {},
  title,
  to = {},
}) => {
  const routeConfiguration = useRouteConfiguration();

  const pathname = pathByRouteName(name, routeConfiguration, params);
  const matched = useMatch(pathname);
  const active = matched?.pathname === pathname;

  const aElemProps = {
    className: classNames(className, { [activeClassName]: active }),
    style,
    title,
  };

  // Remove `state` from `to` object to avoid passing it to the `Link` component
  const { state, ...restTo } = to;

  return (
    <Link unstable_viewTransition state={state} to={{ pathname, ...restTo }} {...aElemProps}>
      {children}
    </Link>
  );
};

NamedLink.propTypes = {
  activeClassName: string,
  // eslint-disable-next-line react/forbid-prop-types
  children: any,
  className: string,
  name: string.isRequired,
  params: object,
  style: object,
  title: string,
  to: object,
};

NamedLink.displayName = 'NamedLink';

export default NamedLink;
