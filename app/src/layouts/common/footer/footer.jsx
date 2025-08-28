/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { uiBuildVersionSelector } from 'controllers/appInfo';
import { FOOTER_EVENTS } from 'components/main/analytics/events';
import { referenceDictionary } from 'common/utils/referenceDictionary';
import { uiBuildVersionSelector } from 'controllers/appInfo';
import { instanceTypeSelector } from 'controllers/appInfo/selectors';
import { EPAM, SAAS } from 'controllers/appInfo/constants';
import styles from './footer.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  buildVersion: uiBuildVersionSelector(state),
  instanceType: instanceTypeSelector(state),
}))
@track()
export class Footer extends Component {
  static propTypes = {
    buildVersion: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    instanceType: PropTypes.string.isRequired,
  };
  render() {
    const { buildVersion, tracking, instanceType } = this.props;
    return (
      <footer className={cx('footer')}>
        <div className={cx('footer-links')}>
          <a href={referenceDictionary.teamsChannel} target="_blank">
            Get Help
          </a>
          SHS:&nbsp;
          <a href={referenceDictionary.shsTerms} target="_blank">
            Terms Of Use
          </a>
          <a href={referenceDictionary.shsPrivacy} target="_blank">
            Privacy Notice
          </a>
          <a
            href={referenceDictionary.rpEpam}
            target="_blank"
            onClick={() => tracking.trackEvent(FOOTER_EVENTS.EPAM_LINK)}
          >
            EPAM
          </a>
          <a
            href={referenceDictionary.rpDoc}
            target="_blank"
            onClick={() => tracking.trackEvent(FOOTER_EVENTS.DOCUMENTATION_LINK)}
          >
            <FormattedMessage id={'Footer.documentation'} defaultMessage={'Documentation'} />
          </a>
          {(instanceType === EPAM || instanceType === SAAS) && (
            <Fragment>
              <a href={referenceDictionary.rpEpamPolicy} target="_blank">
                <FormattedMessage id={'Footer.privacy'} defaultMessage={'Privacy Policy'} />
              </a>
            </Fragment>
          )}
        </div>
        <div className={cx('text-wrapper')}>
          <div className={cx('footer-text')}>
            <FormattedMessage id={'Footer.build'} defaultMessage={'Build'} />
            <span>: {buildVersion}</span>
          </div>
          <div className={cx('footer-text')}>
            <span> &copy; Report Portal {new Date().getFullYear()} </span>
            <FormattedMessage id={'Footer.copyright'} defaultMessage={'All rights reserved'} />
          </div>
        </div>
      </footer>
    );
  }
}
