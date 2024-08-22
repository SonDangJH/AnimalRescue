import PropTypes, { bool, elementType, string } from 'prop-types';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { NamedRedirect } from '../components';

const WithAuthCheck = ({
  component: Component,
  auth = false,
  authPage = 'SignupPage',
  extraProps = {},
}) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const canShow = auth ? isAuthenticated : true;
  const location = useLocation();
  return canShow ? (
    <Component {...extraProps} />
  ) : (
    <NamedRedirect
      name={authPage}
      state={{
        from: location.pathname,
      }}
    />
  );
};

WithAuthCheck.propTypes = {
  component: elementType.isRequired,
  auth: bool,
  authPage: string,
  extraProps: PropTypes.object,
};

export default WithAuthCheck;
