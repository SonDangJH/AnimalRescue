/**
 * This component wraps React-Router's Redirect by providing name-based routing.
 * (Helps to narrow down the scope of possible format changes to routes.)
 */
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { pathByRouteName } from '../../util/routes';

const NamedRedirect = (props) => {
  const routeConfiguration = useRouteConfiguration();
  const { name, search, state, params, push } = props;
  const pathname = pathByRouteName(name, routeConfiguration, params);
  const navigate = useNavigate();

  useEffect(() => {
    navigate(
      {
        pathname,
        search,
      },
      {
        state,
        replace: !push,
        unstable_viewTransition: true,
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, push, search, state]);

  return null;
};

const { bool, object, string } = PropTypes;

NamedRedirect.defaultProps = { search: '', state: {}, push: false, params: {} };

NamedRedirect.propTypes = {
  name: string.isRequired,
  search: string,
  state: object,
  push: bool,
  params: object,
};

export default NamedRedirect;
