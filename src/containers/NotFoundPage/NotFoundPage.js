import React, { Component } from 'react';
import { arrayOf, bool, object, string } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useConfiguration } from '../../context/configurationContext';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { FormattedMessage, useIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { createResourceLocatorString } from '../../util/routes';
import { isMainSearchTypeKeywords } from '../../util/search';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import { Heading, Page, LayoutSingleColumn } from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

import SearchForm from './SearchForm/SearchForm';

import css from './NotFoundPage.module.css';

export class NotFoundPageComponent extends Component {
  constructor(props) {
    super(props);
    // The StaticRouter component used in server side rendering
    // provides the context object. We attach a `notfound` flag to
    // the context to tell the server to change the response status
    // code into a 404.
    // eslint-disable-next-line react/destructuring-assignment
    this.props.staticContext.notfound = true;
  }

  render() {
    const {
      routeConfiguration,
      marketplaceName,
      isKeywordSearch,
      intl,
      scrollingDisabled,
      navigate,
    } = this.props;

    const title = intl.formatMessage({
      id: 'NotFoundPage.title',
    });

    const handleSearchSubmit = (values) => {
      const { keywords, location } = values;
      const { search, selectedPlace } = location || {};
      const { origin, bounds } = selectedPlace || {};
      const searchParams = keywords ? { keywords } : { address: search, origin, bounds };
      navigate(createResourceLocatorString('SearchPage', routeConfiguration, {}, searchParams));
    };

    return (
      <Page title={title} scrollingDisabled={scrollingDisabled}>
        <LayoutSingleColumn topbar={<TopbarContainer />} footer={<FooterContainer />}>
          <div className={css.root}>
            <div className={css.content}>
              <div className={css.number}>404</div>
              <Heading as="h1" rootClassName={css.heading}>
                <FormattedMessage id="NotFoundPage.heading" />
              </Heading>
              <p className={css.description}>
                <FormattedMessage id="NotFoundPage.description" values={{ marketplaceName }} />
              </p>
              <SearchForm
                className={css.searchForm}
                isKeywordSearch={isKeywordSearch}
                onSubmit={handleSearchSubmit}
              />
            </div>
          </div>
        </LayoutSingleColumn>
      </Page>
    );
  }
}

NotFoundPageComponent.defaultProps = {
  staticContext: {},
};

NotFoundPageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  marketplaceName: string.isRequired,
  isKeywordSearch: bool.isRequired,

  // The context object from StaticRouter,
  // it should be manually passed if this page is rendered inside other route.
  staticContext: object,

  // from useIntl
  intl: intlShape.isRequired,

  // from useRouteConfiguration
  routeConfiguration: arrayOf(propTypes.route).isRequired,
};

const EnhancedNotFoundPage = (props) => {
  const routeConfiguration = useRouteConfiguration();
  const config = useConfiguration();
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <NotFoundPageComponent
      routeConfiguration={routeConfiguration}
      marketplaceName={config.marketplaceName}
      isKeywordSearch={isMainSearchTypeKeywords(config)}
      navigate={navigate}
      intl={intl}
      {...props}
    />
  );
};

const mapStateToProps = (state) => {
  return {
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const NotFoundPage = compose(connect(mapStateToProps))(EnhancedNotFoundPage);

export default NotFoundPage;
