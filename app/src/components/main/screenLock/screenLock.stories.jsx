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

import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { ScreenLock } from './screenLock';
import README from './README.md';

const withScreenLock = (getStory) => {
  const screenLockRoot =
    document.getElementById('screen-lock-root') || document.createElement('div');
  screenLockRoot.setAttribute('id', 'screen-lock-root');
  document.getElementById('root').parentNode.appendChild(screenLockRoot);
  return getStory();
};

const state = {
  screenLock: {
    visible: true,
  },
};

storiesOf('Components/Main/ScreenLock', module)
  .addDecorator(
    host({
      title: 'ScreenLock component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 150,
      width: 100,
    }),
  )
  .addDecorator(withReadme(README))
  .addDecorator(withScreenLock)
  .add('with pages', () => (
    <WithState state={state}>
      <ScreenLock />
    </WithState>
  ));
