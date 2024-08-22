import { bool, object, string } from 'prop-types';
import React, { lazy } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import NotFoundPage from '../NotFoundPage/NotFoundPage';

const PageBuilder = lazy(() => import('../PageBuilder/PageBuilder'));

export const CMSPageComponent = (props) => {
  const { pageAssetsData, inProgress, error, pageId } = props;
  const params = useParams();
  const selectedId = params.pageId || pageId;

  if (!inProgress && error?.status === 404) {
    return <NotFoundPage />;
  }

  return (
    <PageBuilder
      pageAssetsData={pageAssetsData?.[selectedId]?.data}
      inProgress={inProgress}
      schemaType="Article"
    />
  );
};

CMSPageComponent.propTypes = {
  pageAssetsData: object,
  inProgress: bool,
  error: object,
  pageId: string,
};

const mapStateToProps = (state) => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  return { pageAssetsData, inProgress, error };
};

const CMSPage = connect(mapStateToProps)(CMSPageComponent);

export default CMSPage;
